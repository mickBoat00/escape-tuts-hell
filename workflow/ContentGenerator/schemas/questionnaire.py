from pydantic import BaseModel, Field
from typing import List


class InterviewQuestion(BaseModel):
    question: str = Field(
        description="A common technical interview question derived from the transcript"
    )
    answer: str = Field(
        description="Exact sentence(s) copied verbatim from the transcript that answer the question"
    )


class CodingInterviewQA(BaseModel):
    questions: List[InterviewQuestion] = Field(
        description="List of up to 10 interview questions and transcript-backed answers"
    )
