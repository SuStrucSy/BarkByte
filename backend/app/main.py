import os
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from minio import Minio

from backend.app.core.db import get_session
from app.models import Song, SongCreate

MINIO_ACCESS_KEY = os.getenv("S3_ACCESS_KEY_ID")
MINIO_SECRET_KEY = os.getenv("S3_SECRET_ACCESS_KEY")

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MinIO client
minio_client = Minio(
    "minio:9000",
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=False
)


@app.get("/ping")
async def pong():
    return {"ping": "pong!"}
