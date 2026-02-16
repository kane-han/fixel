'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useEditorStore } from '@/stores/editor-store';
import { upscaleImage } from '@/lib/api/clipdrop';

const SCALE_OPTIONS = [
  { label: '2x', factor: 2 },
  { label: '4x', factor: 4 },
];

export function UpscalePanel() {
  const { width, height, currentImage, setCurrentImage, pushHistory, isProcessing, setProcessing } = useEditorStore();
  const [scaleFactor, setScaleFactor] = useState(2);

  const handleUpscale = async () => {
    if (!currentImage || isProcessing) return;

    const targetW = width * scaleFactor;
    const targetH = height * scaleFactor;

    if (targetW > 4096 || targetH > 4096) return;

    setProcessing(true);
    try {
      const result = await upscaleImage(currentImage, targetW, targetH);
      if (result.success && result.data) {
        setCurrentImage(result.data.imageBase64);
        useEditorStore.setState({ width: targetW, height: targetH });
        pushHistory(`${scaleFactor}x 업스케일`);
      }
    } catch {
      // 에러 처리는 Phase 4에서
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        AI로 이미지를 고화질 확대합니다. 최대 4096px.
      </p>

      <div className="space-y-2">
        <label className="text-xs text-gray-400">배율 선택</label>
        <div className="flex gap-2">
          {SCALE_OPTIONS.map((opt) => {
            const tw = width * opt.factor;
            const th = height * opt.factor;
            const disabled = tw > 4096 || th > 4096;
            return (
              <button
                key={opt.factor}
                onClick={() => setScaleFactor(opt.factor)}
                disabled={disabled}
                className={`
                  flex-1 py-2 rounded-lg text-sm transition-colors
                  ${scaleFactor === opt.factor
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40'
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'}
                  ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
                `}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-xs text-gray-500">
        {width} × {height} → {width * scaleFactor} × {height * scaleFactor}px
      </div>

      <Button
        onClick={handleUpscale}
        loading={isProcessing}
        disabled={!currentImage}
        className="w-full"
      >
        업스케일 실행
      </Button>
    </div>
  );
}
