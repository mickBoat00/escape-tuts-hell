from datetime import datetime
from typing import Annotated, Optional, List

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
    summary: JobState = JobState.pending


class JobError(BaseModel):
    transcription: Optional[str] = None
    codingTutorialCheck: Optional[str] = None
    tutorialQA: Optional[str] = None
    codingChallenge: Optional[str] = None
    followAlongGuide: Optional[str] = None
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
    level: int = Field(
        description="Hint difficulty: 1 = nudge, 2 = guidance, 3 = explicit help"
    )
    text: str


class Validation(BaseModel):
    check: str
    expected: List[str]


class Step(BaseModel):
    number: int
    what: str
    why: str
    how: str
    outcome: Optional[str] = None
    validation: Validation
    hints: Optional[List[Hint]] = None


class Milestone(BaseModel):
    number: int
    title: str
    outcome: str
    steps: List[Step]


class FollowAlongGuide(BaseModel):
    title: str
    summary: str
    before_you_start: Optional[List[str]] = None
    milestones: List[Milestone]
    whats_next: Optional[List[str]] = None

class Summary(BaseModel):
    text: str = Field(
        description="Summary transcript in a maximum of 6 sentences."
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
    summary: Optional[Summary] = None

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


class RetryRequest(BaseModel):
    tutorialId: str
    jobName: str 