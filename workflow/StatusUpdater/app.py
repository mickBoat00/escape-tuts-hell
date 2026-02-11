import logging
import os
import re
from typing import Dict, Any
from urllib.parse import quote
from pymongo import MongoClient
from bson import ObjectId


logging.basicConfig(level=logging.INFO)


def update_tutorial_status(tutorial_id: str, status: str) -> Dict[str, Any]:
    valid_statuses = ['uploading', 'uploaded', 'processing', 'completed', 'failed']
    if status not in valid_statuses:
        raise ValueError(f"Invalid status: {status}. Must be one of {valid_statuses}")
    
    client = None
    try:
        client = MongoClient(os.environ["MONGODB_URI"])
        db = client[os.environ["MONGODB_DB"]]
        tutorials = db["tutorials"]
        
        result = tutorials.update_one(
            {"_id": ObjectId(tutorial_id)},
            {"$set": {"status": status}}
        )
        
        if result.matched_count == 0:
            raise ValueError(f"Tutorial with ID {tutorial_id} not found in database")
        
        logging.info(f"Updated tutorial {tutorial_id} status to {status}")
        
        return {
            "tutorialId": tutorial_id,
            "status": status,
            "modified": result.modified_count
        }
        
    finally:
        if client:
            client.close()


def handle_direct_status_update(event: Dict[str, Any]) -> Dict[str, Any]:
    tutorial_id = event['tutorialId']
    new_status = event['status']
    
    update_result = update_tutorial_status(tutorial_id, new_status)
    
    return {
        **event,
        "statusCode": 200,
        "statusUpdated": True,
        "updateResult": update_result
    }


def handle_s3_event(event: Dict[str, Any]) -> Dict[str, Any]:
    object_key = event['detail']['object']['key']
    bucket_name = event['detail']['bucket']['name']
    region = event.get('region', 'eu-west-2')
    
    # Extract tutorial ID (UUID before file extension)
    # Pattern: uploads/filename_<UUID>.extension
    pattern = r'([a-f0-9]{24})\.([^.]+)$'
    match = re.search(pattern, object_key)
    
    if not match:
        raise ValueError(f"Could not extract tutorial ID from object key: {object_key}")
    
    tutorial_id = match.group(1)
    
    # Update status to processing
    update_tutorial_status(tutorial_id, "processing")
    
    # Generate S3 URL
    encoded_key = quote(object_key, safe='/')
    tutorial_video_url = f"https://{bucket_name}.s3.{region}.amazonaws.com/{encoded_key}"
    
    return {
        "statusCode": 200,
        "tutorialId": tutorial_id,
        "tutorialVideoUrl": tutorial_video_url,
        "bucket": bucket_name,
        "objectKey": object_key,
        "simulateRetry": True
    }


def handle_workflow_retry(event: Dict[str, Any]) -> Dict[str, Any]:
    required = ["tutorialId", "jobName", "isRetry"]

    for field in required:
        if field not in event:
            raise ValueError(f"Missing required field: {field}")

    tutorial_id = event["tutorialId"]
    
    client = MongoClient(os.environ["MONGODB_URI"])
    db = client[os.environ["MONGODB_DB"]]
    tutorial = db["tutorials"].find_one({"_id": ObjectId(tutorial_id)})
    
    if not tutorial:
        raise ValueError(f"Tutorial {tutorial_id} not found")
    
    transcript_data = tutorial.get("transcript", {})
    transcript = (
        transcript_data.get("text") 
        if isinstance(transcript_data, dict) 
        else transcript_data
    )
    
    coding_check = tutorial.get("codingTutorialCheck", {})
    is_coding_tutorial = coding_check.get("isCodingTutorial", False)

    return {
        "statusCode": 200,
        "tutorialId": tutorial_id,
        "jobName": event["jobName"],
        "isRetry": True,
        "simulateRetry": False,
        "transcript": transcript,
        "isCodingTutorial": is_coding_tutorial
    }

def lambda_handler(event, context):
    tutorial_id = None
    
    try:
        # Check if this is a direct status update call (from Step Functions)
        if 'tutorialId' in event and 'status' in event:
            return handle_direct_status_update(event)

        elif 'isRetry' in event and 'jobName' in event:
            return handle_workflow_retry(event)
        
        # Original S3 event-triggered mode
        else:
            return handle_s3_event(event)
        
    except Exception as e:
        if tutorial_id:
            try:
                update_tutorial_status(tutorial_id, "failed")
                logging.error(f"Updated tutorial {tutorial_id} status to failed")
            except Exception as update_error:
                logging.error(f"Failed to update tutorial status: {str(update_error)}")
        
        logging.error(f"Lambda handler error: {str(e)}")
        raise