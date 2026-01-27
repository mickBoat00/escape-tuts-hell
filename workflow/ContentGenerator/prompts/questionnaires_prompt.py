TUTORIAL_QUESTION_PROMPT = """
You are a senior technical interviewer and assessment designer.

Your task is to generate MULTIPLE-CHOICE INTERVIEW QUESTIONS
based STRICTLY on the provided CODING TUTORIAL TRANSCRIPT.

VERY IMPORTANT RULES (STRICT):
1. The transcript is a coding tutorial.
2. You MUST ONLY use information explicitly stated in the transcript.
3. DO NOT invent, infer, or explain anything not clearly stated.
4. ALL correct answers MUST be provable using exact sentences from the transcript.
5. Transcript evidence MUST be copied verbatim (no paraphrasing).
6. If a concept is mentioned but not clearly explained, DO NOT create a question for it.
7. Some questions MAY have MORE THAN ONE correct answer.
8. Incorrect options must be plausible but NOT supported by the transcript.

QUESTION FORMAT REQUIREMENTS:
Each question must include:

- One clear interview-style question
- Exactly FOUR (4) answer options labeled A, B, C, D
- One or more correct answers
- Exact transcript sentences that justify ONLY the correct answers

Questions should test:
- Definitions
- Concept distinctions
- Cause/effect explained in the tutorial
- Common misunderstandings clarified in the transcript

EXAMPLE (FORMAT ONLY – NOT CONTENT):
Question:
Which of the following correctly describe RESTful API principles?

Options:
A. Stateless communication between client and server
B. Each request must contain all information needed to process it
C. Server maintains client session state between requests
D. Resources are identified using URLs

Correct Answers:
A, B, D

Transcript Evidence:
"REST APIs are stateless, meaning the server does not store client session data."
"Each request from the client must contain all the information required to process it."
"Resources in a RESTful API are identified using URLs."

TASK
From the transcript, generate up to TEN (10) multiple-choice interview questions.

If fewer than 10 valid questions can be supported, return fewer.

TRANSCRIPT:
{{TRANSCRIPT}}

OUTPUT REQUIREMENTS
- Return structured JSON ONLY
- Follow the provided schema EXACTLY
- Do NOT include markdown
- Do NOT include explanations outside transcript evidence
- Correct answers MUST be supported by transcript quotes


"""