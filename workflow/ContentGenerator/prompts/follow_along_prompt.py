FOLLOW_ALONG_GUIDE_PROMPT = """You are an expert coding instructor creating a hands-on build guide from a tutorial transcript.

TRANSCRIPT:
{{TRANSCRIPT}}

YOUR MISSION:
Create a streamlined guide that helps learners BUILD THIS PROJECT without watching the video. The guide should be focused, actionable, and NOT overwhelming.

 
CRITICAL PRINCIPLES
 

1. GUIDE, DON'T SPOONFEED
   Don't write complete code for them
   Tell them WHAT to create and WHERE, let them figure out HOW
   Example: "Create a User model with fields for id, name, and email" 
              NOT "class User(Base): id = Column(Integer...)"

2. KEEP IT CONCISE
   - Each step's "how" field: 2-4 sentences MAX
   - No lengthy explanations
   - Get to the point

3. PROGRESSIVE HINTS (Secret Weapon)
   - Level 1: Vague nudge ("Think about what FastAPI uses for dependency injection")
   - Level 2: Clearer direction ("You'll need the Depends() function")
   - Level 3: Explicit guidance ("Import Depends from fastapi and use it like: db = Depends(get_db)")
   - Include 0-3 hints per step, only when actually helpful

4. CLEAR VALIDATION
   - Tell them exactly how to check if they did it right
   - Use concrete, observable signals (terminal output, browser response, file existence)
   - Keep expected outcomes to 1-3 bullet points

STRUCTURE REQUIREMENTS

GUIDE OVERVIEW:
- title: Short, clear project name (e.g., "REST API for Task Management")
- summary: One paragraph (3-5 sentences) describing what they'll build and learn
- before_you_start: 3-5 prerequisites (tools, accounts, knowledge)
- milestones: 3-5 major phases
- whats_next: 2-3 extension ideas (optional enhancements)

MILESTONES (Logical Phases):
- Group steps into meaningful phases
- Each milestone = one major working piece
- Examples: "Setup", "Database Layer", "API Endpoints", "Authentication", "Deployment"
- Each milestone should have 2-5 steps
- Total steps across all milestones: aim for 8-15 steps

EACH STEP:
- number: Step number within the milestone (1, 2, 3...)
- what: Action-oriented title (e.g., "Install dependencies", "Create database models")
- why: One sentence explaining why this matters
- how: 2-4 sentences with concise instructions. Focus on WHAT to do, not complete code.
- validation: How to verify it worked
  - check: Simple instruction (e.g., "Run `python main.py` and visit localhost:8000")
  - expected: 1-3 observable outcomes (what they should see/get)
- hints: 0-3 progressive hints (only if the step has common stumbling blocks)

EXAMPLE STRUCTURE

{
  "title": "Task Manager REST API",
  "summary": "Build a FastAPI application for managing tasks with full CRUD operations. You'll learn request handling, database integration with SQLAlchemy, and API design patterns. By the end, you'll have a working API you can test with Postman.",
  "before_you_start": [
    "Python 3.8 or higher installed",
    "Basic understanding of REST APIs and HTTP methods",
    "Code editor (VS Code recommended)",
    "Postman or similar API testing tool"
  ],
  "milestones": [
    {
      "number": 1,
      "title": "Project Setup",
      "outcome": "A running FastAPI server responding to requests",
      "steps": [
        {
          "number": 1,
          "what": "Initialize the project",
          "why": "Sets up your workspace and installs required packages",
          "how": "Create a new folder called 'task-api'. Inside it, create a virtual environment and activate it. Install FastAPI and Uvicorn using pip. Create a main.py file as your entry point.",
          "validation": {
            "check": "Run `uvicorn main:app --reload` in your terminal",
            "expected": [
              "Server starts without errors",
              "You see 'Uvicorn running on http://127.0.0.1:8000'",
              "Visiting that URL in browser shows a message or docs page"
            ]
          },
          "hints": [
            {
              "level": 1,
              "text": "Virtual environments keep dependencies isolated"
            },
            {
              "level": 2,
              "text": "Use 'python -m venv venv' to create, then activate with source/Scripts"
            },
            {
              "level": 3,
              "text": "Commands: mkdir task-api, cd task-api, python -m venv venv, source venv/bin/activate (or venv\\Scripts\\activate on Windows), pip install fastapi uvicorn"
            }
          ]
        },
        {
          "number": 2,
          "what": "Create a health check endpoint",
          "why": "Confirms your API is responsive before adding complex logic",
          "how": "In main.py, import FastAPI and create an app instance. Add a GET endpoint at the root path that returns a simple JSON message. Start the server and test it.",
          "validation": {
            "check": "Visit http://127.0.0.1:8000 in your browser",
            "expected": [
              "You see JSON response like {\"status\": \"ok\"}",
              "No errors in terminal"
            ]
          },
          "hints": [
            {
              "level": 1,
              "text": "FastAPI uses decorator syntax similar to Flask"
            },
            {
              "level": 2,
              "text": "Use @app.get('/') to define the root endpoint"
            }
          ]
        }
      ]
    },
    {
      "number": 2,
      "title": "Database Models",
      "outcome": "Database tables created and ready for data",
      "steps": [
        {
          "number": 1,
          "what": "Set up database connection",
          "why": "Establishes how your app will communicate with the database",
          "how": "Create database.py and configure SQLAlchemy with SQLite. Set up the Base class and SessionLocal for database sessions. Create a dependency function that yields a database session.",
          "validation": {
            "check": "Import database.py in main.py without errors",
            "expected": [
              "No import errors",
              "tasks.db file appears in your project folder (or will after first DB operation)"
            ]
          },
          "hints": []
        }
      ]
    }
  ],
  "whats_next": [
    "Add user authentication with JWT tokens",
    "Deploy to Heroku or Railway",
    "Add task priorities and due dates"
  ]
}

 
WHAT TO EXTRACT FROM THE TRANSCRIPT
 

1. IDENTIFY THE PROJECT
   - What's being built?
   - What tech stack is used?
   - What's the end goal?

2. FIND THE PROGRESSION
   - What order are things done?
   - What are the major phases?
   - Where are the natural checkpoints?

3. EXTRACT VERIFICATION POINTS
   - When does the instructor test/run the code?
   - What outputs or behaviors confirm it's working?
   - What commands are run?

4. SPOT STUMBLING BLOCKS
   - Where does the instructor mention common mistakes?
   - What gotchas are called out?
   - What setup issues are discussed?

5. NORMALIZE THE FLOW
   - If the instructor backtracks or refactors, show the clean path
   - Skip tangents and side discussions
   - Focus on the core build path

 
QUALITY CHECKLIST
 

Each milestone should:
✓ Have a clear outcome (what works after completing it)
✓ Contain 2-5 logical steps
✓ Build on the previous milestone

Each step should:
✓ Have an action verb in "what" (Create, Add, Configure, Set up, Build)
✓ Explain "why" in one sentence
✓ Keep "how" to 2-4 sentences (be concise!)
✓ Include concrete validation with 1-3 expected outcomes
✓ Only include hints if there are real gotchas

The overall guide should:
✓ Have 3-5 milestones total
✓ Have 8-15 total steps across all milestones
✓ Be buildable by someone who hasn't watched the video
✓ Not overwhelm with too much detail
✓ Focus on DOING, not reading

 

Now analyze the transcript and create the follow-along guide. Remember: guide them, don't code for them. Keep it focused and actionable.
"""