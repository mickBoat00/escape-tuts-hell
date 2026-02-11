from datetime import datetime
from typing import Annotated, Optional, Literal, List

from bson import ObjectId
from pydantic import BaseModel, Field, BeforeValidator
from enum import Enum

PyObjectId = Annotated[str, BeforeValidator(str)]


class FileDataRequest(BaseModel):
    fileName: str
    fileSize: int
    fileDuration: int
    contentType: str


class JobState(str, Enum):
    pending = "pending"
    running = "running"
    retrying = "retrying"
    completed = "completed"
    failed = "failed"


class TutorialStatus(str, Enum):
    uploading = "uploading"
    processing = "processing"
    retrying = "retrying"
    completed = "completed"
    failed = "failed"


class JobStatus(BaseModel):
    transcription: JobState = JobState.pending
    codingTutorialCheck: JobState = JobState.pending
    tutorialQA: JobState = JobState.pending
    codingChallenge: JobState = JobState.pending
    followAlongGuide: JobState = JobState.pending


class JobError(BaseModel):
    transcription: Optional[str] = None
    codingTutorialCheck: Optional[str] = None
    tutorialQA: Optional[str] = None
    codingChallenge: Optional[str] = None
    followAlongGuide: Optional[str] = None


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
    id: str = Field(description="Option identifier such as A, B, C, D")
    text: str = Field(description="Answer option text derived from the transcript")


class InterviewQuestion(BaseModel):
    question: str = Field(description="Interview-style multiple-choice question")
    options: List[AnswerOption] = Field(min_items=4, max_items=4)
    correct_answer_ids: List[str] = Field(min_items=1)
    transcript_evidence: List[str] = Field(
        description="Exact transcript sentences proving the answer"
    )


class CodingInterviewQA(BaseModel):
    questions: List[InterviewQuestion] = Field(max_items=10)


class TestCase(BaseModel):
    description: str
    command: str
    expected_output: str


class StepContent(BaseModel):
    step_number: int
    title: str
    goal: str
    description: str
    related_requirements: List[int]
    test_cases: List[TestCase]


class Requirement(BaseModel):
    id: int
    description: str


class Extension(BaseModel):
    title: str
    description: str


class CodingChallengeOutput(BaseModel):
    challenge_title: str
    introduction: str
    real_world_relevance: str
    background: str
    requirements: List[Requirement]
    steps: List[StepContent]
    going_further: List[Extension]
    final_deliverable: str


class Hint(BaseModel):
    """Progressive hint system - reveal only when user is stuck"""
    level: int = Field(
        description="Hint difficulty: 1 (vague nudge) → 3 (explicit guidance)",
        ge=1,
        le=3
    )
    text: str = Field(
        description="The hint text, increasingly explicit with higher levels"
    )


class Validation(BaseModel):
    """Clear success criteria for step completion"""
    check: str = Field(
        description="Simple instruction to verify completion (e.g., 'Run the app and visit localhost:8000')"
    )
    expected: List[str] = Field(
        description="What the user should observe when done correctly",
        min_items=1,
        max_items=3
    )


class Step(BaseModel):
    """Single actionable step in the guide"""
    number: int = Field(description="Step number within the milestone")
    
    what: str = Field(
        description="Clear, action-oriented title (e.g., 'Create the User model')"
    )
    
    why: str = Field(
        description="One sentence explaining the purpose of this step"
    )
    
    how: str = Field(
        description="Concise instructions on what to do (2-4 sentences max). Guide, don't code."
    )
    
    validation: Validation = Field(
        description="How to verify this step is complete"
    )
    
    hints: List[Hint] = Field(
        default_factory=list,
        description="Progressive hints (0-3 hints). Only shown if user requests help.",
        max_items=3
    )


class Milestone(BaseModel):
    """Group of related steps forming a logical phase"""
    number: int = Field(description="Milestone number (1, 2, 3...)")
    
    title: str = Field(
        description="Phase name (e.g., 'Setup', 'Core Features', 'Testing')"
    )
    
    outcome: str = Field(
        description="What will be working after completing this milestone"
    )
    
    steps: List[Step] = Field(
        description="Steps in this milestone (typically 2-5 steps)",
        min_items=1,
        max_items=6
    )


class FollowAlongGuide(BaseModel):
    """Streamlined guide for building the tutorial project"""
    
    title: str = Field(
        description="What you'll build (e.g., 'Task Manager API')"
    )
    
    summary: str = Field(
        description="One paragraph describing the project and what you'll learn"
    )
    
    before_you_start: List[str] = Field(
        description="Prerequisites: tools, knowledge, and accounts needed",
        max_items=5
    )
    
    milestones: List[Milestone] = Field(
        description="Phases of the build (typically 3-5 milestones)",
        min_items=2,
        max_items=5
    )
    
    whats_next: List[str] = Field(
        description="2-3 ideas for extending the project",
        max_items=3,
        default_factory=list
    )


class TutorialModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    inputUrl: str
    fileName: str
    fileSize: int
    fileDuration: Optional[float] = None
    fileFormat: str
    mimeType: str

    status: TutorialStatus = TutorialStatus.uploading
    jobStatus: JobStatus = JobStatus()

    error: Optional[Error] = None
    jobError: JobError = Field(default_factory=JobError)

    transcript: Optional[Transcript] = None
    codingTutorialCheck: Optional[CodingTutorialCheck] = None
    tutorialQA: Optional[CodingInterviewQA] = None
    codingChallenge: Optional[CodingChallengeOutput] = None
    followAlongGuide: Optional[FollowAlongGuide] = None

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