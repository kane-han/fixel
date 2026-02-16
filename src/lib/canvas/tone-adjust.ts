import type { ToneSettings } from '@/types/editor';
import { createCanvas, loadImage, canvasToDataUrl } from './core';

export async function applyToneAdjustment(
  imageSrc: string,
  tone: ToneSettings
): Promise<string> {
  const img = await loadImage(imageSrc);
  const [canvas, ctx] = createCanvas(img.width, img.height);

  // CSS 필터 기반 톤 보정
  const filters: string[] = [];

  if (tone.brightness !== 0) {
    filters.push(`brightness(${1 + tone.brightness / 100})`);
  }
  if (tone.contrast !== 0) {
    filters.push(`contrast(${1 + tone.contrast / 100})`);
  }
  if (tone.saturation !== 0) {
    filters.push(`saturate(${1 + tone.saturation / 100})`);
  }
  // 색온도: sepia + hue-rotate 조합으로 근사
  if (tone.temperature !== 0) {
    const intensity = Math.abs(tone.temperature) / 100;
    if (tone.temperature > 0) {
      // 따뜻하게 (warm)
      filters.push(`sepia(${intensity * 0.3})`);
      filters.push(`saturate(${1 + intensity * 0.2})`);
    } else {
      // 차갑게 (cool)
      filters.push(`sepia(${intensity * 0.1})`);
      filters.push(`hue-rotate(${-intensity * 30}deg)`);
    }
  }

  ctx.filter = filters.length > 0 ? filters.join(' ') : 'none';
  ctx.drawImage(img, 0, 0);

  return canvasToDataUrl(canvas);
}
