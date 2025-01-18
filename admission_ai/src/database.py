from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

# Get database URL from environment variable
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Create database engine
engine = create_engine(DATABASE_URL)

# Create session factory
session_factory = sessionmaker(bind=engine)
Session = scoped_session(session_factory)

# Create base class for declarative models
Base = declarative_base()

def init_db():
    """Initialize the database, creating all tables."""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Get a database session."""
    db = Session()
    try:
        yield db
    finally:
        db.close()
