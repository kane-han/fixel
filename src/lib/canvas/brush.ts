import { createCanvas, loadImage, canvasToDataUrl } from './core';

/**
 * 터치업 브러시 — 마스크 기반 추가/제거
 * mode: 'add' = 배경 제거 영역 추가 (투명하게), 'remove' = 배경 제거 영역 복원 (불투명하게)
 */
export async function applyBrushStroke(
  currentImageSrc: string,
  originalImageSrc: string,
  points: { x: number; y: number }[],
  brushSize: number,
  mode: 'add' | 'remove'
): Promise<string> {
  const currentImg = await loadImage(currentImageSrc);
  const { width, height } = currentImg;

  const [canvas, ctx] = createCanvas(width, height);
  ctx.drawImage(currentImg, 0, 0);

  if (mode === 'add') {
    // 투명하게 만들기 (배경 제거 영역 추가)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,1)';
  } else {
    // 원본에서 복원
    const origImg = await loadImage(originalImageSrc);
    const [origCanvas, origCtx] = createCanvas(width, height);
    origCtx.drawImage(origImg, 0, 0);

    // 클리핑 마스크로 브러시 영역만 원본에서 복원
    const [maskCanvas, maskCtx] = createCanvas(width, height);
    maskCtx.fillStyle = 'white';
    for (const pt of points) {
      maskCtx.beginPath();
      maskCtx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
      maskCtx.fill();
    }

    origCtx.globalCompositeOperation = 'destination-in';
    origCtx.drawImage(maskCanvas, 0, 0);

    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(origCanvas, 0, 0);
    return canvasToDataUrl(canvas);
  }

  for (const pt of points) {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvasToDataUrl(canvas);
}
