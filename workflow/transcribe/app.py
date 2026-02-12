import os
import time
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
        is_retry = event.get("isRetry", False)
        job_name = event.get("jobName")
        simulate_retry = event.get("simulateRetry", False)

        if is_retry:
            tutorial = tutorials.find_one({"_id": ObjectId(tutorial_id)})

            if not tutorial or "transcript" not in tutorial:
                raise Exception("Transcript not found for retry")

            transcript_data = tutorial.get("transcript")

            transcript_text = (
                transcript_data.get("text")
                if isinstance(transcript_data, dict)
                else transcript_data
            )

            if not transcript_text:
                raise Exception("Stored transcript is empty")

            logging.info("Retry detected — reusing existing transcript")

            return {
                "success": True,
                "tutorialId": tutorial_id,
                "transcript": transcript_text,
                "jobName": job_name,
                "isRetry": is_retry,
                "simulateRetry": simulate_retry,
            }
        
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
        
        # aai.settings.api_key = ASSEMBLYAI_API_KEY
        # transcriber = aai.Transcriber()
        # transcript = transcriber.transcribe(input_url)
        
        # if transcript.status == aai.TranscriptStatus.error:
        #     error_message = f"Transcription failed: {transcript.error}"
            
        #     tutorials.update_one(
        #         {"_id": ObjectId(tutorial_id)},
        #         {
        #             "$set": {
        #                 "status": "failed",
        #                 "jobStatus.transcription": "failed",
        #                 "error": {
        #                     "step": "transcription",
        #                     "message": transcript.error,
        #                     "timestamp": datetime.utcnow()
        #                 },
        #                 "updatedAt": datetime.utcnow()
        #             }
        #         }
        #     )
            
        #     # RAISE EXCEPTION to fail the Step Function
        #     raise Exception(error_message)

        # transcript_text = transcript.text

        # update_data = {
        #     "jobStatus.transcription": "completed",
        #     "transcript.text": transcript_text,
        #     "updatedAt": datetime.utcnow()
        # }
        
        # # Add audio duration if available
        # if transcript.audio_duration:
        #     update_data["fileDuration"] = transcript.audio_duration / 1000.0
        
        time.sleep(10)

        # 3. Fetch the first tutorial that already has a transcript
        source_tutorial = tutorials.find_one(
            {
                "transcript": {"$exists": True, "$ne": None}
            },
            sort=[("createdAt", 1)]
        )

        if not source_tutorial:
            raise Exception("No existing transcript found to simulate transcription")

        # 4. Extract transcript text (handle both shapes safely)
        transcript_data = source_tutorial.get("transcript")

        if isinstance(transcript_data, dict):
            transcript_text = transcript_data.get("text")
        else:
            transcript_text = transcript_data

        if not transcript_text:
            raise Exception("Source tutorial transcript is empty")

        update_data = {
            "jobStatus.transcription": "completed",
            "transcript.text": transcript_text,
            "updatedAt": datetime.utcnow()
        }

        tutorials.update_one(
            {"_id": ObjectId(tutorial_id)},
            {"$set": update_data}
        )
        
        return {
            "success": True,
            "tutorialId": tutorial_id,
            "transcript": transcript_text,
            "isRetry": is_retry,
            "jobName": job_name,
            "simulateRetry": simulate_retry,
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
