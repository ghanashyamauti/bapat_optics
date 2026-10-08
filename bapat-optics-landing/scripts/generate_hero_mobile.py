import cv2
import os
import glob

input_dir = "public/frames/hero"
output_dir = "public/frames/hero-mobile"
os.makedirs(output_dir, exist_ok=True)

files = sorted(glob.glob(f"{input_dir}/*.webp"))
print(f"Generating mobile frames for {len(files)} frames...")

for idx, f in enumerate(files):
    img = cv2.imread(f)
    if img is None:
        continue
    h, w = img.shape[:2]
    tw = 720
    th = int(h * (tw / w))
    resized = cv2.resize(img, (tw, th), interpolation=cv2.INTER_AREA)
    out_name = os.path.join(output_dir, os.path.basename(f))
    cv2.imwrite(out_name, resized, [cv2.IMWRITE_WEBP_QUALITY, 80])
    if (idx + 1) % 40 == 0:
        print(f"{idx + 1}/{len(files)} mobile frames done...")

print("All mobile frames generated successfully!")
