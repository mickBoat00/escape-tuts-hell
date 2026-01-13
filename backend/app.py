import os
import logging
import boto3
from datetime import datetime
from typing import List

from fastapi import FastAPI, HTTPException, status, Path
from bson import ObjectId
from pymongo import MongoClient
from botocore.exceptions import ClientError
from dotenv import load_dotenv
from mangum import Mangum

from models import FileDataRequest, TutorialModel

load_dotenv()
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Podcast AI Backend")


client = MongoClient(
    os.environ["MONGODB_URI"],
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000,
    socketTimeoutMS=5000,
)
db = client[os.environ["MONGODB_DB"]]
tutorials = db["tutorials"]


def create_presigned_url(bucket_name, object_name, content_type, expiration=3600):
    region = os.environ["AWS_REGION"]

    s3_client = boto3.client(
        "s3",
        region_name=region,
        endpoint_url=f"https://s3.{region}.amazonaws.com",
    )

    try:
        return s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": bucket_name,
                "Key": object_name,
                "ContentType": content_type,
            },
            ExpiresIn=expiration,
        )
    except ClientError as e:
        logging.error(e)
        return None


@app.post("/upload")
def presigned_token(request: FileDataRequest):
    try:
        file_extension = os.path.splitext(request.fileName)[1]
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        base_name = os.path.splitext(request.fileName)[0]
        object_name = f"{base_name}_{timestamp}{file_extension}"

        url = create_presigned_url(
            bucket_name=os.environ["S3_BUCKET_NAME"],
            object_name=object_name,
            content_type=request.contentType,
        )

        if not url:
            raise HTTPException(status_code=500, detail="Failed to generate presigned URL")

        s3_url = (
            f"https://{os.environ['S3_BUCKET_NAME']}"
            f".s3.{os.environ['AWS_REGION']}.amazonaws.com/{object_name}"
        )

        tutorial_data = {
            "inputUrl": s3_url,
            "fileName": request.fileName,
            "fileSize": request.fileSize,
            "fileDuration": request.fileDuration,
            "fileFormat": file_extension.lstrip("."),
            "mimeType": request.contentType,
            "status": "uploaded",
            "createdAt": datetime.utcnow(),
        }

        TutorialModel(**tutorial_data)

        result = tutorials.insert_one(tutorial_data)

        return {
            "url": url,
            "tutorialId": str(result.inserted_id),
            "s3Key": object_name,
        }

    except Exception as e:
        logging.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/tutorials", response_model=List[TutorialModel])
def list_tutorials(skip: int = 0, limit: int = 10):
    try:
        cursor = (
            tutorials.find()
            .sort("createdAt", -1)
            .skip(skip)
            .limit(limit)
        )
        return list(cursor)

    except Exception as e:
        logging.error(f"Failed to retrieve tutorials: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve tutorials")


@app.get("/tutorials/{tutorial_id}", response_model=TutorialModel)
def get_tutorial(tutorial_id: str = Path(...)):
    if not ObjectId.is_valid(tutorial_id):
        raise HTTPException(status_code=400, detail="Invalid tutorial ID format")

    tutorial = tutorials.find_one({"_id": ObjectId(tutorial_id)})

    if not tutorial:
        raise HTTPException(status_code=404, detail="Tutorial not found")

    return tutorial


handler = Mangum(app)
