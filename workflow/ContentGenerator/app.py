import os
import time
import logging
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
from google import genai

logging.basicConfig(level=logging.INFO)

client = MongoClient(os.environ["MONGODB_URI"])
db = client[os.environ["MONGODB_DB"]]
tutorials = db["tutorials"]

CONTENT_GENERATORS = {
    "CodingTutorialChecker": {
        "prompt": "podcast_summary_prompt",
        "schema": "Summary",
        "db_field": "summary",
        "job_status_field": "contentGeneration"
    },
}

def lambda_handler(event, context):
    tutorial_id = None
    content_type = os.environ["CONTENT_TYPE"]
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
                    f"jobStatus.{config.get("job_status_field")}": "running",
                    "updatedAt": datetime.utcnow()
                }
            }
        )

        generated_content = None
    
        try:
            client = genai.Client()
            
            # Generate content with structured output
            response = client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=config["prompt"],
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
                            f"jobStatus.{config.get("job_status_field")}": "failed",
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
