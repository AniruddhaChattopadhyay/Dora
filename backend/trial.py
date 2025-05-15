# tasks.py
import face_recognition
import cv2
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def find_me(show_visualization=True):
    video_path = "vid_short.mp4"
    face_path = "face.jpeg"
    stride_ms = 300
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

    # Create output video writer only if visualization is enabled
    out = None
    if show_visualization:
        output_path = "output_video.mp4"
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out = cv2.VideoWriter(
            output_path,
            fourcc,
            fps,
            (
                int(vid.get(cv2.CAP_PROP_FRAME_WIDTH)),
                int(vid.get(cv2.CAP_PROP_FRAME_HEIGHT)),
            ),
        )

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

            # Convert BGR to RGB for face recognition
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # Find all face locations in the frame
            face_locations = face_recognition.face_locations(rgb, model="hog") #change to cnn for higher accuracy

            if face_locations:
                logger.debug(f"Found {len(face_locations)} faces in frame {frame_idx}")
                # Get face encodings for all faces in the frame
                face_encodings = face_recognition.face_encodings(rgb, face_locations)

                # Compare each face with the reference face
                face_found = False
                for i, (face_encoding, (top, right, bottom, left)) in enumerate(
                    zip(face_encodings, face_locations)
                ):
                    matches = face_recognition.compare_faces(
                        [ref_encoding], face_encoding, tolerance=0.5
                    )

                    # Draw rectangle around face only if visualization is enabled
                    if show_visualization:
                        if matches[0]:  # If there's a match
                            color = (0, 255, 0)  # Green for match
                        else:
                            color = (0, 0, 255)  # Red for non-match

                        cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
                        label = "Match" if matches[0] else "No Match"
                        cv2.putText(
                            frame,
                            label,
                            (left, top - 10),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.5,
                            color,
                            2,
                        )

                    if matches[0]:  # If there's a match
                        face_found = True
                        current_time = frame_idx / fps
                        if current_start is None:
                            current_start = current_time
                            logger.info(f"Face appeared at {current_time:.2f}s")
                        last_match_frame = frame_idx

                if not face_found and current_start is not None:
                    # Face disappeared
                    end_time = last_match_frame / fps
                    appearances.append((round(current_start, 2), round(end_time, 2)))
                    logger.info(
                        f"Face disappeared at {end_time:.2f}s (duration: {end_time - current_start:.2f}s)"
                    )
                    current_start = None
                    last_match_frame = None

            # Write the frame to output video if visualization is enabled
            if show_visualization:
                out.write(frame)

                # Display the frame
                cv2.imshow("Face Detection", frame)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break

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

    # Cleanup
    vid.release()
    if show_visualization:
        out.release()
        cv2.destroyAllWindows()
        logger.info(f"Output video saved to: {output_path}")
    logger.info("Task completed successfully")
    logger.info(f"Appearances: {appearances}")


# Example usage:
# find_me(show_visualization=True)  # With visualization
# find_me(show_visualization=False)  # Without visualization
find_me(show_visualization=False)  # Default with visualization
