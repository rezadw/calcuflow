import os
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from anthropic import Anthropic
import uvicorn
from . import models, schemas, database

# Create tables for sqlite (since we use it as fallback)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="CalcuFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173"), "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/auth/register", response_model=schemas.User)
def register(user_in: schemas.UserCreate, db: Session = Depends(database.get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = models.User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        name=user_in.name,
        role=user_in.role,
        phone_number=user_in.phone_number
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
            
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.get("/modules", response_model=list[schemas.Module])
def get_modules(db: Session = Depends(database.get_db)):
    modules = db.query(models.Module).order_by(models.Module.order_index).all()
    if not modules:
        # Seed dummy data
        mod1 = models.Module(title="BAB 1: Limit Fungsi", description="Basic limit", order_index=1)
        db.add(mod1)
        db.commit()
        db.refresh(mod1)
        sub1 = models.SubModule(module_id=mod1.id, title="Konsep Dasar Limit", concept="Mock concept from API", formula="\\lim_{x \\to a} f(x) = L", order_index=1)
        db.add(sub1)
        db.commit()
        modules = db.query(models.Module).all()
    return modules

@app.post("/quiz/submit")
def submit_quiz(data: schemas.QuizSubmit, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    score = data.score
    attempt = models.QuizAttempt(user_id=current_user.id, submodule_id=data.submodule_id, score=score, topic_breakdown={data.topic_name: score})
    db.add(attempt)
    
    # Update or Create UserProgress for this topic
    prog = db.query(models.UserProgress).filter(
        models.UserProgress.user_id == current_user.id,
        models.UserProgress.topic_name == data.topic_name
    ).first()
    
    if prog:
        prog.mastery_level = max(prog.mastery_level, score)
    else:
        prog = models.UserProgress(user_id=current_user.id, topic_name=data.topic_name, mastery_level=score)
        db.add(prog)
        
    db.commit()
    return {"message": "Quiz submitted", "score": score, "topic_breakdown": {data.topic_name: score}}

@app.get("/user/progress", response_model=list[schemas.UserProgress])
def get_user_progress(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    progress = db.query(models.UserProgress).filter(models.UserProgress.user_id == current_user.id).all()
    return progress

@app.post("/user/pretest")
def submit_pretest(data: schemas.PretestSubmit, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    # Create UserProgress records for all topics based on pretest scores
    for topic, score in data.scores.items():
        prog = models.UserProgress(user_id=current_user.id, topic_name=topic, mastery_level=score)
        db.add(prog)
    db.commit()
    return {"message": "Pretest submitted successfully"}

@app.post("/class/token", response_model=schemas.ClassTokenResponse)
def generate_class_token(data: schemas.ClassTokenCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    if current_user.role != "dosen":
        raise HTTPException(status_code=403, detail="Hanya dosen yang dapat membuat token kelas")
    import random
    import string
    token_str = "CALCU-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    
    expires = None
    if data.validity_hours > 0:
        expires = datetime.utcnow() + timedelta(hours=data.validity_hours)
        
    db_token = models.ClassToken(
        token=token_str,
        dosen_id=current_user.id,
        expires_at=expires
    )
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token

@app.get("/user/status")
def get_user_status(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    if current_user.role == "dosen":
        return {"is_enrolled": True, "role": current_user.role} # Dosen is always 'enrolled' in their own dashboard
        
    is_enrolled = db.query(models.ClassMember).filter(models.ClassMember.user_id == current_user.id).first() is not None
    return {"is_enrolled": is_enrolled, "role": current_user.role}

@app.post("/class/join")
def join_class(data: schemas.JoinClassRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    db_token = db.query(models.ClassToken).filter(models.ClassToken.token == data.token).first()
    if not db_token or db_token.is_active == 0:
        raise HTTPException(status_code=400, detail="Token tidak valid")
    
    if db_token.expires_at and db_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token sudah kedaluwarsa")
        
    existing = db.query(models.ClassMember).filter(
        models.ClassMember.user_id == current_user.id,
        models.ClassMember.token_id == db_token.id
    ).first()
    if existing:
        return {"message": "Sudah bergabung di kelas ini"}
        
    member = models.ClassMember(user_id=current_user.id, token_id=db_token.id)
    db.add(member)
    db.commit()
    return {"message": "Berhasil bergabung ke kelas!"}

@app.delete("/class/token/{token_id}")
def deactivate_class_token(token_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    if current_user.role != "dosen":
        raise HTTPException(status_code=403, detail="Akses ditolak")
    token = db.query(models.ClassToken).filter(models.ClassToken.id == token_id, models.ClassToken.dosen_id == current_user.id).first()
    if not token:
        raise HTTPException(status_code=404, detail="Token tidak ditemukan")
    token.is_active = False
    db.commit()
    return {"message": "Token berhasil dinonaktifkan"}

@app.get("/dosen/classes", response_model=List[schemas.DosenClassResponse])
def get_dosen_classes(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    if current_user.role != "dosen":
        raise HTTPException(status_code=403, detail="Akses ditolak")
    
    classes = db.query(models.ClassToken).filter(models.ClassToken.dosen_id == current_user.id).all()
    result = []
    for c in classes:
        student_count = db.query(models.ClassMember).filter(models.ClassMember.token_id == c.id).count()
        result.append({
            "id": c.id,
            "token": c.token,
            "expires_at": c.expires_at,
            "is_active": c.is_active,
            "student_count": student_count
        })
    return result

@app.get("/dosen/students", response_model=List[schemas.DosenStudentResponse])
def get_dosen_students(current_user: models.User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    if current_user.role != "dosen":
        raise HTTPException(status_code=403, detail="Akses ditolak")
    
    # Get all tokens for this dosen
    dosen_tokens = db.query(models.ClassToken.id, models.ClassToken.token).filter(models.ClassToken.dosen_id == current_user.id).all()
    token_ids = [t.id for t in dosen_tokens]
    token_map = {t.id: t.token for t in dosen_tokens}
    
    if not token_ids:
        return []
        
    # Get all members in these tokens
    members = db.query(models.ClassMember).filter(models.ClassMember.token_id.in_(token_ids)).all()
    
    result = []
    for member in members:
        user = db.query(models.User).filter(models.User.id == member.user_id).first()
        if not user:
            continue
            
        # Optional: Get scores from quiz attempts or user_progress
        # Here we just mock topics for simplicity, or we could fetch from QuizAttempt
        # Assuming topics: Limit, Turunan Dasar, Aturan Rantai, Integral Substitusi, Integral Parsial, Barisan
        topics = ['Limit', 'Turunan Dasar', 'Aturan Rantai', 'Integral Substitusi', 'Integral Parsial', 'Barisan']
        scores = []
        for topic in topics:
            # Check user_progress for this topic
            prog = db.query(models.UserProgress).filter(
                models.UserProgress.user_id == user.id,
                models.UserProgress.topic_name == topic
            ).first()
            scores.append({
                "topic": topic,
                "score": prog.mastery_level if prog else 0.0
            })
            
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "scores": scores,
            "joined_at": member.joined_at,
            "token": token_map[member.token_id],
            "phone_number": user.phone_number
        })
        
    return result

@app.post("/calcumind/chat")
async def calcumind_chat(request: schemas.ChatRequest, current_user: models.User = Depends(get_current_user)):
    api_key = os.getenv("GEMINI_API_KEY")
    
    # Use smart mocks if no real API key is present
    if not api_key or api_key == "dummy_key" or api_key.strip() == "":
        user_message = request.messages[-1].content.lower() if request.messages else ""
        if "turunan" in user_message:
            reply = "Tentu, mari kita bahas turunan. Apa yang kamu ketahui tentang aturan pangkat (power rule) pada turunan?"
        elif "limit" in user_message:
            reply = "Limit adalah dasar dari kalkulus! Coba bayangkan nilai x semakin mendekati suatu angka, tapi tidak pernah menyentuhnya. Bagaimana menurutmu kita mengevaluasinya?"
        elif "integral" in user_message:
            reply = "Integral itu ibarat kebalikan dari turunan. Kalau turunan mencari gradien, integral mencari luasan. Sudah coba menyelesaikan persamaannya sejauh mana?"
        else:
            reply = "Wah, pertanyaan yang bagus! CalcuMind siap membantu. Sebelum saya memberi tahu solusinya, apa pendapatmu tentang langkah pertama yang harus dilakukan?"
        return {"reply": reply}

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        
        system_prompt = "You are CalcuMind, a Socratic math tutor for Indonesian university students learning calculus. Never give the answer directly. Always ask guiding questions first. If the student is stuck, give progressive hints — one at a time. Only confirm or correct after the student has attempted the solution themselves. Always respond in Indonesian."
        
        model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=system_prompt)
        
        # Convert messages to Gemini format
        history = []
        for msg in request.messages[:-1]:
            role = "user" if msg.role == "user" else "model"
            history.append({"role": role, "parts": [msg.content]})
            
        chat = model.start_chat(history=history)
        response = chat.send_message(request.messages[-1].content)
        
        return {"reply": response.text}
    except Exception as e:
        return {"reply": f"Maaf, saat ini AI Tutor sedang mengalami gangguan koneksi ke server Gemini. (Error: {str(e)})"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
