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

from schemas.coding_tutorial_checker import CodingTutorialCheck
from schemas.questionnaire import CodingInterviewQA
from schemas.coding_challenge_schema import CodingChallengeOutput


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
        "db_field": "TutorialQA",
    },
    "CodingChallenge": {
        "prompt": CODING_CHALLENGE_PROMPT,
        "schema": CodingChallengeOutput,
        "db_field": "codingChallenge",
    },
}

def lambda_handler(event, context):
    tutorial_id = None
    content_type = event["contentType"]
    config = CONTENT_GENERATORS[content_type]

    try:
        tutorial_id = event["tutorialId"]
        transcript = event["transcript"]
        

        if content_type not in CONTENT_GENERATORS:
            raise ValueError(f"Invalid contentType: {content_type}. "
                           f"Available types: {list(CONTENT_GENERATORS.keys())}")
        
        logging.info(f"Starting {content_type} generation for tutorial: {tutorial_id}")


        config = CONTENT_GENERATORS[content_type]
        tutorials.update_one(
            {"_id": ObjectId(tutorial_id)},
            {
                "$set": {
                    f"jobStatus.{config.get("db_field")}": "running",
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

        db_field = config["db_field"]
        
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
            **generated_content
        }
            
        
    except Exception as e:
        error_msg = str(e)
        logging.error(f"ERROR: {error_msg}")
        
        if tutorial_id:
            try:
                tutorials.update_one(
                    {"_id": ObjectId(tutorial_id)},
                    {
                        "$set": {
                            "status": "failed",
                            f"jobStatus.{config.get("db_field")}": "failed",
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
