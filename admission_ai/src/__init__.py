# Make the src directory a Python package
from .evaluation_ai import evaluate_interview_answer, analyze_interview_recording
from .models import User, University, Application, Message, Interview
from .database import init_db, get_db
