import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';
import path from 'path';

// Node.js FileReader Polyfill for Three.js GLTFExporter
if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class FileReader {
    constructor() {
      this.result = null;
      this.onload = null;
      this.onloadend = null;
    }
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = buf;
        if (this.onload) this.onload({ target: this });
        if (this.onloadend) this.onloadend({ target: this });
      });
    }
    readAsDataURL(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = 'data:application/octet-stream;base64,' + Buffer.from(buf).toString('base64');
        if (this.onload) this.onload({ target: this });
        if (this.onloadend) this.onloadend({ target: this });
      });
    }
  };
}

// Create a luxury glasses 3D model
const scene = new THREE.Scene();
scene.name = "BapatOptics_Luxury_Eyewear";

// 1. Luxury Materials
// Italian Mazzucchelli Dark Amber Tortoiseshell / Obsidian Acetate
const acetateMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0x1a120b), // Deep espresso / dark tortoiseshell
  roughness: 0.15,
  metalness: 0.05,
  name: "Italian_Acetate",
});

// 18k Polished Gold Titanium
const goldMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0xd4af37), // 18k Luxury Gold
  roughness: 0.22,
  metalness: 0.95,
  name: "18k_Gold_Titanium",
});

// Zeiss Clear Anti-Reflective Optical Lenses
const zeissLensMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color(0xd4e9f7), // Subtle blue-violet optical hue
  transparent: true,
  opacity: 0.45,
  roughness: 0.05,
  metalness: 0.1,
  transmission: 0.85,
  ior: 1.52,
  reflectivity: 0.9,
  clearcoat: 1.0,
  clearcoatRoughness: 0.05,
  name: "Zeiss_Optical_Lens",
});

// Ergonomic Silicone Nose Pads
const siliconeMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0xf5f5f7),
  transparent: true,
  opacity: 0.7,
  roughness: 0.4,
  metalness: 0.0,
  name: "Silicone_Nosepad",
});

const glassesGroup = new THREE.Group();
glassesGroup.name = "Glasses_Assembly";

// 2. Helper to create rounded rim shape
function createRimMesh(isLeft = true) {
  const rimGroup = new THREE.Group();
  const sign = isLeft ? -1 : 1;
  const offsetX = sign * 0.78;

  // Rim geometry using tube along rounded path
  const curve = new THREE.CurvePath();
  const hw = 0.58; // half width
  const hh = 0.46; // half height
  const r = 0.22;  // corner radius

  // Construct smooth rounded rectangle path
  const p1 = new THREE.Vector3(offsetX - hw + r, hh, 0);
  const p2 = new THREE.Vector3(offsetX + hw - r, hh * 0.96, 0);
  const p3 = new THREE.Vector3(offsetX + hw, -hh + r, 0);
  const p4 = new THREE.Vector3(offsetX - hw, -hh + r, 0);

  // Rim outer body (Acetate)
  const shape = new THREE.Shape();
  shape.moveTo(offsetX - hw + r, hh);
  shape.lineTo(offsetX + hw - r, hh * 0.95);
  shape.quadraticCurveTo(offsetX + hw, hh * 0.95, offsetX + hw, hh - r);
  shape.lineTo(offsetX + hw * 0.98, -hh + r);
  shape.quadraticCurveTo(offsetX + hw * 0.98, -hh, offsetX + hw - r, -hh);
  shape.lineTo(offsetX - hw + r, -hh * 0.98);
  shape.quadraticCurveTo(offsetX - hw, -hh * 0.98, offsetX - hw, -hh + r);
  shape.lineTo(offsetX - hw, hh - r);
  shape.quadraticCurveTo(offsetX - hw, hh, offsetX - hw + r, hh);

  // Inner hole for lens
  const hole = new THREE.Path();
  const ihw = hw - 0.07;
  const ihh = hh - 0.07;
  const ir = r - 0.03;
  hole.moveTo(offsetX - ihw + ir, ihh);
  hole.lineTo(offsetX + ihw - ir, ihh * 0.95);
  hole.quadraticCurveTo(offsetX + ihw, ihh * 0.95, offsetX + ihw, ihh - ir);
  hole.lineTo(offsetX + ihw * 0.98, -ihh + ir);
  hole.quadraticCurveTo(offsetX + ihw * 0.98, -ihh, offsetX + ihw - ir, -ihh);
  hole.lineTo(offsetX - ihw + ir, -ihh * 0.98);
  hole.quadraticCurveTo(offsetX - ihw, -ihh * 0.98, offsetX - ihw, -ihh + ir);
  hole.lineTo(offsetX - ihw, ihh - ir);
  hole.quadraticCurveTo(offsetX - ihw, ihh, offsetX - ihw + ir, ihh);
  shape.holes.push(hole);

  const extrudeSettings = {
    steps: 2,
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 4,
  };

  const rimGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  rimGeo.center();
  rimGeo.translate(offsetX, 0, 0);

  const rimMesh = new THREE.Mesh(rimGeo, acetateMaterial);
  rimGroup.add(rimMesh);

  // Gold Inner Rim Accent Inlay
  const goldInlaySettings = {
    steps: 1,
    depth: 0.02,
    bevelEnabled: false,
  };
  const goldInlayGeo = new THREE.ExtrudeGeometry(shape, goldInlaySettings);
  goldInlayGeo.center();
  goldInlayGeo.translate(offsetX, 0, 0.04);
  const goldInlayMesh = new THREE.Mesh(goldInlayGeo, goldMaterial);
  goldInlayMesh.scale.set(0.99, 0.99, 1);
  rimGroup.add(goldInlayMesh);

  // 3. Zeiss Optical Lens
  const lensShape = new THREE.Shape();
  lensShape.moveTo(offsetX - ihw + ir, ihh);
  lensShape.lineTo(offsetX + ihw - ir, ihh * 0.95);
  lensShape.quadraticCurveTo(offsetX + ihw, ihh * 0.95, offsetX + ihw, ihh - ir);
  lensShape.lineTo(offsetX + ihw * 0.98, -ihh + ir);
  lensShape.quadraticCurveTo(offsetX + ihw * 0.98, -ihh, offsetX + ihw - ir, -ihh);
  lensShape.lineTo(offsetX - ihw + ir, -ihh * 0.98);
  lensShape.quadraticCurveTo(offsetX - ihw, -ihh * 0.98, offsetX - ihw, -ihh + ir);
  lensShape.lineTo(offsetX - ihw, ihh - ir);
  lensShape.quadraticCurveTo(offsetX - ihw, ihh, offsetX - ihw + ir, ihh);

  const lensGeo = new THREE.ExtrudeGeometry(lensShape, {
    steps: 1,
    depth: 0.015,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 3,
  });
  lensGeo.center();
  lensGeo.translate(offsetX, 0, 0.02);
  const lensMesh = new THREE.Mesh(lensGeo, zeissLensMaterial);
  rimGroup.add(lensMesh);

  // 4. Nose Pad Assembly (Titanium bracket + soft silicone pad)
  const padArmCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(offsetX + (isLeft ? 0.46 : -0.46), -0.05, 0),
    new THREE.Vector3(offsetX + (isLeft ? 0.38 : -0.38), -0.18, -0.15),
    new THREE.Vector3(offsetX + (isLeft ? 0.32 : -0.32), -0.22, -0.22),
  ]);
  const padArmGeo = new THREE.TubeGeometry(padArmCurve, 12, 0.015, 8, false);
  const padArmMesh = new THREE.Mesh(padArmGeo, goldMaterial);
  rimGroup.add(padArmMesh);

  // Soft Silicone Nose Pad
  const padGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.14, 12);
  padGeo.rotateZ(isLeft ? 0.4 : -0.4);
  padGeo.rotateX(0.3);
  const padMesh = new THREE.Mesh(padGeo, siliconeMaterial);
  padMesh.position.set(offsetX + (isLeft ? 0.30 : -0.30), -0.24, -0.23);
  rimGroup.add(padMesh);

  return rimGroup;
}

glassesGroup.add(createRimMesh(true));  // Left Rim & Lens
glassesGroup.add(createRimMesh(false)); // Right Rim & Lens

// 3. Central 18k Gold Keyhole Nose Bridge
const bridgeCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-0.25, 0.22, 0.03),
  new THREE.Vector3(-0.12, 0.32, 0.06),
  new THREE.Vector3(0.0, 0.34, 0.07),
  new THREE.Vector3(0.12, 0.32, 0.06),
  new THREE.Vector3(0.25, 0.22, 0.03),
]);
const bridgeGeo = new THREE.TubeGeometry(bridgeCurve, 20, 0.024, 12, false);
const bridgeMesh = new THREE.Mesh(bridgeGeo, goldMaterial);
glassesGroup.add(bridgeMesh);

// Top Brow Bar Accent
const browCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-0.22, 0.38, 0.03),
  new THREE.Vector3(0.0, 0.40, 0.04),
  new THREE.Vector3(0.22, 0.38, 0.03),
]);
const browGeo = new THREE.TubeGeometry(browCurve, 12, 0.016, 8, false);
const browMesh = new THREE.Mesh(browGeo, goldMaterial);
glassesGroup.add(browMesh);

// 4. Endpieces & 5-Barrel Hinges (Left & Right)
[-1, 1].forEach((sign) => {
  const isLeft = sign === -1;
  const endX = sign * 1.40;

  // Gold Lug / Endpiece
  const endpieceGeo = new THREE.BoxGeometry(0.12, 0.08, 0.14);
  const endpieceMesh = new THREE.Mesh(endpieceGeo, goldMaterial);
  endpieceMesh.position.set(endX, 0.32, -0.04);
  glassesGroup.add(endpieceMesh);

  // Micro 5-barrel hinge cylinder
  const hingeGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.07, 10);
  const hingeMesh = new THREE.Mesh(hingeGeo, goldMaterial);
  hingeMesh.position.set(endX, 0.32, -0.11);
  glassesGroup.add(hingeMesh);

  // Temple Arm (Gold & Acetate combination arm)
  const templeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(endX, 0.32, -0.12),
    new THREE.Vector3(endX * 0.98, 0.30, -0.8),
    new THREE.Vector3(endX * 0.95, 0.28, -1.6),
    new THREE.Vector3(endX * 0.90, 0.22, -2.1),
    new THREE.Vector3(endX * 0.85, -0.05, -2.45), // Downward ear curve
    new THREE.Vector3(endX * 0.84, -0.22, -2.55),
  ]);

  // Main Gold Temple Stem
  const templeGeo = new THREE.TubeGeometry(templeCurve, 32, 0.022, 10, false);
  const templeMesh = new THREE.Mesh(templeGeo, goldMaterial);
  glassesGroup.add(templeMesh);

  // Tortoiseshell Acetate Temple Tip Sleeve
  const tipCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(endX * 0.92, 0.24, -1.9),
    new THREE.Vector3(endX * 0.90, 0.22, -2.1),
    new THREE.Vector3(endX * 0.85, -0.05, -2.45),
    new THREE.Vector3(endX * 0.84, -0.22, -2.55),
  ]);
  const tipGeo = new THREE.TubeGeometry(tipCurve, 16, 0.038, 10, false);
  const tipMesh = new THREE.Mesh(tipGeo, acetateMaterial);
  glassesGroup.add(tipMesh);
});

// Center and add to scene
scene.add(glassesGroup);

console.log("Generating Bapat Optics Luxury Glasses 3D GLB model...");

// Function to convert glTF JSON + binary buffers into a valid .GLB binary file
function gltfToGlb(gltfOutput) {
  // If exporter produced JSON object
  const jsonText = JSON.stringify(gltfOutput);
  const jsonBuffer = Buffer.from(jsonText, 'utf8');

  // Pad JSON chunk to 4-byte alignment with spaces (0x20)
  const jsonPadding = (4 - (jsonBuffer.length % 4)) % 4;
  const paddedJsonBuffer = Buffer.concat([
    jsonBuffer,
    Buffer.alloc(jsonPadding, 0x20)
  ]);

  // GLB Header (12 bytes)
  const totalLength = 12 + 8 + paddedJsonBuffer.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546C67, 0); // Magic: 'glTF'
  header.writeUInt32LE(2, 4);          // Version: 2
  header.writeUInt32LE(totalLength, 8); // Total Length

  // JSON Chunk Header (8 bytes)
  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(paddedJsonBuffer.length, 0); // Chunk Length
  jsonChunkHeader.writeUInt32LE(0x4E4F534A, 4);              // Chunk Type: 'JSON'

  return Buffer.concat([header, jsonChunkHeader, paddedJsonBuffer]);
}

const exporter = new GLTFExporter();
exporter.parse(
  scene,
  (gltf) => {
    try {
      const outputDir = "public/models";
      fs.mkdirSync(outputDir, { recursive: true });
      const outputPath = path.join(outputDir, "Glasses.glb");

      let glbBuffer;
      if (gltf instanceof ArrayBuffer) {
        glbBuffer = Buffer.from(gltf);
      } else {
        glbBuffer = gltfToGlb(gltf);
      }

      fs.writeFileSync(outputPath, glbBuffer);
      const stats = fs.statSync(outputPath);
      console.log(`SUCCESS: Generated and saved ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)!`);
      process.exit(0);
    } catch (e) {
      console.error("Save error:", e);
      process.exit(1);
    }
  },
  (err) => {
    console.error("Export error:", err);
    process.exit(1);
  },
  { binary: false }
);


