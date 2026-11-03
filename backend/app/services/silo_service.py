import os
import io
import logging
from minio import Minio
from minio.error import S3Error
from typing import Optional, Dict, Any

logger = logging.getLogger("genui.silo")

SILO_ENDPOINT = os.getenv("SILO_ENDPOINT", "localhost:9000")
SILO_ACCESS_KEY = os.getenv("SILO_ACCESS_KEY", "siloadmin")
SILO_SECRET_KEY = os.getenv("SILO_SECRET_KEY", "silopassword")
SILO_BUCKET = "genui-uploads"

_silo_client: Optional[Minio] = None


def get_silo_client() -> Optional[Minio]:
    """Initializes and returns the Silo S3 client."""
    global _silo_client
    if _silo_client is not None:
        return _silo_client

    try:
        client = Minio(
            SILO_ENDPOINT,
            access_key=SILO_ACCESS_KEY,
            secret_key=SILO_SECRET_KEY,
            secure=False
        )
        # Ensure default bucket exists
        if not client.bucket_exists(SILO_BUCKET):
            client.make_bucket(SILO_BUCKET)
            logger.info(f"Created Silo bucket: {SILO_BUCKET}")
        _silo_client = client
        logger.info(f"Connected to Silo S3 object storage at {SILO_ENDPOINT}")
        return _silo_client
    except Exception as e:
        logger.warning(f"Could not connect to Silo at {SILO_ENDPOINT}: {e}")
        return None


def upload_to_silo(filename: str, file_bytes: bytes, content_type: str = "application/octet-stream") -> Dict[str, Any]:
    """Uploads file bytes to Silo object storage."""
    client = get_silo_client()
    if client is None:
        return {"uploaded_to_silo": False, "reason": "Silo offline"}

    try:
        data_stream = io.BytesIO(file_bytes)
        result = client.put_object(
            bucket_name=SILO_BUCKET,
            object_name=filename,
            data=data_stream,
            length=len(file_bytes),
            content_type=content_type
        )
        return {
            "uploaded_to_silo": True,
            "bucket": SILO_BUCKET,
            "object_name": filename,
            "etag": result.etag,
            "version_id": result.version_id
        }
    except Exception as e:
        logger.error(f"Failed to upload to Silo: {e}")
        return {"uploaded_to_silo": False, "error": str(e)}

