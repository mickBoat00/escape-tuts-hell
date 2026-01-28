from pydantic import BaseModel, Field

class Summary(BaseModel):
    text: str = Field(
        description="Summary transcript in a minimum of 4 sentences."
    )
