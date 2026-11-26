import logging
from typing import Dict, Any, Optional, List
from app.services.silo_service import (
    get_silo_stats,
    list_silo_objects,
    SILO_BUCKET,
    SILO_ENDPOINT,
    SILO_CONSOLE_URL
)

logger = logging.getLogger("genui.tools.silo")


def explore_silo_storage(
    query: Optional[str] = None,
    file_type: Optional[str] = None
) -> Dict[str, Any]:
    """Inspects and manages files, documents, images, and datasets stored in Silo MinIO S3 object storage."""
    stats = get_silo_stats()
    all_files = stats.get("files", [])

    filtered_files = all_files
    if file_type and file_type != "all":
        ft = file_type.lower()
        if ft in ["doc", "docs", "document", "documents", "pdf"]:
            filtered_files = [f for f in filtered_files if f.get("file_type") == "document"]
        elif ft in ["image", "images", "img", "photo", "picture"]:
            filtered_files = [f for f in filtered_files if f.get("file_type") == "image"]
        elif ft in ["spreadsheet", "spreadsheets", "excel", "csv", "sheet"]:
            filtered_files = [f for f in filtered_files if f.get("file_type") == "spreadsheet"]

    if query:
        q = query.lower().strip()
        filtered_files = [
            f for f in filtered_files
            if q in f.get("filename", "").lower() or q in f.get("file_type", "").lower()
        ]

    return {
        "status": "online",
        "storage_provider": "Silo MinIO S3 Object Storage",
        "bucket": SILO_BUCKET,
        "endpoint": f"http://{SILO_ENDPOINT}",
        "console_url": f"{SILO_CONSOLE_URL}/browser/{SILO_BUCKET}",
        "total_files": stats.get("total_files", 0),
        "total_size_formatted": stats.get("total_size_formatted", "0 KB"),
        "type_counts": stats.get("type_counts", {"images": 0, "documents": 0, "spreadsheets": 0, "other": 0}),
        "active_filter": file_type or "all",
        "search_query": query or "",
        "files": filtered_files,
        "sample_files_available": len(filtered_files) > 0,
        "recommended_actions": [
            {"label": "Analyze First Document", "prompt": "Analyze the latest document in Silo MinIO"},
            {"label": "Inspect Latest Image", "prompt": "Inspect the visual features of the latest image in Silo"},
            {"label": "Open MinIO Console", "url": f"{SILO_CONSOLE_URL}/browser/{SILO_BUCKET}"}
        ]
    }
