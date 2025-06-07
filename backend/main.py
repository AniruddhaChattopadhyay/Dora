# main.py
from fastapi import FastAPI, File, HTTPException, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import redis
from celery_app import celery_app
import logging
import json
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis connection
r = redis.Redis()


class JobStatus(BaseModel):
    id: str
    status: str
    appearances: Optional[List[List[float]]] = None


@app.post("/jobs/")
async def create_job(
    video: UploadFile = File(...),
    face: UploadFile = File(...),
    job_id: str = Form(...),
    user_id: str = Form(...),
):
    tmp_video = f"/tmp/{job_id}.mp4"
    tmp_face = f"/tmp/{job_id}.jpg"

    logger.info(f"Starting processing for job {job_id} (user: {user_id})")
    logger.info(f"Saving video to {tmp_video}")
    logger.info(f"Saving face to {tmp_face}")

    with open(tmp_video, "wb") as f:
        f.write(await video.read())
    with open(tmp_face, "wb") as f:
        f.write(await face.read())

    # Initialize job status in Redis
    r.hset(f"job:{job_id}", mapping={"status": "processing"})

    celery_app.send_task("tasks.find_me", args=[job_id, tmp_video, tmp_face])
    return {"id": job_id, "status": "processing"}


@app.get("/jobs/{job_id}")
def job_status(job_id: str):
    logger.info(f"Checking status for job {job_id}")
    job_dict = r.hgetall(f"job:{job_id}")

    if not job_dict:
        logger.error(f"Job {job_id} not found in Redis")
        return {"status": "not_found"}

    # Decode bytes to strings and parse JSON
    decoded_dict = {k.decode(): v.decode() for k, v in job_dict.items()}
    if "appearances" in decoded_dict:
        decoded_dict["appearances"] = json.loads(decoded_dict["appearances"])

    logger.info(f"Job {job_id} status: {decoded_dict}")
    return decoded_dict
