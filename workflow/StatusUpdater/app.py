import json
import logging
import os
import re
from urllib.parse import quote
from pymongo import MongoClient
from bson import ObjectId


logging.basicConfig(level=logging.INFO)

def lambda_handler(event, context):
    
    client = None
    tutorial_id = None
    
    try:
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
        
        client = MongoClient(os.environ["MONGODB_URI"])
        db = client[os.environ["MONGODB_DB"]]
        tutorials = db["tutorials"]
        
        result = tutorials.update_one(
            {"_id": ObjectId(tutorial_id)},
            {"$set": {"status": "processing"}}
        )
        
        if result.matched_count == 0:
            raise ValueError(f"Tutorial with ID {tutorial_id} not found in database")

        encoded_key = quote(object_key, safe='/')
        tutorial_video_url = f"https://{bucket_name}.s3.{region}.amazonaws.com/{encoded_key}"
        
        if client:
            client.close()
        
        return {
            "statusCode": 200,
            "tutorialId": tutorial_id,
            "tutorialVideoUrl": tutorial_video_url,
            "bucket": bucket_name,
            "objectKey": object_key
        }
        
    except Exception as e:
        if tutorial_id and client:
            try:
                db = client[os.environ["MONGODB_DB"]]
                tutorials = db["tutorials"]
                tutorials.update_one(
                    {"_id": ObjectId(tutorial_id)},
                    {"$set": {"status": "failed"}}
                )
                logging.error(f"Updated tutorial {tutorial_id} status to failed")
            except Exception as update_error:
                logging.error(f"Failed to update tutorial status: {str(update_error)}")
        
        if client:
            try:
                client.close()
            except:
                pass
        
        raise