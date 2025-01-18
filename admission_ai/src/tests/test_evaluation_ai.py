import pytest
from admission_ai.src.evaluation_ai import evaluate_interview_answer, analyze_interview_recording

def test_evaluate_interview_answer():
    sample_answer = "I want to become a doctor because I am passionate about helping others and have always been fascinated by medical science."
    result = evaluate_interview_answer(sample_answer)
    assert result["success"] == True
    assert "evaluation" in result

def test_analyze_interview_recording():
    sample_transcript = """
    Interviewer: Why do you want to study medicine?
    Candidate: I have always been drawn to medicine because it combines my love for science with my desire to help others.
    Interviewer: How do you handle stress?
    Candidate: I maintain a healthy work-life balance through exercise and meditation.
    """
    result = analyze_interview_recording(sample_transcript)
    assert result["success"] == True
    assert "analysis" in result

def test_invalid_openai_key():
    import os
    original_key = os.getenv("OPENAI_API_KEY")
    os.environ["OPENAI_API_KEY"] = "invalid_key"

    result = evaluate_interview_answer("test answer")
    assert result["success"] == False
    assert "error" in result

    if original_key:
        os.environ["OPENAI_API_KEY"] = original_key