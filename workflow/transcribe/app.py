import os
import logging
from datetime import datetime
import assemblyai as aai
from pymongo import MongoClient
from bson import ObjectId

logging.basicConfig(level=logging.INFO)

client = MongoClient(os.environ["MONGODB_URI"])
db = client[os.environ["MONGODB_DB"]]
tutorials = db["tutorials"]
ASSEMBLYAI_API_KEY = os.environ["ASSEMBLYAI_API_KEY"]


def lambda_handler(event, context):
    tutorial_id = None
    try:
        tutorial_id = event["tutorialId"]
        input_url = event["tutorialVideoUrl"]
        
        tutorials.update_one(
            {"_id": ObjectId(tutorial_id)},
            {
                "$set": {
                    "status": "processing", 
                    "jobStatus.transcription": "running",
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        aai.settings.api_key = ASSEMBLYAI_API_KEY
        transcriber = aai.Transcriber()
        transcript = transcriber.transcribe(input_url)
        
        if transcript.status == aai.TranscriptStatus.error:
            error_message = f"Transcription failed: {transcript.error}"
            
            tutorials.update_one(
                {"_id": ObjectId(tutorial_id)},
                {
                    "$set": {
                        "status": "failed",
                        "jobStatus.transcription": "failed",
                        "error": {
                            "step": "transcription",
                            "message": transcript.error,
                            "timestamp": datetime.utcnow()
                        },
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
            
            # RAISE EXCEPTION to fail the Step Function
            raise Exception(error_message)

        update_data = {
            "jobStatus.transcription": "completed",
            "transcript": transcript.text,
            "updatedAt": datetime.utcnow()
        }
        
        # Add audio duration if available
        if transcript.audio_duration:
            update_data["fileDuration"] = transcript.audio_duration / 1000.0
        
        tutorials.update_one(
            {"_id": ObjectId(tutorial_id)},
            {"$set": update_data}
        )
        
        return {
            "success": True,
            "tutorialId": tutorial_id,
            "transcript": transcript.text,
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
                            "jobStatus.transcription": "failed",
                            "error": {
                                "step": "transcription",
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
