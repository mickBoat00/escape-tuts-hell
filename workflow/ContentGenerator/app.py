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
    content_type = event.get("contentType")
    job_name = event.get("jobName")
    is_retry = event.get("isRetry", False)
    
    try:
        tutorial_id = event["tutorialId"]
        
        if content_type not in CONTENT_GENERATORS:
            raise ValueError(f"Invalid contentType: {content_type}. "
                           f"Available types: {list(CONTENT_GENERATORS.keys())}")
        
        config = CONTENT_GENERATORS[content_type]
        db_field = config["db_field"]
        
        transcript = event.get("transcript")
        
        if not transcript:
            logging.info(f"No transcript in event, fetching from database for tutorial: {tutorial_id}")
            tutorial = tutorials.find_one({"_id": ObjectId(tutorial_id)})
            
            if not tutorial:
                raise ValueError(f"Tutorial not found: {tutorial_id}")
            
            # Get transcript from database
            transcript_obj = tutorial.get("transcript")
            if transcript_obj and isinstance(transcript_obj, dict):
                transcript = transcript_obj.get("text")
            elif isinstance(transcript_obj, str):
                transcript = transcript_obj
            
            if not transcript:
                raise ValueError(f"No transcript available for tutorial: {tutorial_id}")
            
            logging.info(f"Retrieved transcript from database")
        
        # RETRY LOGIC
        if is_retry:
            logging.info(f"Processing RETRY - contentType: {content_type}, jobName: {job_name}, db_field: {db_field}")
            
            # Check if this retry is for THIS specific content type
            if job_name != db_field:
                logging.info(f"Skipping: jobName '{job_name}' does not match this content's db_field '{db_field}'")
                return {
                    "success": False,
                    "tutorialId": tutorial_id,
                    "contentType": content_type,
                    "jobName": job_name,
                    "skipped": True,
                    "reason": f"This content ({db_field}) is not the target for retry ({job_name})"
                }
            
            # Fetch tutorial to check job status
            tutorial = tutorials.find_one({"_id": ObjectId(tutorial_id)})
            if not tutorial:
                raise ValueError(f"Tutorial not found: {tutorial_id}")
            
            # Check if the job status is "failed"
            current_status = tutorial.get("jobStatus", {}).get(db_field)
            
            if current_status != "failed":
                logging.warning(f"Job '{db_field}' has status '{current_status}', not 'failed'. Cannot retry.")
                return {
                    "success": False,
                    "tutorialId": tutorial_id,
                    "contentType": content_type,
                    "jobName": job_name,
                    "skipped": True,
                    "reason": f"Job status is '{current_status}', not 'failed'",
                    "message": "Cannot retry a job that hasn't failed"
                }
            
            logging.info(f"Validated: Job '{db_field}' has status 'failed'. Proceeding with retry.")
        
        logging.info(f"Starting {content_type} generation for tutorial: {tutorial_id}")
        
        # Get simulation flag (only for initial runs, not retries)
        simulate_failure = event.get("simulateRetry", False) and not is_retry
        
        # Check if we should simulate a failure for retry testing
        if simulate_failure and content_type == "SimulateRetry":
            simulate_failure_for_retry(tutorial_id, db_field, content_type)
            return {
                "success": True,
                "tutorialId": tutorial_id,
                "transcript": transcript,
                "contentType": content_type,
                "simulateRetry": simulate_failure,
            }


        # Update status to running
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
            genai_client = genai.Client()

            prompt = config["prompt"].replace("{{TRANSCRIPT}}", transcript)
            
            # Generate content with structured output
            response = genai_client.models.generate_content(
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
                f"jobError.{db_field}": None,  # Clear previous error
                "updatedAt": datetime.utcnow(),
            }
        }
        
        # Clear global error if this was the failed step
        if is_retry:
            update_doc["$unset"] = {"error": ""}
        
        # Update tutorial with generated content
        update_result = tutorials.update_one(
            {"_id": ObjectId(tutorial_id)},
            update_doc
        )
        
        if update_result.modified_count == 0:
            logging.warning("Warning: No documents were modified")
        
        logging.info(f"Successfully completed {content_type} generation (retry={is_retry})")
        
        return {
            "success": True,
            "tutorialId": tutorial_id,
            "transcript": transcript,
            "contentType": content_type,
            "jobName": job_name,
            "isRetry": is_retry,
            "simulateRetry": simulate_failure,
            **generated_content
        }
            
        
    except Exception as e:
        error_msg = str(e)
        logging.error(f"ERROR in {content_type}: {error_msg}")
        
        if tutorial_id and content_type in CONTENT_GENERATORS:
            config = CONTENT_GENERATORS[content_type]
            try:
                tutorials.update_one(
                    {"_id": ObjectId(tutorial_id)},
                    {
                        "$set": {
                            f"jobStatus.{config['db_field']}": "failed",
                            f"jobError.{config['db_field']}": error_msg,
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