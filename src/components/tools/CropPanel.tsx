'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useEditorStore } from '@/stores/editor-store';
import type { CropPreset } from '@/types/editor';

const presets: CropPreset[] = [
  { label: '자유', ratio: null },
  { label: '1:1', ratio: [1, 1] },
  { label: '4:3', ratio: [4, 3] },
  { label: '16:9', ratio: [16, 9] },
  { label: '9:16', ratio: [9, 16] },
  { label: '3:4', ratio: [3, 4] },
];

const platformPresets = [
  { label: '인스타 피드', ratio: [1, 1] as [number, number], size: '1080×1080' },
  { label: '인스타 스토리', ratio: [9, 16] as [number, number], size: '1080×1920' },
  { label: '유튜브 썸네일', ratio: [16, 9] as [number, number], size: '1280×720' },
  { label: '스마트스토어', ratio: [1, 1] as [number, number], size: '1000×1000' },
];

export function CropPanel() {
  const { width, height, currentImage, setCurrentImage, pushHistory, isProcessing, setProcessing } = useEditorStore();
  const [selectedRatio, setSelectedRatio] = useState<[number, number] | null>(null);
  const [cropW, setCropW] = useState(width);
  const [cropH, setCropH] = useState(height);

  const applyRatio = (ratio: [number, number] | null) => {
    setSelectedRatio(ratio);
    if (ratio) {
      const [rw, rh] = ratio;
      const newH = Math.round(width * (rh / rw));
      if (newH <= height) {
        setCropW(width);
        setCropH(newH);
      } else {
        setCropW(Math.round(height * (rw / rh)));
        setCropH(height);
      }
    } else {
      setCropW(width);
      setCropH(height);
    }
  };

  const handleCrop = async () => {
    if (!currentImage || isProcessing) return;

    setProcessing(true);
    try {
      const { applyCrop } = await import('@/lib/canvas/crop');
      const x = Math.round((width - cropW) / 2);
      const y = Math.round((height - cropH) / 2);
      const result = await applyCrop(currentImage, { x, y, w: cropW, h: cropH });
      setCurrentImage(result);
      useEditorStore.setState({ width: cropW, height: cropH });
      pushHistory('크롭');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs text-gray-400">비율 프리셋</label>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => applyRatio(p.ratio)}
              className={`
                px-2.5 py-1 rounded text-xs transition-colors
                ${JSON.stringify(selectedRatio) === JSON.stringify(p.ratio)
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-300'}
              `}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-gray-400">플랫폼 프리셋</label>
        <div className="space-y-1">
          {platformPresets.map((p) => (
            <button
              key={p.label}
              onClick={() => applyRatio(p.ratio)}
              className="w-full flex justify-between items-center px-3 py-2 rounded bg-gray-800 hover:bg-gray-750 text-xs text-gray-300"
            >
              <span>{p.label}</span>
              <span className="text-gray-500">{p.size}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-500">
        결과: {cropW} × {cropH}px
      </div>

      <Button onClick={handleCrop} loading={isProcessing} disabled={!currentImage} className="w-full">
        크롭 적용
      </Button>
    </div>
  );
}
