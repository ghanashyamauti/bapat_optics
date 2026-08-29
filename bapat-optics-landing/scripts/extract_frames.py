import cv2
import os

video_path = "Eyeglasses_frame_assembling_1080p_202608261109.mp4"
output_dir = "public/frames/assembly"

os.makedirs(output_dir, exist_ok=True)

cap = cv2.VideoCapture(video_path)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps = cap.get(cv2.CAP_PROP_FPS)

print(f"Extracting {total_frames} frames at {fps} fps from {video_path}...")

frame_idx = 0
saved_count = 0

# We extract all frames or smooth step frames (240 frames total)
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    
    frame_idx += 1
    # Save as high quality WebP (e.g., 1440px wide for crisp retinal quality and fast canvas draw)
    # Resize slightly if 1920x1080 to maintain optimal memory and performance
    h, w = frame.shape[:2]
    target_w = 1440
    target_h = int(h * (target_w / w))
    resized_frame = cv2.resize(frame, (target_w, target_h), interpolation=cv2.INTER_AREA)
    
    out_file = os.path.join(output_dir, f"frame_{frame_idx:03d}.webp")
    # Quality 82 provides high visual crispness at small file sizes
    cv2.imwrite(out_file, resized_frame, [cv2.IMWRITE_WEBP_QUALITY, 82])
    saved_count += 1

cap.release()
print(f"Successfully extracted {saved_count} frames to {output_dir}/")
