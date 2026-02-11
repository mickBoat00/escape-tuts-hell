from pydantic import BaseModel, Field

class Summary(BaseModel):
    text: str = Field(
        description="Summary transcript in a maximum of 6 sentences."
    )
