import os
import time
import logging
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
from google import genai

from prompts.coding_tutorial_checker_prompt import CODING_TUTORIAL_CHECKER_PROMPT
from prompts.questionnaires_prompt import TUTORIAL_QUESTION_PROMPT
from prompts.coding_challenge_prompt import CODING_CHALLENGE_PROMPT
from prompts.simulate_retry import SUMMARY_PROMPT

from schemas.coding_tutorial_checker import CodingTutorialCheck
from schemas.questionnaire import CodingInterviewQA
from schemas.coding_challenge_schema import CodingChallengeOutput
from schemas.summary import Summary


logging.basicConfig(level=logging.INFO)

client = MongoClient(os.environ["MONGODB_URI"])
db = client[os.environ["MONGODB_DB"]]
tutorials = db["tutorials"]

CONTENT_GENERATORS = {
    "CodingTutorialChecker": {
        "prompt": CODING_TUTORIAL_CHECKER_PROMPT,
        "schema": CodingTutorialCheck,
        "db_field": "codingTutorialCheck",
    },
    "TutorialQA": {
        "prompt": TUTORIAL_QUESTION_PROMPT,
        "schema": CodingInterviewQA,
        "db_field": "tutorialQA",
    },
    "CodingChallenge": {
        "prompt": CODING_CHALLENGE_PROMPT,
        "schema": CodingChallengeOutput,
        "db_field": "codingChallenge",
    },
    "SimulateRetry": {
        "prompt": SUMMARY_PROMPT,
        "schema": Summary,
        "db_field": "summary",
    },
}

def simulate_failure_for_retry(tutorial_id, db_field, content_type):
    logging.warning(f"Simulating failure for {content_type}")
    
    # Update job status to running first
    tutorials.update_one(
        {"_id": ObjectId(tutorial_id)},
        {
            "$set": {
                f"jobStatus.{db_field}": "running",
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    # Simulate some processing time
    time.sleep(5)
    
    # Record the simulated failure
    error_message = "Simulated failure for retry testing - first attempt"
    tutorials.update_one(
        {"_id": ObjectId(tutorial_id)},
        {
            "$set": {
                f"jobStatus.{db_field}": "failed",
                f"jobError.{db_field}": error_message,
                "error": {
                    "step": content_type,
                    "message": error_message,
                    "timestamp": datetime.utcnow()
                },
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    return error_message


def lambda_handler(event, context):
    tutorial_id = None
    content_type = event["contentType"]
    config = CONTENT_GENERATORS.get(content_type)
    
    # Get simulation flag from event (optional)
    simulate_failure = event.get("simulateRetry", False)

    try:
        tutorial_id = event["tutorialId"]
        transcript = event["transcript"]
        

        if content_type not in CONTENT_GENERATORS:
            raise ValueError(f"Invalid contentType: {content_type}. "
                           f"Available types: {list(CONTENT_GENERATORS.keys())}")
        
        logging.info(f"Starting {content_type} generation for tutorial: {tutorial_id}")

        config = CONTENT_GENERATORS[content_type]
        db_field = config["db_field"]
        
        # Check if we should simulate a failure for retry testing
        if simulate_failure and content_type == "SimulateRetry":
            error_message = simulate_failure_for_retry(tutorial_id, db_field, content_type)
            raise Exception(error_message)

        # Normal execution flow
        tutorials.update_one(
            {"_id": ObjectId(tutorial_id)},
            {
                "$set": {
                    f"jobStatus.{db_field}": "running",
                    "updatedAt": datetime.utcnow()
                }
            }
        )

        generated_content = None
    
        try:
            client = genai.Client()

            prompt = config["prompt"].replace("{{TRANSCRIPT}}", transcript)
            
            # Generate content with structured output
            response = client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_schema": config["schema"],
                },
            )
            
            result = config["schema"].model_validate_json(response.text)
            
            generated_content = result.model_dump()
        
        except Exception as e:
            logging.error(f"Error generating {content_type}: {str(e)}")
            raise

        
        update_doc = {
            "$set": {
                db_field: generated_content,
                f"jobStatus.{db_field}": "completed",
                "updatedAt": datetime.utcnow(),
            }
        }
        
        # Update tutorial with generated content
        update_result = tutorials.update_one(
            {"_id": ObjectId(tutorial_id)},
            update_doc
        )
        
        if update_result.modified_count == 0:
            logging.warning("Warning: No documents were modified")
        
        return {
            "success": True,
            "tutorialId": tutorial_id,
            "transcript": transcript,
            "contentType": content_type,
        }
            
        
    except Exception as e:
        error_msg = str(e)
        logging.error(f"ERROR: {error_msg}")
        
        if tutorial_id and config:
            try:
                tutorials.update_one(
                    {"_id": ObjectId(tutorial_id)},
                    {
                        "$set": {
                            "status": "failed",
                            f"jobStatus.{config.get('db_field')}": "failed",
                            f"jobError.{config.get('db_field')}": error_msg,
                            "error": {
                                "step": content_type,
                                "message": error_msg,
                                "timestamp": datetime.utcnow()
                            },
                            "updatedAt": datetime.utcnow()
                        }
                    }
                )
            except Exception as db_error:
                logging.error(f"Failed to update database: {str(db_error)}")
        
        raise