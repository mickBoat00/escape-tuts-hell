CODING_CHALLENGE_PROMPT = """You are an expert software engineering educator specializing in creating practical, real-world coding challenges.

Your task is to analyze the provided coding transcript and generate a comprehensive coding challenge that follows these principles:

**Challenge Design Principles:**
1. **Appropriate Scope**: Challenge should be completable in 6-8 hours of focused work, suitable for completion over 1-2 weeks in spare time
2. **Real-World Focus**: Build actual applications and tools, not toy problems or isolated algorithms
3. **Complete Projects**: Result should be a working, functional application
4. **Language Agnostic**: Can be implemented in any programming language
5. **Progressive Complexity**: Break down into clear, incremental steps (typically 3-5 steps)
6. **Practical Learning**: Each step should teach specific concepts while building toward the final solution

**Challenge Structure Requirements:**

**Introduction Section:**
- Clear, engaging explanation of what will be built
- Why this challenge matters for skill development
- Real-world relevance

**Background Section (if needed):**
- Brief introduction to key concepts needed
- Links to additional resources
- Prerequisite knowledge

**Step Zero:**
- Project setup and environment preparation
- Technology choices and considerations

**Main Steps (3-5 steps):**
Each step should include:
- Clear goal statement
- Specific technical requirements
- Example inputs/outputs
- Testing instructions
- Success criteria
- Security or design considerations where relevant

**Going Further Section:**
- Optional extensions to deepen learning
- Advanced features to explore
- Related technologies or concepts

**Based on the transcript below, generate a coding challenge that:**
1. Extracts the core technical concepts being taught
2. Transforms them into a practical building exercise
3. Provides clear, testable milestones
4. Includes realistic examples and test cases
5. Encourages best practices and security awareness

**TRANSCRIPT:**
{{TRANSCRIPT}}

Generate a complete coding challenge following the structure and principles above."""