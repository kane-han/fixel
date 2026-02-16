'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useEditorStore } from '@/stores/editor-store';
import { useAuthStore } from '@/stores/auth-store';
import { exportImage } from '@/lib/canvas/export';
import { downloadBlob } from '@/lib/utils/file-helpers';

export function DownloadPanel() {
  const { currentImage } = useEditorStore();
  const { user, setShowLoginModal } = useAuthStore();
  const { toast } = useToast();
  const [format, setFormat] = useState<'png' | 'jpg'>('png');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!currentImage) return;

    setIsDownloading(true);
    try {
      let imageSrc = currentImage;

      if (!user) {
        const { addWatermark } = await import('@/lib/canvas/watermark');
        imageSrc = await addWatermark(imageSrc);
      }

      const blob = await exportImage(imageSrc, format);
      const ext = format === 'jpg' ? 'jpg' : 'png';
      downloadBlob(blob, `fixel-export.${ext}`);
      toast('다운로드 완료!', 'success');
    } catch {
      toast('다운로드 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => setFormat('png')}
          className={`flex-1 py-1.5 rounded text-xs transition-colors ${
            format === 'png'
              ? 'bg-primary-500/20 text-primary-400'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          PNG
        </button>
        <button
          onClick={() => setFormat('jpg')}
          className={`flex-1 py-1.5 rounded text-xs transition-colors ${
            format === 'jpg'
              ? 'bg-primary-500/20 text-primary-400'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          JPG
        </button>
      </div>

      <Button
        onClick={handleDownload}
        loading={isDownloading}
        disabled={!currentImage}
        className="w-full"
      >
        {user ? '다운로드' : '다운로드 (워터마크)'}
      </Button>

      {!user && (
        <button
          onClick={() => setShowLoginModal(true)}
          className="w-full text-xs text-primary-500 hover:text-primary-400 transition-colors"
        >
          로그인하면 워터마크 없이 다운로드
        </button>
      )}
    </div>
  );
}
