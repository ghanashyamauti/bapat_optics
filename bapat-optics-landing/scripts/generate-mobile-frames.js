import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..");
const SOURCE_DIR = path.join(ROOT_DIR, "public", "frames", "assembly");
const OUTPUT_DIR = path.join(ROOT_DIR, "public", "frames", "assembly-mobile");

const TARGET_WIDTH = 720;
const WEBP_QUALITY = 82;
const TOTAL_FRAMES = 240;

async function generateMobileFrames() {
  console.log("==================================================");
  console.log(" Bapat Optics — Mobile Frame Optimization Engine");
  console.log("==================================================");
  console.log(`Source folder: ${SOURCE_DIR}`);
  console.log(`Output folder: ${OUTPUT_DIR}`);
  console.log(`Target width:  ${TARGET_WIDTH}px (16:9 aspect ratio -> 720x405)`);
  console.log(`WebP quality:  ${WEBP_QUALITY} (effort: 5)\n`);

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Error: Source directory "${SOURCE_DIR}" not found.`);
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }

  let totalOriginalBytes = 0;
  let totalMobileBytes = 0;
  let tier1MobileBytes = 0;
  let processedCount = 0;

  const files = fs
    .readdirSync(SOURCE_DIR)
    .filter((f) => f.startsWith("frame_") && f.endsWith(".webp"))
    .sort();

  console.log(`Found ${files.length} frames to process...\n`);

  const startTime = Date.now();

  // Process in concurrent batches of 8 for fast I/O & CPU throughput
  const CONCURRENCY = 8;
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (filename) => {
        const srcPath = path.join(SOURCE_DIR, filename);
        const destPath = path.join(OUTPUT_DIR, filename);

        const srcStat = fs.statSync(srcPath);
        totalOriginalBytes += srcStat.size;

        await sharp(srcPath)
          .resize(TARGET_WIDTH, null, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({
            quality: WEBP_QUALITY,
            effort: 5,
            smartSubsample: true,
          })
          .toFile(destPath);

        const destStat = fs.statSync(destPath);
        totalMobileBytes += destStat.size;

        const frameNumMatch = filename.match(/frame_(\d+)\.webp/);
        if (frameNumMatch) {
          const num = parseInt(frameNumMatch[1], 10);
          if (num === 1 || num % 4 === 1 || num === TOTAL_FRAMES) {
            tier1MobileBytes += destStat.size;
          }
        }

        processedCount++;
      })
    );

    const progressPercent = Math.round((processedCount / files.length) * 100);
    process.stdout.write(`\rProgress: ${processedCount}/${files.length} frames (${progressPercent}%)`);
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  const origMB = (totalOriginalBytes / (1024 * 1024)).toFixed(2);
  const mobileMB = (totalMobileBytes / (1024 * 1024)).toFixed(2);
  const tier1KB = (tier1MobileBytes / 1024).toFixed(1);
  const reductionPercent = (
    ((totalOriginalBytes - totalMobileBytes) / totalOriginalBytes) *
    100
  ).toFixed(1);

  console.log("\n\n==================================================");
  console.log(" Optimization Complete!");
  console.log("==================================================");
  console.log(`Time elapsed:         ${durationSec}s`);
  console.log(`Frames processed:     ${processedCount}`);
  console.log(`Original total size:  ${origMB} MB (1440x810 source)`);
  console.log(`Mobile total size:    ${mobileMB} MB (720x405 optimized)`);
  console.log(`Payload reduction:    -${reductionPercent}% (${(origMB - mobileMB).toFixed(2)} MB saved)`);
  console.log(`Tier-1 sample size:   ${tier1KB} KB (~60 keyframes for instant scrub)`);
  console.log("==================================================\n");
}

generateMobileFrames().catch((err) => {
  console.error("Error generating mobile frames:", err);
  process.exit(1);
});
