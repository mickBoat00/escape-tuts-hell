
import os
import logging
import boto3
from datetime import datetime

from fastapi import FastAPI, status

from botocore.exceptions import ClientError
from botocore.config import Config

from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import AsyncMongoClient

from models import FileDataRequest, TutorialModel

from typing import List

app = FastAPI(title="Podcast AI Backend")

load_dotenv()

client = AsyncMongoClient(os.environ["MONGODB_URI"])
db = client[os.environ["MONGODB_DB"]]
tutorials_collection = db["tutorials"]

origins = [
    os.environ["FRONTEND_URL"]
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def create_presigned_url(bucket_name, object_name, content_type, expiration=3600):
    s3_client = boto3.client('s3',
        region_name=os.environ["AWS_REGION"], 
        config=Config(signature_version='s3v4')
    )
    try:
        response = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': bucket_name,
                'Key': object_name,
                'ContentType': content_type
            },
            ExpiresIn=expiration
        )
    except ClientError as e:
        logging.error(e)
        return None

    return response


@app.post("/upload")
async def presigned_token(request: FileDataRequest):
    try:
        logging.info(f"fileName: {request.fileName} fileSize: {request.fileSize} fileDuration: {request.fileDuration}")

        file_extension = os.path.splitext(request.fileName)[1]

        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        base_name = os.path.splitext(request.fileName)[0]
        object_name = f"uploads/{base_name}_{timestamp}_{file_extension}"

        url = create_presigned_url(
            bucket_name=os.environ['S3_BUCKET_NAME'],
            object_name=object_name,
            content_type=request.contentType
        )
        
        if url is None:
            raise HTTPException(status_code=500, detail="Failed to generate presigned URL")
        
        s3_url = f"https://{os.environ['S3_BUCKET_NAME']}.s3.{os.environ['AWS_REGION']}.amazonaws.com/{object_name}"
        
        file_format = file_extension.lstrip('.') if file_extension else request.contentType.split('/')[-1]
        
        # Create tutorial data
        tutorial_data = {
            "inputUrl": s3_url,
            "fileName": request.fileName,
            "fileSize": request.fileSize,
            "fileDuration": request.fileDuration,
            "fileFormat": file_format,
            "mimeType": request.contentType,
            "status": "uploaded",
            "createdAt": datetime.utcnow()
        }
        
        TutorialModel(**tutorial_data).model_dump(by_alias=True)
        
        # Insert validated data into database
        result = await tutorials_collection.insert_one(tutorial_data)
        tutorial_id = str(result.inserted_id)
        logging.info(f"Created tutorial with ID: {tutorial_id}")
        
    except Exception as e:
        logging.error(f"Failed to create tutorial in database: {e}")
        raise HTTPException(status_code=500, detail=f"{e}" )
    
    return {
        "url": url,
        "tutorialId": tutorial_id,
        "s3Key": object_name
    }


@app.get("/tutorials", response_model=List[TutorialModel], status_code=status.HTTP_200_OK)
async def list_tutorials(skip: int = 0, limit: int = 10):
    try:
        return await tutorials_collection.find().skip(skip).limit(limit).sort("createdAt", -1).to_list(length=limit)
    except Exception as e:
        logging.error(f"Failed to retrieve tutorials: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve tutorials")