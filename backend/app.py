import os
import logging
import boto3

from fastapi import FastAPI
from pydantic import BaseModel

from botocore.exceptions import ClientError
from botocore.config import Config

from dotenv import load_dotenv

from pydantic import BaseModel

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Podcast AI Backend")

load_dotenv()

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


class FileDataRequest(BaseModel):
    fileName: str
    fileSize: int
    fileDuration: int
    contentType: str


@app.post("/upload")
def presigned_token(request: FileDataRequest):
    logging.info(f"fileName: {request.fileName} fileSize: {request.fileSize} fileDuration: {request.fileDuration}")

    object_name = f"uploads/{request.fileName}"

    url = create_presigned_url(
        bucket_name=os.environ['S3_BUCKET_NAME'],
        object_name=object_name,
        content_type=request.contentType
    )
    
    if url is None:
        raise HTTPException(status_code=500, detail="Failed to generate presigned URL")
    
    return {"url": url}