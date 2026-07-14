from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    role = Column(String, default="mahasiswa")
    phone_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    quiz_attempts = relationship("QuizAttempt", back_populates="user")
    progress = relationship("UserProgress", back_populates="user")

    progress = relationship("UserProgress", back_populates="user")
    class_memberships = relationship("ClassMember", back_populates="user")
    created_tokens = relationship("ClassToken", back_populates="dosen")

class ClassToken(Base):
    __tablename__ = "class_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    dosen_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Integer, default=1) # 1 true, 0 false

    dosen = relationship("User", back_populates="created_tokens")
    members = relationship("ClassMember", back_populates="token_assoc")

class ClassMember(Base):
    __tablename__ = "class_members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    token_id = Column(Integer, ForeignKey("class_tokens.id"))
    joined_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="class_memberships")
    token_assoc = relationship("ClassToken", back_populates="members")

class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    order_index = Column(Integer)

    submodules = relationship("SubModule", back_populates="module")


class SubModule(Base):
    __tablename__ = "submodules"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"))
    title = Column(String)
    concept = Column(String)
    formula = Column(String)
    order_index = Column(Integer)

    module = relationship("Module", back_populates="submodules")
    quiz_attempts = relationship("QuizAttempt", back_populates="submodule")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    submodule_id = Column(Integer, ForeignKey("submodules.id"), nullable=True)
    score = Column(Float)
    topic_breakdown = Column(JSON)
    attempt_date = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="quiz_attempts")
    submodule = relationship("SubModule", back_populates="quiz_attempts")


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    topic_name = Column(String, index=True)
    mastery_level = Column(Float, default=0.0)
    last_updated = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="progress")
