import { createCanvas, loadImage, canvasToDataUrl } from './core';

export interface CropArea {
  x: number;
  y: number;
  w: number;
  h: number;
}

export async function applyCrop(imageSrc: string, crop: CropArea): Promise<string> {
  const img = await loadImage(imageSrc);

  // 경계 검증
  const x = Math.max(0, crop.x);
  const y = Math.max(0, crop.y);
  const w = Math.min(crop.w, img.width - x);
  const h = Math.min(crop.h, img.height - y);

  if (w <= 0 || h <= 0) {
    throw new Error('크롭 영역이 유효하지 않습니다.');
  }

  const [canvas, ctx] = createCanvas(w, h);
  ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
  return canvasToDataUrl(canvas);
}

export async function applyResize(imageSrc: string, newWidth: number, newHeight: number): Promise<string> {
  const img = await loadImage(imageSrc);
  const [canvas, ctx] = createCanvas(newWidth, newHeight);
  ctx.drawImage(img, 0, 0, newWidth, newHeight);
  return canvasToDataUrl(canvas);
}
