from pydantic import BaseModel, Field
from typing import List, Optional


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
