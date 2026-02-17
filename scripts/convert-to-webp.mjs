/**
 * 배경 이미지 BMP → WebP 변환 스크립트
 * 원본 pixelFn에서 raw RGB 데이터 생성 → sharp로 WebP 변환
 * 사용: node scripts/convert-to-webp.mjs
 */
import sharp from 'sharp';
import { unlinkSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SIZE = 800;
const OUT_DIR = join(__dirname, '..', 'public', 'backgrounds');

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
  // raw RGB 버퍼 생성
  const data = Buffer.alloc(SIZE * SIZE * 3);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const [r, g, b] = fn(x, y, SIZE, SIZE);
      const idx = (y * SIZE + x) * 3;
      data[idx] = Math.max(0, Math.min(255, Math.round(r)));
      data[idx + 1] = Math.max(0, Math.min(255, Math.round(g)));
      data[idx + 2] = Math.max(0, Math.min(255, Math.round(b)));
    }
  }

  const webpPath = join(OUT_DIR, `${name}.webp`);
  await sharp(data, { raw: { width: SIZE, height: SIZE, channels: 3 } })
    .webp({ quality: 85 })
    .toFile(webpPath);

  const bmpPath = join(OUT_DIR, `${name}.bmp`);
  if (existsSync(bmpPath)) {
    unlinkSync(bmpPath);
  }

  console.log(`✓ ${name}.webp`);
}

console.log('\n배경 이미지 8종 WebP 변환 완료! BMP 파일 삭제됨.');
