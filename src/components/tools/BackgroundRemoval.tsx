'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { useEditorStore } from '@/stores/editor-store';
import { removeBg } from '@/lib/api/clipdrop';

export function BackgroundRemoval() {
  const { currentImage, setCurrentImage, setMaskImage, pushHistory, isProcessing, setProcessing } = useEditorStore();
  const [edgeRefine, setEdgeRefine] = useState(1.5);
  const [autoRefine, setAutoRefine] = useState(true);

  const handleRemoveBg = async () => {
    if (!currentImage || isProcessing) return;

    setProcessing(true);
    try {
      const result = await removeBg(currentImage);
      if (result.success && result.data) {
        let processedImage = result.data.imageBase64;

        if (autoRefine) {
          const { refineEdges } = await import('@/lib/canvas/edge-refine');
          processedImage = await refineEdges(processedImage, edgeRefine);
        }

        setCurrentImage(processedImage);
        pushHistory('배경 제거');
      }
    } catch {
      // 에러 처리는 Phase 4에서 추가
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        AI가 피사체를 자동으로 인식하여 배경을 제거합니다.
      </p>

      <Button
        onClick={handleRemoveBg}
        loading={isProcessing}
        disabled={!currentImage}
        className="w-full"
      >
        배경 제거 실행
      </Button>

      <div className="space-y-3 pt-2 border-t border-gray-800">
        <label className="flex items-center gap-2 text-xs text-gray-400">
          <input
            type="checkbox"
            checked={autoRefine}
            onChange={(e) => setAutoRefine(e.target.checked)}
            className="rounded border-gray-600"
          />
          엣지 리파인 자동 적용
        </label>

        {autoRefine && (
          <Slider
            label="리파인 강도"
            value={edgeRefine}
            min={0}
            max={5}
            step={0.5}
            onChange={setEdgeRefine}
          />
        )}
      </div>
    </div>
  );
}
