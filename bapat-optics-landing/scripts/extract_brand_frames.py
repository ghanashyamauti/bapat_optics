import cv2
import os

video_path = "BAPAT_OPTICS_brand_film_animation_20260921171703.mp4"
output_dir = "public/frames/brands"
os.makedirs(output_dir, exist_ok=True)

cap = cv2.VideoCapture(video_path)
if not cap.isOpened():
    print(f"Error: Could not open {video_path}")
    exit(1)

total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps = cap.get(cv2.CAP_PROP_FPS)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

print(f"Video Info: {total_frames} frames, {fps} fps, {width}x{height}")

frame_idx = 0
saved_count = 0

# Target resolution: 1440px wide for crystal-clear Retina canvas drawing
target_w = 1440
target_h = int(height * (target_w / width)) if width > 0 else 810

print(f"Extracting frames to {output_dir} at {target_w}x{target_h} (WebP quality 84)...")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    
    frame_idx += 1
    resized = cv2.resize(frame, (target_w, target_h), interpolation=cv2.INTER_AREA)
    out_file = os.path.join(output_dir, f"frame_{frame_idx:03d}.webp")
    cv2.imwrite(out_file, resized, [cv2.IMWRITE_WEBP_QUALITY, 84])
    saved_count += 1
    
    if saved_count % 30 == 0 or saved_count == total_frames:
        print(f"Progress: {saved_count}/{total_frames} frames extracted...")

cap.release()
print(f"Completed! Successfully extracted {saved_count} frames to {output_dir}/")
