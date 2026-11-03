import os
import json
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
import asyncpg
import redis
from app.config import settings

logger = logging.getLogger("genui.db")

_pg_pool: Optional[asyncpg.Pool] = None
_redis_client: Optional[redis.Redis] = None


def get_redis_client() -> Optional[redis.Redis]:
    """Returns a connected Redis client if available."""
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    try:
        client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        client.ping()
        _redis_client = client
        logger.info("Connected to Redis successfully.")
        return _redis_client
    except Exception as e:
        logger.warning(f"Could not connect to Redis: {e}")
        return None


async def get_pg_pool() -> Optional[asyncpg.Pool]:
    """Returns an asyncpg connection pool to PostgreSQL."""
    global _pg_pool
    if _pg_pool is not None:
        return _pg_pool
    try:
        pool = await asyncpg.create_pool(
            dsn=settings.DATABASE_URL,
            min_size=1,
            max_size=10,
            command_timeout=10,
        )
        _pg_pool = pool
        logger.info("Connected to PostgreSQL successfully.")
        return _pg_pool
    except Exception as e:
        logger.warning(f"Could not connect to PostgreSQL: {e}")
        return None


async def init_db():
    """Initializes PostgreSQL schema for uploaded files and chat sessions."""
    pool = await get_pg_pool()
    if pool is None:
        logger.warning("PostgreSQL pool not available during init_db, skipping schema creation.")
        return

    try:
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS uploaded_files (
                    id VARCHAR(64) PRIMARY KEY,
                    filename VARCHAR(255) NOT NULL,
                    file_path TEXT NOT NULL,
                    file_size BIGINT NOT NULL,
                    file_type VARCHAR(50) NOT NULL,
                    minio_url TEXT NOT NULL,
                    preview_url TEXT NOT NULL,
                    silo_bucket VARCHAR(100) DEFAULT 'genui-uploads',
                    silo_etag VARCHAR(100),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS chat_sessions (
                    id VARCHAR(64) PRIMARY KEY,
                    user_id VARCHAR(100) NOT NULL,
                    user_type VARCHAR(50) NOT NULL DEFAULT 'guest',
                    title TEXT NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS chat_turns (
                    id VARCHAR(64) PRIMARY KEY,
                    session_id VARCHAR(64) REFERENCES chat_sessions(id) ON DELETE CASCADE,
                    role VARCHAR(20) NOT NULL,
                    content TEXT,
                    attachment_path TEXT,
                    attachment_data JSONB,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """)
            logger.info("PostgreSQL database tables verified and initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize PostgreSQL tables: {e}")


async def save_uploaded_file(
    file_id: str,
    filename: str,
    file_path: str,
    file_size: int,
    file_type: str,
    minio_url: str,
    preview_url: str,
    silo_bucket: str = "genui-uploads",
    silo_etag: Optional[str] = None
) -> Dict[str, Any]:
    """Persists file record into PostgreSQL and caches in Redis."""
    record = {
        "id": file_id,
        "filename": filename,
        "file_path": file_path,
        "file_size": file_size,
        "file_type": file_type,
        "minio_url": minio_url,
        "preview_url": preview_url,
        "silo_bucket": silo_bucket,
        "silo_etag": silo_etag,
        "created_at": datetime.now().isoformat()
    }

    # 1. Save in PostgreSQL
    pool = await get_pg_pool()
    if pool:
        try:
            async with pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO uploaded_files (
                        id, filename, file_path, file_size, file_type, minio_url, preview_url, silo_bucket, silo_etag
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    ON CONFLICT (id) DO UPDATE SET
                        filename = EXCLUDED.filename,
                        file_size = EXCLUDED.file_size,
                        file_type = EXCLUDED.file_type,
                        minio_url = EXCLUDED.minio_url,
                        preview_url = EXCLUDED.preview_url,
                        silo_etag = EXCLUDED.silo_etag;
                """, file_id, filename, file_path, file_size, file_type, minio_url, preview_url, silo_bucket, silo_etag)
                logger.info(f"Persisted file '{filename}' into PostgreSQL table uploaded_files.")
        except Exception as e:
            logger.error(f"Error saving file record to PostgreSQL: {e}")

    # 2. Cache in Redis
    r = get_redis_client()
    if r:
        try:
            r.set(f"genui:file:{filename}", json.dumps(record), ex=86400 * 7)
            r.set(f"genui:file_id:{file_id}", json.dumps(record), ex=86400 * 7)
            r.lpush("genui:recent_uploads", json.dumps(record))
            r.ltrim("genui:recent_uploads", 0, 99)
        except Exception as e:
            logger.warning(f"Error caching file record to Redis: {e}")

    return record


async def get_uploaded_file(identifier: str) -> Optional[Dict[str, Any]]:
    """Fetches uploaded file by ID or filename from Redis or PostgreSQL."""
    # 1. Check Redis cache first
    r = get_redis_client()
    if r:
        try:
            cached = r.get(f"genui:file:{identifier}") or r.get(f"genui:file_id:{identifier}")
            if cached:
                return json.loads(cached)
        except Exception:
            pass

    # 2. Check PostgreSQL
    pool = await get_pg_pool()
    if pool:
        try:
            async with pool.acquire() as conn:
                row = await conn.fetchrow("""
                    SELECT id, filename, file_path, file_size, file_type, minio_url, preview_url, silo_bucket, silo_etag, created_at
                    FROM uploaded_files
                    WHERE id = $1 OR filename = $1
                    ORDER BY created_at DESC
                    LIMIT 1;
                """, identifier)
                if row:
                    return {
                        "id": row["id"],
                        "filename": row["filename"],
                        "file_path": row["file_path"],
                        "file_size": row["file_size"],
                        "file_type": row["file_type"],
                        "minio_url": row["minio_url"],
                        "preview_url": row["preview_url"],
                        "silo_bucket": row["silo_bucket"],
                        "silo_etag": row["silo_etag"],
                        "created_at": row["created_at"].isoformat() if row["created_at"] else None
                    }
        except Exception as e:
            logger.error(f"Error retrieving file record from PostgreSQL: {e}")

    return None
