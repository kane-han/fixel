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
  height: number
): Promise<string> {
  const [canvas, ctx] = createCanvas(width, height);

  // 배경 그리기
  switch (bg.type) {
    case 'transparent':
      // 투명 배경 — 체크보드 패턴
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
        // 배경 이미지를 cover 방식으로 채우기
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
  ctx.drawImage(fgImg, 0, 0, width, height);

  return canvasToDataUrl(canvas);
}
