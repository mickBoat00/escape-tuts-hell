

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
