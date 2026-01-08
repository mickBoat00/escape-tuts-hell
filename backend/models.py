

from datetime import datetime
from typing import Annotated, Optional,Literal

from bson import ObjectId
from pydantic import BaseModel, Field, BeforeValidator


class FileDataRequest(BaseModel):
    fileName: str
    fileSize: int
    fileDuration: int
    contentType: str

PyObjectId = Annotated[str, BeforeValidator(str)]

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