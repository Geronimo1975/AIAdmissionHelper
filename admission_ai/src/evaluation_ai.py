import openai
from dotenv import load_dotenv
import os

load_dotenv()

# Initialize OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY")

def evaluate_interview_answer(answer: str) -> dict:
    """
    Evaluate a candidate's interview answer using OpenAI GPT.
    
    Args:
        answer (str): The candidate's answer to evaluate
        
    Returns:
        dict: Evaluation results including score and feedback
    """
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert medical school interviewer. Evaluate the following answer based on content, clarity, and professionalism."
                },
                {"role": "user", "content": answer}
            ]
        )
        
        evaluation = response.choices[0].message.content
        return {
            "evaluation": evaluation,
            "success": True
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def analyze_interview_recording(transcript: str) -> dict:
    """
    Analyze a complete interview transcript and provide comprehensive feedback.
    
    Args:
        transcript (str): The complete interview transcript
        
    Returns:
        dict: Analysis results including scores and detailed feedback
    """
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "Analyze this medical school interview and provide scores (1-10) for: communication skills, medical knowledge, ethical reasoning, and professionalism. Include specific feedback for improvement."
                },
                {"role": "user", "content": transcript}
            ]
        )
        
        analysis = response.choices[0].message.content
        return {
            "analysis": analysis,
            "success": True
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
