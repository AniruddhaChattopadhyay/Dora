# tasks.py
import face_recognition
import cv2
import json
import redis
from celery_app import celery_app
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@celery_app.task(name="tasks.find_me")
def find_me(job_id, video_path, face_path, stride_ms=300):
    logger.info(f"Starting face detection task for job {job_id}")
    logger.info(f"Processing video: {video_path}")
    logger.info(f"Reference face: {face_path}")

    # 1️⃣ encode reference face
    logger.info("Loading and encoding reference face...")
    ref_img = face_recognition.load_image_file(face_path)
    ref_encoding = face_recognition.face_encodings(ref_img)[0]
    logger.info("Reference face encoded successfully")

    # 2️⃣ open video
    logger.info("Opening video file...")
    vid = cv2.VideoCapture(video_path)
    fps = vid.get(cv2.CAP_PROP_FPS)
    total_frames = int(vid.get(cv2.CAP_PROP_FRAME_COUNT))
    stride = int((stride_ms / 1000.0) * fps)

    logger.info(
        f"Video details - FPS: {fps}, Total frames: {total_frames}, Stride: {stride}"
    )

    # Track continuous appearances
    appearances = []
    current_start = None
    last_match_frame = None
    frame_idx = 0
    processed_frames = 0

    while True:
        ret, frame = vid.read()
        if not ret:
            break
        if frame_idx % stride == 0:
            processed_frames += 1
            if processed_frames % 10 == 0:  # Log every 10 processed frames
                logger.info(
                    f"Processing frame {frame_idx}/{total_frames} ({frame_idx / total_frames * 100:.1f}%)"
                )

            # Convert BGR to RGB
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # Find all face locations in the frame
            face_locations = face_recognition.face_locations(rgb, model="hog")

            if face_locations:
                logger.debug(f"Found {len(face_locations)} faces in frame {frame_idx}")
                # Get face encodings for all faces in the frame
                face_encodings = face_recognition.face_encodings(rgb, face_locations)

                # Compare each face with the reference face
                face_found = False
                for face_encoding in face_encodings:
                    matches = face_recognition.compare_faces(
                        [ref_encoding], face_encoding, tolerance=0.6
                    )
                    if matches[0]:  # If there's a match
                        face_found = True
                        current_time = frame_idx / fps
                        if current_start is None:
                            current_start = current_time
                            logger.info(f"Face appeared at {current_time:.2f}s")
                        last_match_frame = frame_idx
                        break

                if not face_found and current_start is not None:
                    # Face disappeared
                    end_time = last_match_frame / fps
                    appearances.append((round(current_start, 2), round(end_time, 2)))
                    logger.info(
                        f"Face disappeared at {end_time:.2f}s (duration: {end_time - current_start:.2f}s)"
                    )
                    current_start = None
                    last_match_frame = None
        frame_idx += 1

    # Handle case where face is still visible at the end of video
    if current_start is not None:
        end_time = last_match_frame / fps
        appearances.append((round(current_start, 2), round(end_time, 2)))
        logger.info(
            f"Face still visible at end of video (last seen at {end_time:.2f}s)"
        )

    # 3️⃣ save JSON to Redis / DB
    logger.info(f"Processing complete. Found {len(appearances)} continuous appearances")
    logger.info(f"Appearances: {appearances}")

    r = redis.Redis()
    r.hset(
        f"job:{job_id}",
        mapping={"status": "done", "appearances": json.dumps(appearances)},
    )
    logger.info(f"Results saved to Redis for job {job_id}")

    # Cleanup
    vid.release()
    logger.info("Task completed successfully")
