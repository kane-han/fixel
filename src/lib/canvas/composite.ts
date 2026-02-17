import type { BackgroundSettings, GradientDirection } from '@/types/editor';
import { createCanvas, loadImage, canvasToDataUrl } from './core';

function getGradientCoords(
  direction: GradientDirection,
  w: number,
  h: number
): [number, number, number, number] {
  switch (direction) {
    case 'to-right': return [0, 0, w, 0];
    case 'to-left': return [w, 0, 0, 0];
    case 'to-bottom': return [0, 0, 0, h];
    case 'to-top': return [0, h, 0, 0];
    case 'to-br': return [0, 0, w, h];
    case 'to-bl': return [w, 0, 0, h];
  }
}

export async function compositeWithBackground(
  foregroundSrc: string,
  bg: BackgroundSettings,
  width: number,
  height: number,
  foregroundFit: 'fill' | 'contain' = 'fill'
): Promise<string> {
  const [canvas, ctx] = createCanvas(width, height);

  // 배경 그리기
  switch (bg.type) {
    case 'transparent':
      break;

    case 'solid':
      ctx.fillStyle = bg.color;
      ctx.fillRect(0, 0, width, height);
      break;

    case 'gradient': {
      const [x0, y0, x1, y1] = getGradientCoords(bg.gradientDirection, width, height);
      const grad = ctx.createLinearGradient(x0, y0, x1, y1);
      grad.addColorStop(0, bg.gradientFrom);
      grad.addColorStop(1, bg.gradientTo);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      break;
    }

    case 'image':
    case 'template':
      if (bg.imageUrl) {
        const bgImg = await loadImage(bg.imageUrl);
        const scale = Math.max(width / bgImg.width, height / bgImg.height);
        const sw = bgImg.width * scale;
        const sh = bgImg.height * scale;
        const sx = (width - sw) / 2;
        const sy = (height - sh) / 2;
        ctx.drawImage(bgImg, sx, sy, sw, sh);
      }
      break;
  }

  // 전경 (누끼) 그리기
  const fgImg = await loadImage(foregroundSrc);

  if (foregroundFit === 'contain') {
    // contain: 비율 유지하며 캔버스 안에 맞추기 (여백 있음)
    const padding = Math.min(width, height) * 0.05; // 5% 여백
    const availW = width - padding * 2;
    const availH = height - padding * 2;
    const s = Math.min(availW / fgImg.width, availH / fgImg.height);
    const fw = fgImg.width * s;
    const fh = fgImg.height * s;
    const fx = (width - fw) / 2;
    const fy = (height - fh) / 2;
    ctx.drawImage(fgImg, fx, fy, fw, fh);
  } else {
    ctx.drawImage(fgImg, 0, 0, width, height);
  }

  return canvasToDataUrl(canvas);
}
