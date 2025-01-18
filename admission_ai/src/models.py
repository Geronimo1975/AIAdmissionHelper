from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(255), unique=True, nullable=False)
    password = Column(String, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    role = Column(String(50), default='candidate')
    gdpr_consent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    applications = relationship("Application", back_populates="user")
    messages = relationship("Message", back_populates="user")

class University(Base):
    __tablename__ = 'universities'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    country = Column(String(100), nullable=False)
    requirements = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    applications = relationship("Application", back_populates="university")

class Application(Base):
    __tablename__ = 'applications'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    university_id = Column(Integer, ForeignKey('universities.id'))
    status = Column(String(50), default='pending')
    documents = Column(JSON)
    interview_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="applications")
    university = relationship("University", back_populates="applications")
    interviews = relationship("Interview", back_populates="application")

class Message(Base):
    __tablename__ = 'messages'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    content = Column(String, nullable=False)
    channel = Column(String(50), nullable=False)  # web, whatsapp, voice
    direction = Column(String(50), nullable=False)  # inbound, outbound
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="messages")

class Interview(Base):
    __tablename__ = 'interviews'
    
    id = Column(Integer, primary_key=True)
    application_id = Column(Integer, ForeignKey('applications.id'))
    recording_url = Column(String)
    feedback = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    application = relationship("Application", back_populates="interviews")
