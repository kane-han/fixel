import { createCanvas, loadImage, canvasToDataUrl } from './core';

export interface CropArea {
  x: number;
  y: number;
  w: number;
  h: number;
}

export async function applyCrop(imageSrc: string, crop: CropArea): Promise<string> {
  const img = await loadImage(imageSrc);
  const [canvas, ctx] = createCanvas(crop.w, crop.h);
  ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
  return canvasToDataUrl(canvas);
}

export async function applyResize(imageSrc: string, newWidth: number, newHeight: number): Promise<string> {
  const img = await loadImage(imageSrc);
  const [canvas, ctx] = createCanvas(newWidth, newHeight);
  ctx.drawImage(img, 0, 0, newWidth, newHeight);
  return canvasToDataUrl(canvas);
}
