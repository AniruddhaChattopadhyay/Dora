# Face Detection API

A FastAPI-based API that provides face detection and recognition capabilities using OpenCV and face_recognition libraries, with Celery for background task processing and Redis for job status tracking.

## Features

- Face detection in video streams
- Face recognition against reference images
- Real-time visualization of detected faces
- Tracking of face appearances in video
- Support for both HOG (faster) and CNN (more accurate) face detection models
- FastAPI for high-performance API endpoints
- Automatic API documentation with Swagger UI
- Background task processing with Celery
- Job status tracking with Redis

## Prerequisites

- Python 3.12+
- OpenCV
- face_recognition
- dlib (required by face_recognition)
- uv (Python package installer)
- Redis server
- Celery

## Setup

1. Install dependencies using uv:

```bash
# Install uv if you haven't already
pip install uv

# Do uv init
uv init

# uv sync
uv sync
```

2. Activate the uv virtual environment:

```bash
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

Note: Installing dlib might require additional system dependencies:

- On Ubuntu/Debian: `sudo apt-get install cmake`
- On macOS: `brew install cmake`
- On Windows: Install Visual Studio Build Tools

3. Install and start Redis:

```bash
# On Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server

# On macOS
brew install redis
brew services start redis

# On Windows
# Download and install Redis from https://github.com/microsoftarchive/redis/releases
# Start Redis server from the installation directory
```

## Running the Application

The application requires three components to run:

1. Redis server (for job status tracking)
2. Celery worker (for background task processing)
3. FastAPI server (for API endpoints)

### Start Redis (if not already running)

```bash
# Check Redis status
redis-cli ping  # Should return PONG
```

### Start Celery Worker

```bash
# Start Celery worker
celery -A celery_app worker --loglevel=info
```

### Start FastAPI Server

```bash
# Start the API server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

The API provides the following endpoints:

### Create Face Detection Job

**URL:** `/jobs/`

**Method:** POST

**Request:**

- `video`: Video file (multipart/form-data)
- `face`: Reference face image (multipart/form-data)

**Response:**

```json
{
  "id": "job-uuid",
  "status": "queued"
}
```

### Check Job Status

**URL:** `/jobs/{job_id}`

**Method:** GET

**Response:**

```json
{
  "status": "queued|processing|completed|failed",
  "appearances": [[start_time, end_time], ...]  // Only present when completed
}
```

### API Documentation

FastAPI automatically generates interactive API documentation:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

Using curl:

```bash
# Create a new job
curl -X POST -F "video=@path/to/video.mp4" -F "face=@path/to/face.jpg" http://localhost:8000/jobs/

# Check job status
curl http://localhost:8000/jobs/{job_id}
```

Or visit the interactive API documentation at http://localhost:8000/docs

## Performance Notes

- HOG model is faster but less accurate
- CNN model is more accurate but requires more computational resources
- Visualization can be disabled for better performance
- Processing stride can be adjusted to balance between accuracy and speed
- FastAPI provides high performance with async support
- uv offers faster package installation and dependency resolution
- Celery enables parallel processing of multiple jobs
- Redis provides fast job status tracking and result storage
