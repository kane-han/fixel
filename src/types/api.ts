export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RemoveBgRequest {
  imageBase64: string;
}

export interface RemoveBgResponse {
  imageBase64: string;
}

export interface UpscaleRequest {
  imageBase64: string;
  targetWidth: number;
  targetHeight: number;
}

export interface UpscaleResponse {
  imageBase64: string;
}

export interface DownloadRequest {
  imageBase64: string;
  format: 'png' | 'jpg';
  isAuthenticated: boolean;
}
