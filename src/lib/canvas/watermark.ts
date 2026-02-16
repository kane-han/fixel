import { createCanvas, loadImage, canvasToDataUrl } from './core';

export async function addWatermark(imageSrc: string): Promise<string> {
  const img = await loadImage(imageSrc);
  const { width, height } = img;

  const [canvas, ctx] = createCanvas(width, height);
  ctx.drawImage(img, 0, 0);

  // 반투명 워터마크 텍스트
  const fontSize = Math.max(16, Math.min(width, height) * 0.05);
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 1;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 대각선 반복 패턴
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 6);

  const text = 'FIXEL';
  const spacing = fontSize * 5;

  for (let y = -height; y < height * 2; y += spacing) {
    for (let x = -width; x < width * 2; x += spacing) {
      ctx.fillText(text, x - width / 2, y - height / 2);
      ctx.strokeText(text, x - width / 2, y - height / 2);
    }
  }

  ctx.restore();

  return canvasToDataUrl(canvas, 'image/png');
}
