from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class UserBase(BaseModel):
    email: str
    name: str
    role: str = "mahasiswa"
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class SubModuleBase(BaseModel):
    title: str
    concept: str
    formula: str
    order_index: int

class SubModule(SubModuleBase):
    id: int
    module_id: int
    class Config:
        from_attributes = True

class ModuleBase(BaseModel):
    title: str
    description: str
    order_index: int

class Module(ModuleBase):
    id: int
    submodules: List[SubModule] = []
    class Config:
        from_attributes = True

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class QuizSubmit(BaseModel):
    submodule_id: Optional[int] = None
    answers: Optional[Dict[str, str]] = None
    score: float
    topic_name: str

class PretestSubmit(BaseModel):
    scores: Dict[str, float]

class UserProgress(BaseModel):
    topic_name: str
    mastery_level: float
    class Config:
        from_attributes = True

class ClassTokenCreate(BaseModel):
    validity_hours: int

class ClassTokenResponse(BaseModel):
    id: int
    token: str
    expires_at: Optional[datetime] = None
    is_active: int
    class Config:
        from_attributes = True

class JoinClassRequest(BaseModel):
    token: str

class DosenClassResponse(BaseModel):
    id: int
    token: str
    expires_at: Optional[datetime]
    is_active: int
    student_count: int

class StudentScore(BaseModel):
    topic: str
    score: float

class DosenStudentResponse(BaseModel):
    id: int
    name: str
    email: str
    scores: List[StudentScore]
    joined_at: datetime
    token: str
    phone_number: Optional[str] = None
