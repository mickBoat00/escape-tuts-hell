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

JOB_NAME_TO_CONTENT_TYPE = {
    "challenge": "CodingChallenge",
    "qnas": "TutorialQA",
    "summary": "SimulateRetry",
    "codingTutorialCheck": "CodingTutorialChecker",
}


def simulate_failure_for_retry(tutorial_id, db_field, content_type):
    """Simulate a failure for retry testing purposes"""
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
    error_message = "Simulated failure for retry testing"
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


def is_transient_llm_error(e: Exception) -> bool:
    msg = str(e)
    return any(code in msg for code in [
        "503",
        "UNAVAILABLE",
        "high demand",
        "Rate limit",
    ])


def lambda_handler(event, context):
    tutorial_id = event.get("tutorialId")
    content_type = event.get("contentType")
    job_name = event.get("jobName")
    is_retry = event.get("isRetry", False)
    transcript = event.get("transcript")
    simulate_retry = event.get("simulateRetry", False)

    config = None
    db_field = None

    try:
        if not tutorial_id:
            raise ValueError("tutorialId missing from state input")

        # RETRY VALIDATION LOGIC
        if is_retry:
            logging.info(
                f"Retry attempt detected | jobName={job_name} | contentType={content_type}"
            )

            # Fetch tutorial early to get isCodingTutorial for choice state
            tutorial = tutorials.find_one({"_id": ObjectId(tutorial_id)})
            if not tutorial:
                raise ValueError("Tutorial not found")
            
            is_coding_tutorial = tutorial.get("codingTutorialCheck", {}).get("isCodingTutorial", False)

            # Map job name to expected content type
            expected_content_type = JOB_NAME_TO_CONTENT_TYPE.get(job_name)
            
            if not expected_content_type:
                logging.error(f"Unknown jobName: {job_name}")
                return {
                    "success": False,
                    "skipped": True,
                    "reason": f"Unknown jobName: {job_name}",
                    "tutorialId": tutorial_id,
                    "isRetry": is_retry,
                    "isCodingTutorial": is_coding_tutorial,
                }
            
            # Check if the content type matches what we expect for this job
            if content_type != expected_content_type:
                logging.warning(
                    f"contentType mismatch: got '{content_type}', expected '{expected_content_type}' for jobName '{job_name}'"
                )
                return {
                    "success": False,
                    "skipped": True,
                    "reason": f"contentType '{content_type}' does not match expected '{expected_content_type}' for jobName '{job_name}'",
                    "tutorialId": tutorial_id,
                    "isRetry": is_retry,
                    "isCodingTutorial": is_coding_tutorial,
                }

            # Validate content type exists
            if content_type not in CONTENT_GENERATORS:
                raise ValueError(f"Invalid contentType: {content_type}")

            config = CONTENT_GENERATORS[content_type]
            db_field = config["db_field"]

            job_status = tutorial.get("jobStatus", {}).get(db_field)

            if job_status != "failed":
                logging.warning(f"Retry blocked - jobStatus is '{job_status}', not 'failed'")
                return {
                    "success": False,
                    "skipped": True,
                    "reason": f"Retry blocked — jobStatus is '{job_status}'",
                    "tutorialId": tutorial_id,
                    "isRetry": is_retry,
                    "isCodingTutorial": is_coding_tutorial,
                }

            # Update status to retrying
            tutorials.update_one(
                {"_id": ObjectId(tutorial_id)},
                {
                    "$set": {
                        f"jobStatus.{db_field}": "retrying",
                        "status": "retrying",
                        "updatedAt": datetime.utcnow(),
                    }
                },
            )
            
            logging.info(f"Retry validation passed for {job_name}")

        else:
            # Normal execution (not retry) - validate content type
            if content_type not in CONTENT_GENERATORS:
                raise ValueError(f"Invalid contentType: {content_type}")
            
            config = CONTENT_GENERATORS[content_type]
            db_field = config["db_field"]

        # Get transcript from event or database
        if not transcript:
            if not is_retry:  # Only fetch if we haven't already
                tutorial = tutorials.find_one({"_id": ObjectId(tutorial_id)})
            
            transcript_obj = tutorial.get("transcript")

            if isinstance(transcript_obj, dict):
                transcript = transcript_obj.get("text")
            else:
                transcript = transcript_obj

            if not transcript:
                raise ValueError("Transcript unavailable")

        # CHECK: Simulate failure for retry testing (only on initial run, not retry)
        if simulate_retry and content_type == "SimulateRetry" and not is_retry:
            simulate_failure_for_retry(tutorial_id, db_field, content_type)
            return {
                "success": True,
                "tutorialId": tutorial_id,
                "transcript": transcript,
                "simulateRetry": simulate_retry,
                "simulated": True
            }

        # NORMAL CONTENT GENERATION
        logging.info(f"Starting {content_type} generation for tutorial: {tutorial_id}")

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

        # Increment retry counter if this is a retry
        if is_retry:
            tutorials.update_one(
                {"_id": ObjectId(tutorial_id)},
                {
                    "$inc": {f"retryCount.{db_field}": 1},
                    "$set": {"updatedAt": datetime.utcnow()}
                }
            )
            logging.info(f"Incremented retry count for {db_field}")

        # Generate content with AI
        genai_client = genai.Client()
        prompt = config["prompt"].replace("{{TRANSCRIPT}}", transcript)

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

        # Update database with generated content
        tutorials.update_one(
            {"_id": ObjectId(tutorial_id)},
            {
                "$set": {
                    db_field: generated_content,
                    f"jobStatus.{db_field}": "completed",
                    f"jobError.{db_field}": None,
                    "updatedAt": datetime.utcnow(),
                },
                "$unset": {"error": ""},
            },
        )

        logging.info(f"Successfully completed {content_type} generation (retry={is_retry})")

        return {
            "success": True,
            "tutorialId": tutorial_id,
            "jobName": job_name,
            "isRetry": is_retry,
            "simulateRetry": simulate_retry,
            **generated_content,
        }

    except Exception as e:
        error_msg = str(e)
        logging.error(f"ERROR in {content_type}: {error_msg}", exc_info=True)

        if db_field and tutorial_id:
            is_transient = is_transient_llm_error(e)

            tutorials.update_one(
                {"_id": ObjectId(tutorial_id)},
                {
                    "$set": {
                        f"jobStatus.{db_field}": "failed",
                        f"jobError.{db_field}": error_msg,
                        "updatedAt": datetime.utcnow(),
                    }
                },
            )

            if is_transient and content_type != "CodingTutorialChecker":
                return {
                    "success": False,
                    "retryable": True,
                    "tutorialId": tutorial_id,
                    "contentType": content_type,
                    "error": error_msg,
                }

            if content_type == "CodingTutorialChecker" and is_transient:
                raise Exception("CodingTutorialCheckerTransientError")

        raise