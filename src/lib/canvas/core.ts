export function createCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function imageToDataUrl(img: HTMLImageElement, format: 'image/png' | 'image/jpeg' = 'image/png', quality = 0.92): string {
  const [canvas, ctx] = createCanvas(img.width, img.height);
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL(format, quality);
}

export function canvasToDataUrl(canvas: HTMLCanvasElement, format: 'image/png' | 'image/jpeg' = 'image/png', quality = 0.92): string {
  return canvas.toDataURL(format, quality);
}

export async function drawImageOnCanvas(
  ctx: CanvasRenderingContext2D,
  src: string,
  x = 0,
  y = 0,
  w?: number,
  h?: number
): Promise<void> {
  const img = await loadImage(src);
  ctx.drawImage(img, x, y, w ?? img.width, h ?? img.height);
}
