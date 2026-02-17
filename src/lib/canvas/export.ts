import { createCanvas, loadImage } from './core';

export async function exportImage(
  imageSrc: string,
  format: 'png' | 'jpg',
  quality = 0.92
): Promise<Blob> {
  const img = await loadImage(imageSrc);
  const [canvas, ctx] = createCanvas(img.width, img.height);

  if (format === 'jpg') {
    // JPG는 투명 불가 → 흰 배경
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, img.width, img.height);
  }

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('이미지 변환에 실패했습니다.'));
          return;
        }
        resolve(blob);
      },
      format === 'jpg' ? 'image/jpeg' : 'image/png',
      quality
    );
  });
}
