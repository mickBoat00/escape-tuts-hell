from pydantic import BaseModel, Field
from typing import List, Optional

class TestCase(BaseModel):
    description: str = Field(description="What this test verifies")
    command: str = Field(description="Command, request, or action to perform")
    expected_output: str = Field(description="Expected result or observable behavior")


class StepContent(BaseModel):
    step_number: int = Field(description="Step number (0 for setup, 1+ for implementation steps)")
    title: str = Field(description="Short descriptive title for the step")
    goal: str = Field(description="What this step accomplishes")
    description: str = Field(description="Detailed explanation of how to implement this step")
    related_requirements: List[int] = Field(
        description="Indexes of requirements this step helps fulfill"
    )
    test_cases: List[TestCase] = Field(
        description="How to verify this step is correctly implemented"
    )


class Requirement(BaseModel):
    id: int = Field(description="Unique requirement ID")
    description: str = Field(
        description="User-facing functional requirement written in plain language"
    )


class Extension(BaseModel):
    title: str = Field(description="Title of the extension")
    description: str = Field(description="What the extension adds or explores")


class CodingChallengeOutput(BaseModel):
    challenge_title: str = Field(description="Title of the coding challenge")

    introduction: str = Field(
        description="Engaging explanation of what will be built and why"
    )

    real_world_relevance: str = Field(
        description="Why this challenge matters in real-world software development"
    )

    background: str = Field(
        description="Concepts, prerequisites, and optional learning resources"
    )

    requirements: List[Requirement] = Field(
        description="List of functional requirements the final application must satisfy",
        min_items=3
    )

    steps: List[StepContent] = Field(
        description="Progressive implementation steps that fulfill the requirements",
        min_items=3,
        max_items=7
    )

    going_further: List[Extension] = Field(
        description="Optional enhancements and advanced explorations"
    )

    final_deliverable: str = Field(
        description="Clear description of the completed working application"
    )
