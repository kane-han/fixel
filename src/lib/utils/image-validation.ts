const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSION = 4096;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ValidationResult {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'JPG, PNG, WebP 파일만 지원합니다.' };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: '파일 크기는 10MB 이하만 가능합니다.' };
  }
  return { valid: true };
}

export function validateImageDimensions(w: number, h: number): ValidationResult {
  if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
    return { valid: false, error: `이미지 크기는 ${MAX_DIMENSION}x${MAX_DIMENSION}px 이하만 가능합니다.` };
  }
  if (w < 10 || h < 10) {
    return { valid: false, error: `이미지가 너무 작습니다. (최소 10×10px, 현재 ${w}×${h}px)` };
  }
  return { valid: true };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

export function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = dataUrl;
  });
}
