from pydantic import BaseModel, Field
from typing import List


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