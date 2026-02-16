import type { ApiResponse, RemoveBgResponse, UpscaleResponse } from '@/types/api';

export async function removeBg(imageBase64: string): Promise<ApiResponse<RemoveBgResponse>> {
  const res = await fetch('/api/remove-bg', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 }),
  });
  return res.json();
}

export async function upscaleImage(
  imageBase64: string,
  targetWidth: number,
  targetHeight: number
): Promise<ApiResponse<UpscaleResponse>> {
  const res = await fetch('/api/upscale', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, targetWidth, targetHeight }),
  });
  return res.json();
}
