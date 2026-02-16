/**
 * 배경 이미지 8종 생성 스크립트
 * Canvas API 없이 PPM → PNG 변환으로 생성
 * 사용: node scripts/generate-backgrounds.mjs
 */
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SIZE = 800;
const OUT_DIR = join(__dirname, '..', 'public', 'backgrounds');

function createPPM(width, height, pixelFn) {
  const header = `P6\n${width} ${height}\n255\n`;
  const data = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixelFn(x, y, width, height);
      const idx = (y * width + x) * 3;
      data[idx] = Math.max(0, Math.min(255, Math.round(r)));
      data[idx + 1] = Math.max(0, Math.min(255, Math.round(g)));
      data[idx + 2] = Math.max(0, Math.min(255, Math.round(b)));
    }
  }
  return Buffer.concat([Buffer.from(header), data]);
}

// PPM을 간단한 BMP로 변환 (브라우저 호환)
function ppmToBmp(ppm, width, height) {
  const rowSize = Math.ceil(width * 3 / 4) * 4;
  const dataSize = rowSize * height;
  const fileSize = 54 + dataSize;
  const buf = Buffer.alloc(fileSize);

  // BMP Header
  buf.write('BM', 0);
  buf.writeUInt32LE(fileSize, 2);
  buf.writeUInt32LE(54, 10); // offset
  buf.writeUInt32LE(40, 14); // info header size
  buf.writeInt32LE(width, 18);
  buf.writeInt32LE(-height, 22); // top-down
  buf.writeUInt16LE(1, 26); // planes
  buf.writeUInt16LE(24, 28); // bpp
  buf.writeUInt32LE(dataSize, 34);

  // PPM 헤더 건너뛰기
  const headerEnd = ppm.indexOf(10, ppm.indexOf(10, ppm.indexOf(10) + 1) + 1) + 1;
  const pixels = ppm.subarray(headerEnd);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 3;
      const dstIdx = 54 + y * rowSize + x * 3;
      buf[dstIdx] = pixels[srcIdx + 2]; // B
      buf[dstIdx + 1] = pixels[srcIdx + 1]; // G
      buf[dstIdx + 2] = pixels[srcIdx]; // R
    }
  }

  return buf;
}

function lerp(a, b, t) { return a + (b - a) * t; }

const backgrounds = {
  'studio-white': (x, y, w, h) => {
    const vy = y / h;
    const v = lerp(250, 230, vy * vy);
    return [v, v, v];
  },
  'studio-gray': (x, y, w, h) => {
    const vy = y / h;
    const v = lerp(160, 120, vy * vy);
    return [v, v, v];
  },
  'nature-green': (x, y, w, h) => {
    const t = y / h;
    return [lerp(34, 76, t), lerp(139, 175, t), lerp(34, 80, t)];
  },
  'nature-sky': (x, y, w, h) => {
    const t = y / h;
    return [lerp(135, 200, t), lerp(206, 230, t), lerp(250, 255, t)];
  },
  'marble': (x, y, w, h) => {
    const noise = Math.sin(x * 0.02 + y * 0.015) * 15 + Math.sin(x * 0.01 - y * 0.02) * 10;
    const base = 220 + noise;
    return [base, base - 2, base - 5];
  },
  'wood': (x, y, w, h) => {
    const grain = Math.sin(y * 0.3 + Math.sin(x * 0.01) * 5) * 10;
    return [160 + grain, 120 + grain * 0.8, 80 + grain * 0.5];
  },
  'fabric': (x, y, w, h) => {
    const pattern = ((x % 4 < 2) !== (y % 4 < 2)) ? 5 : 0;
    return [230 + pattern, 225 + pattern, 220 + pattern];
  },
  'gradient-pastel': (x, y, w, h) => {
    const t = x / w;
    return [lerp(255, 200, t), lerp(200, 220, t), lerp(220, 255, t)];
  },
};

for (const [name, fn] of Object.entries(backgrounds)) {
  const ppm = createPPM(SIZE, SIZE, fn);
  const bmp = ppmToBmp(ppm, SIZE, SIZE);
  const path = join(OUT_DIR, `${name}.bmp`);
  writeFileSync(path, bmp);
  console.log(`✓ ${name}.bmp (${(bmp.length / 1024).toFixed(0)} KB)`);
}

console.log('\n배경 이미지 8종 생성 완료!');
console.log('참고: BMP 형식으로 생성됨. JPG/PNG 변환은 추후 가능.');
