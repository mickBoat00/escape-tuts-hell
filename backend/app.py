from fastapi import FastAPI
from pydantic import BaseModel

import logging
import boto3
from botocore.exceptions import ClientError

from dotenv import load_dotenv


app = FastAPI(title="Podcast AI Backend")

load_dotenv()

def create_presigned_post(
    bucket_name, object_name, fields=None, conditions=None, expiration=3600
):
    s3_client = boto3.client('s3')
    try:
        response = s3_client.generate_presigned_post(
            bucket_name,
            object_name,
            Fields=fields,
            Conditions=conditions,
            ExpiresIn=expiration,
        )
    except ClientError as e:
        logging.error(e)
        return None

    return response

class FileDataRequest(BaseModel):
    fileName: str
    fileSize: int
    fileDuration: int


@app.post("/upload")
def presigned_token(request: FileDataRequest):
    logging.info(f"fileName: {request.filename} fileSize: {request.fileSize} fileDuration: {request.fileDuration}")
    return create_presigned_post(
        bucket_name = "podcast-ai-blob-storage-305870070165",
        object_name = "uploads/"
    )
