from pydantic import BaseModel, Field
from typing import List


class AnswerOption(BaseModel):
    id: str = Field(
        description="Option identifier such as A, B, C, D"
    )
    text: str = Field(
        description="Answer option text taken directly or clearly derived from the transcript"
    )


class InterviewQuestion(BaseModel):
    question: str = Field(
        description="A clear, interview-style multiple-choice question derived from the transcript"
    )

    options: List[AnswerOption] = Field(
        description="Exactly four possible answer options",
        min_items=4,
        max_items=4
    )

    correct_answer_ids: List[str] = Field(
        description="IDs of the correct answers (can be one or multiple, e.g. ['A', 'C'])",
        min_items=1
    )

    transcript_evidence: List[str] = Field(
        description="Exact sentence(s) copied verbatim from the transcript proving the correct answers"
    )


class CodingInterviewQA(BaseModel):
    questions: List[InterviewQuestion] = Field(
        description="List of up to 10 multiple-choice interview questions based strictly on the transcript",
        max_items=10
    )
