

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


class Error(BaseModel):
    message: Optional[str] = None
    step: Optional[str] = None
    timestamp: Optional[datetime] = None


class Transcript(BaseModel):
    text: Optional[str] = None


class CodingTutorialCheck(BaseModel):
    isCodingTutorial: bool
    reason: str 


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


class BackgroundResource(BaseModel):
    title: str = Field(description="Title of the resource")
    description: str = Field(description="Brief description of what the resource covers")
    url: Optional[str] = Field(None, description="URL to the resource if available")

class Background(BaseModel):
    content: str = Field(description="Background knowledge needed for the challenge")
    key_concepts: List[str] = Field(description="List of key concepts to understand")
    resources: List[BackgroundResource] = Field(description="Additional learning resources")

class TestCase(BaseModel):
    description: str = Field(description="What this test verifies")
    command: str = Field(description="Command or code to run the test")
    expected_output: str = Field(description="Expected result or output")

class StepContent(BaseModel):
    step_number: int = Field(description="Step number (0 for setup, 1+ for main steps)")
    title: str = Field(description="Brief title for this step")
    goal: str = Field(description="Clear statement of what to accomplish")
    description: str = Field(description="Detailed explanation of requirements and approach")
    technical_requirements: List[str] = Field(description="Specific technical requirements to implement")
    concepts_taught: List[str] = Field(description="Key concepts learned in this step")
    test_cases: List[TestCase] = Field(description="Ways to verify the step is complete")
    hints: Optional[List[str]] = Field(None, description="Helpful hints without giving away the solution")
    security_considerations: Optional[List[str]] = Field(None, description="Security issues to be aware of")

class Extension(BaseModel):
    title: str = Field(description="Title of the extension")
    description: str = Field(description="What the extension adds")
    difficulty: str = Field(description="Difficulty level: beginner, intermediate, advanced")
    concepts: List[str] = Field(description="Additional concepts explored")

class CodingChallengeOutput(BaseModel):
    challenge_title: str = Field(description="Title of the coding challenge")
    
    introduction: str = Field(description="Engaging introduction explaining the challenge and its value")
    
    real_world_relevance: str = Field(description="Why this matters in real-world software development")
    
    estimated_time: str = Field(description="Estimated time to complete (e.g., '6-8 hours')")
    
    difficulty_level: str = Field(description="Overall difficulty: beginner, intermediate, advanced")
    
    background: Optional[Background] = Field(None, description="Background knowledge section")
    
    steps: List[StepContent] = Field(
        description="Progressive steps to complete the challenge",
        min_items=3,
        max_items=7
    )
    
    going_further: List[Extension] = Field(description="Optional extensions and advanced features")
    
    skills_developed: List[str] = Field(description="List of skills developers will gain")
    
    technologies_used: List[str] = Field(description="Technologies, protocols, or concepts involved")
    
    final_deliverable: str = Field(description="Description of the complete working application")


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

    transcript: Optional[Transcript] = None
    codingTutorialCheck: Optional[CodingTutorialCheck] = None
    TutorialQA: Optional[CodingInterviewQA] = None
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
