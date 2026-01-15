from pydantic import BaseModel, Field
from typing import List, Literal, Optional


class CodingTutorialCheck(BaseModel):
    isCodingTutorial: bool = Field(
        description="True if the transcript is a coding tutorial"
    )

    reason: str = Field(
        description="A summary of what the transcript is about"
    )