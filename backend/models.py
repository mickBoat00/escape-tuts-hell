

from datetime import datetime
from typing import Annotated, Optional,Literal, List

from bson import ObjectId
from pydantic import BaseModel, Field, BeforeValidator


class FileDataRequest(BaseModel):
    fileName: str
    fileSize: int
    fileDuration: int
    contentType: str

PyObjectId = Annotated[str, BeforeValidator(str)]

class JobStatus(BaseModel):
    transcription: Literal['pending', 'running', 'completed', 'failed'] = 'pending'
    codingTutorialCheck: Literal['pending', 'running', 'completed', 'failed'] = 'pending'
    tutorialQA: Literal['pending', 'running', 'completed', 'failed'] = 'pending'
    codingChallenge: Literal['pending', 'running', 'completed', 'failed'] = 'pending'    
    summary: Literal['pending', 'running', 'completed', 'failed'] = 'pending'    


class JobError(BaseModel):
    transcription: Optional[str] = None
    codingTutorialCheck: Optional[str] = None
    tutorialQA: Optional[str] = None
    codingChallenge: Optional[str] = None
    summary: Optional[str] = None


class Error(BaseModel):
    message: Optional[str] = None
    step: Optional[str] = None
    timestamp: Optional[datetime] = None


class Transcript(BaseModel):
    text: Optional[str] = None


class CodingTutorialCheck(BaseModel):
    isCodingTutorial: bool
    reason: str 


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


class TestCase(BaseModel):
    description: str = Field(description="What this test verifies")
    command: str = Field(description="Command, request, or action to perform")
    expected_output: str = Field(description="Expected result or observable behavior")


class StepContent(BaseModel):
    step_number: int = Field(description="Step number (0 for setup, 1+ for implementation steps)")
    title: str = Field(description="Short descriptive title for the step")
    goal: str = Field(description="What this step accomplishes")
    description: str = Field(description="Detailed explanation of how to implement this step")
    related_requirements: List[int] = Field(
        description="Indexes of requirements this step helps fulfill"
    )
    test_cases: List[TestCase] = Field(
        description="How to verify this step is correctly implemented"
    )


class Requirement(BaseModel):
    id: int = Field(description="Unique requirement ID")
    description: str = Field(
        description="User-facing functional requirement written in plain language"
    )


class Extension(BaseModel):
    title: str = Field(description="Title of the extension")
    description: str = Field(description="What the extension adds or explores")


class CodingChallengeOutput(BaseModel):
    challenge_title: str = Field(description="Title of the coding challenge")

    introduction: str = Field(
        description="Engaging explanation of what will be built and why"
    )

    real_world_relevance: str = Field(
        description="Why this challenge matters in real-world software development"
    )

    background: str = Field(
        description="Concepts, prerequisites, and optional learning resources"
    )

    requirements: List[Requirement] = Field(
        description="List of functional requirements the final application must satisfy",
        min_items=3
    )

    steps: List[StepContent] = Field(
        description="Progressive implementation steps that fulfill the requirements",
        min_items=3,
        max_items=7
    )

    going_further: List[Extension] = Field(
        description="Optional enhancements and advanced explorations"
    )

    final_deliverable: str = Field(
        description="Clear description of the completed working application"
    )



class TutorialModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    inputUrl: str
    fileName: str
    fileSize: int
    fileDuration: Optional[float] = None
    fileFormat: str
    mimeType: str
    status: Literal[
        'uploading', 
        'uploaded', 
        'processing', 
        'completed', 
        'failed'
    ] = 'uploading'

    jobStatus: JobStatus = Field(default_factory=JobStatus)

    error: Optional[Error] = None
    jobError: JobError = Field(default_factory=JobError)

    transcript: Optional[Transcript] = None
    codingTutorialCheck: Optional[CodingTutorialCheck] = None
    tutorialQA: Optional[CodingInterviewQA] = None
    codingChallenge: Optional[CodingChallengeOutput] = None

    createdAt: datetime
    updatedAt: Optional[datetime] = None
    completedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }
