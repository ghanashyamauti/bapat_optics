import cv2
import os

video_path = "public/videos/hero-orbit.mp4"
output_dir = "public/frames/hero"

os.makedirs(output_dir, exist_ok=True)

cap = cv2.VideoCapture(video_path)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps = cap.get(cv2.CAP_PROP_FPS)

print(f"Extracting {total_frames} frames at {fps} fps from {video_path} into {output_dir}...")

frame_idx = 0
saved_count = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    
    frame_idx += 1
    h, w = frame.shape[:2]
    
    # 1600px width provides ultra-crisp retina quality while keeping WebP ~30-40KB each
    target_w = 1600
    target_h = int(h * (target_w / w))
    resized = cv2.resize(frame, (target_w, target_h), interpolation=cv2.INTER_AREA)
    
    out_file = os.path.join(output_dir, f"frame_{frame_idx:03d}.webp")
    cv2.imwrite(out_file, resized, [cv2.IMWRITE_WEBP_QUALITY, 84])
    saved_count += 1
    
    if saved_count % 30 == 0:
        print(f"Progress: {saved_count}/{total_frames} frames extracted...")

cap.release()
print(f"Done! Successfully extracted {saved_count} frames to {output_dir}/")
