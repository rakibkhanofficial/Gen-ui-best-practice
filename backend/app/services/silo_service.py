import os
import io
import json
import logging
from datetime import datetime
from minio import Minio
from minio.error import S3Error
from typing import Optional, Dict, Any, List

logger = logging.getLogger("genui.silo")

SILO_ENDPOINT = os.getenv("SILO_ENDPOINT", "localhost:9000")
SILO_ACCESS_KEY = os.getenv("SILO_ACCESS_KEY", "siloadmin")
SILO_SECRET_KEY = os.getenv("SILO_SECRET_KEY", "silopassword")
SILO_BUCKET = os.getenv("SILO_BUCKET", "genui-uploads")
SILO_CONSOLE_URL = os.getenv("NEXT_PUBLIC_SILO_CONSOLE_URL", "http://localhost:9001")

_silo_client: Optional[Minio] = None


def get_silo_client() -> Optional[Minio]:
    """Initializes, configures, and returns the Silo S3/MinIO client with public download policy."""
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

        # Ensure public read policy for browser direct access
        try:
            public_policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {"AWS": ["*"]},
                        "Action": ["s3:GetBucketLocation", "s3:ListBucket"],
                        "Resource": [f"arn:aws:s3:::{SILO_BUCKET}"]
                    },
                    {
                        "Effect": "Allow",
                        "Principal": {"AWS": ["*"]},
                        "Action": ["s3:GetObject"],
                        "Resource": [f"arn:aws:s3:::{SILO_BUCKET}/*"]
                    }
                ]
            }
            client.set_bucket_policy(SILO_BUCKET, json.dumps(public_policy))
        except Exception as pe:
            logger.warning(f"Could not set public bucket policy: {pe}")

        _silo_client = client
        logger.info(f"Connected to Silo S3 object storage at {SILO_ENDPOINT} (Bucket: {SILO_BUCKET})")
        return _silo_client
    except Exception as e:
        logger.warning(f"Could not connect to Silo at {SILO_ENDPOINT}: {e}")
        return None


def upload_to_silo(
    filename: str,
    file_bytes: bytes,
    content_type: str = "application/octet-stream"
) -> Dict[str, Any]:
    """Uploads file bytes to Silo MinIO object storage."""
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
        minio_url = f"http://{SILO_ENDPOINT}/{SILO_BUCKET}/{filename}"
        return {
            "uploaded_to_silo": True,
            "bucket": SILO_BUCKET,
            "object_name": filename,
            "etag": result.etag,
            "version_id": result.version_id,
            "minio_url": minio_url,
            "public_url": minio_url,
            "s3_uri": f"s3://{SILO_BUCKET}/{filename}",
            "size_bytes": len(file_bytes),
            "size_kb": round(len(file_bytes) / 1024, 1),
            "content_type": content_type,
            "console_url": f"{SILO_CONSOLE_URL}/browser/{SILO_BUCKET}"
        }
    except Exception as e:
        logger.error(f"Failed to upload to Silo: {e}")
        return {"uploaded_to_silo": False, "error": str(e)}


def list_silo_objects(prefix: str = "") -> List[Dict[str, Any]]:
    """Lists objects stored in the Silo MinIO bucket with categorizations."""
    client = get_silo_client()
    if client is None:
        return []

    try:
        objects = client.list_objects(SILO_BUCKET, prefix=prefix, recursive=True)
        results = []
        for obj in objects:
            ext = os.path.splitext(obj.object_name.lower())[1]
            if ext in [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"]:
                file_type = "image"
            elif ext in [".pdf", ".doc", ".docx", ".txt", ".md"]:
                file_type = "document"
            elif ext in [".xlsx", ".xls", ".csv"]:
                file_type = "spreadsheet"
            else:
                file_type = "other"

            size_kb = round(obj.size / 1024, 1) if obj.size else 0.0
            last_mod_iso = obj.last_modified.isoformat() if obj.last_modified else datetime.now().isoformat()
            minio_url = f"http://{SILO_ENDPOINT}/{SILO_BUCKET}/{obj.object_name}"

            results.append({
                "object_name": obj.object_name,
                "filename": obj.object_name,
                "size_bytes": obj.size,
                "size_kb": size_kb,
                "size_formatted": f"{size_kb} KB" if size_kb < 1024 else f"{round(size_kb/1024, 2)} MB",
                "last_modified": last_mod_iso,
                "etag": getattr(obj, "etag", "").strip('"'),
                "content_type": getattr(obj, "content_type", "application/octet-stream"),
                "file_type": file_type,
                "minio_url": minio_url,
                "s3_uri": f"s3://{SILO_BUCKET}/{obj.object_name}",
                "download_url": minio_url,
                "proxy_url": f"/api/files/{obj.object_name}"
            })
        # Sort newest first
        results.sort(key=lambda x: x["last_modified"], reverse=True)
        return results
    except Exception as e:
        logger.error(f"Failed to list objects in Silo: {e}")
        return []


def get_silo_stats() -> Dict[str, Any]:
    """Returns overview metrics for the Silo MinIO storage bucket."""
    objects = list_silo_objects()
    total_size = sum(item["size_bytes"] for item in objects)
    total_size_kb = round(total_size / 1024, 1)

    type_counts = {
        "images": sum(1 for item in objects if item["file_type"] == "image"),
        "documents": sum(1 for item in objects if item["file_type"] == "document"),
        "spreadsheets": sum(1 for item in objects if item["file_type"] == "spreadsheet"),
        "other": sum(1 for item in objects if item["file_type"] == "other")
    }

    return {
        "status": "online",
        "storage_provider": "Silo (MinIO S3 Compatible)",
        "endpoint": f"http://{SILO_ENDPOINT}",
        "console_url": f"{SILO_CONSOLE_URL}/browser/{SILO_BUCKET}",
        "bucket": SILO_BUCKET,
        "total_files": len(objects),
        "total_size_bytes": total_size,
        "total_size_kb": total_size_kb,
        "total_size_formatted": f"{total_size_kb} KB" if total_size_kb < 1024 else f"{round(total_size_kb/1024, 2)} MB",
        "type_counts": type_counts,
        "files": objects[:50]
    }
