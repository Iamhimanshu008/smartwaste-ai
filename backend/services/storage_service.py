"""
Storage service: Handle image uploads to MinIO (S3 compatible) storage.
"""
import json
import logging
import os
import uuid
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from fastapi import HTTPException

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MinIO Configuration
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "http://minio:9000")
MINIO_ROOT_USER = os.getenv("MINIO_ROOT_USER", "minioadmin")
MINIO_ROOT_PASSWORD = os.getenv("MINIO_ROOT_PASSWORD", "minioadminpassword")
BUCKET_NAME = "smartwaste-photos"
PUBLIC_URL_PREFIX = os.getenv("MINIO_PUBLIC_URL", "http://localhost:9000")

# Initialize boto3 client
s3_client = boto3.client(
    "s3",
    endpoint_url=MINIO_ENDPOINT,
    aws_access_key_id=MINIO_ROOT_USER,
    aws_secret_access_key=MINIO_ROOT_PASSWORD,
    config=Config(signature_version="s3v4"),
)


def _init_bucket():
    """Ensure the bucket exists and has a public read policy."""
    try:
        s3_client.head_bucket(Bucket=BUCKET_NAME)
        logger.info(f"Bucket '{BUCKET_NAME}' already exists.")
    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        if error_code == "404":
            logger.info(f"Bucket '{BUCKET_NAME}' not found. Creating...")
            s3_client.create_bucket(Bucket=BUCKET_NAME)
            
            # Set public read policy so images can be accessed directly via URL
            policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Sid": "PublicReadGetObject",
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": "s3:GetObject",
                        "Resource": f"arn:aws:s3:::{BUCKET_NAME}/*"
                    }
                ]
            }
            s3_client.put_bucket_policy(Bucket=BUCKET_NAME, Policy=json.dumps(policy))
            logger.info(f"Public read policy applied to '{BUCKET_NAME}'.")
        else:
            logger.error(f"Error checking bucket: {e}")
            raise


# Run bucket initialization synchronously on module load
try:
    _init_bucket()
except Exception as e:
    logger.warning(f"Could not initialize MinIO bucket on startup. Make sure MinIO is running. Error: {e}")


def upload_image(file_bytes: bytes, filename: str, content_type: str = "image/jpeg") -> str:
    """
    Upload an image to MinIO and return its public URL.
    """
    if not filename:
        ext = ".jpg" if "jpeg" in content_type else ".png"
        filename = f"{uuid.uuid4().hex}{ext}"

    try:
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=filename,
            Body=file_bytes,
            ContentType=content_type,
        )
        
        # Return direct URL
        # For mobile physical devices, MINIO_PUBLIC_URL in .env might need 
        # to be set to your local network IP (e.g. http://192.168.1.X:9000).
        return f"{PUBLIC_URL_PREFIX}/{BUCKET_NAME}/{filename}"
        
    except ClientError as e:
        logger.error(f"S3 Upload failed: {e}")
        raise HTTPException(status_code=500, detail="Storage service error during image upload.")
