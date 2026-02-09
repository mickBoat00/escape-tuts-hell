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
    print('event', event)
    tutorial_id = event.get("tutorialId")
    content_type = event.get("contentType")
    job_name = event.get("jobName")
    is_retry = event.get("isRetry", False)
    transcript = event.get("transcript")
    simulate_retry = event.get("simulateRetry", False)

    try:
        if not tutorial_id:
            raise ValueError("tutorialId missing from state input")

        if content_type not in CONTENT_GENERATORS:
            raise ValueError(f"Invalid contentType: {content_type}")

        config = CONTENT_GENERATORS[content_type]
        db_field = config["db_field"]

        # RETRY VALIDATION LOGIC
        if is_retry:
            logging.info(
                f"Retry attempt detected | jobName={job_name} | contentType={content_type}"
            )

            if content_type != job_name:
                return {
                    "success": False,
                    "skipped": True,
                    "reason": "contentType does not match jobName",
                    "tutorialId": tutorial_id,
                    "isRetry": is_retry,
                    "simulateRetry": simulate_retry,
                }

            tutorial = tutorials.find_one({"_id": ObjectId(tutorial_id)})
            if not tutorial:
                raise ValueError("Tutorial not found")

            job_status = tutorial.get("jobStatus", {}).get(db_field)

            if job_status != "failed":
                return {
                    "success": False,
                    "skipped": True,
                    "reason": f"Retry blocked — jobStatus is '{job_status}'",
                    "tutorialId": tutorial_id,
                    "isRetry": is_retry,
                    "simulateRetry": simulate_retry,
                }

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

        # Get transcript from event or database
        if not transcript:
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
                # "contentType": content_type,
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
            # "contentType": content_type,
            "jobName": job_name,
            "isRetry": is_retry,
            "simulateRetry": simulate_retry,
            **generated_content,
        }

    except Exception as e:
        error_msg = str(e)
        logging.error(f"ERROR in {content_type}: {error_msg}")

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

        # Automatic retry ONLY for CodingTutorialChecker
        if content_type == "CodingTutorialChecker" and is_transient:
            raise Exception("CodingTutorialCheckerTransientError")

        raise

