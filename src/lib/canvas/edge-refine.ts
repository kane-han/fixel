import { createCanvas, loadImage, canvasToDataUrl } from './core';

/**
 * 가우시안 블러 기반 알파 마스크 개선 — 엣지 리파인
 * 배경 제거 후 거친 엣지를 부드럽게 처리
 */
export async function refineEdges(
  imageSrc: string,
  blurRadius: number = 1.5,
  threshold: number = 128
): Promise<string> {
  const img = await loadImage(imageSrc);
  const { width, height } = img;

  // 원본 캔버스
  const [origCanvas, origCtx] = createCanvas(width, height);
  origCtx.drawImage(img, 0, 0);
  const origData = origCtx.getImageData(0, 0, width, height);

  // 알파 채널만 추출 → 블러 처리
  const [alphaCanvas, alphaCtx] = createCanvas(width, height);
  const alphaImageData = alphaCtx.createImageData(width, height);
  for (let i = 0; i < origData.data.length; i += 4) {
    const a = origData.data[i + 3];
    alphaImageData.data[i] = a;
    alphaImageData.data[i + 1] = a;
    alphaImageData.data[i + 2] = a;
    alphaImageData.data[i + 3] = 255;
  }
  alphaCtx.putImageData(alphaImageData, 0, 0);

  // 블러 적용
  const [blurCanvas, blurCtx] = createCanvas(width, height);
  blurCtx.filter = `blur(${blurRadius}px)`;
  blurCtx.drawImage(alphaCanvas, 0, 0);
  const blurData = blurCtx.getImageData(0, 0, width, height);

  // 블러된 알파를 원본에 적용
  const [resultCanvas, resultCtx] = createCanvas(width, height);
  const resultData = resultCtx.createImageData(width, height);

  for (let i = 0; i < origData.data.length; i += 4) {
    resultData.data[i] = origData.data[i];
    resultData.data[i + 1] = origData.data[i + 1];
    resultData.data[i + 2] = origData.data[i + 2];

    const blurAlpha = blurData.data[i]; // R채널 = 알파값
    // 엣지 영역만 블러 알파 적용 (중심부는 원본 유지)
    const origAlpha = origData.data[i + 3];
    if (origAlpha > threshold) {
      resultData.data[i + 3] = Math.min(255, Math.max(0, blurAlpha));
    } else if (origAlpha > 0) {
      // 반투명 영역: 블러로 부드럽게
      resultData.data[i + 3] = Math.min(origAlpha, blurAlpha);
    } else {
      resultData.data[i + 3] = 0;
    }
  }

  resultCtx.putImageData(resultData, 0, 0);
  return canvasToDataUrl(resultCanvas);
}
