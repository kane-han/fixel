'use client';

import { Slider } from '@/components/ui/Slider';
import { useEditorStore } from '@/stores/editor-store';

export function TouchupBrush() {
  const { activeTool, brushSize, setBrushSize, setActiveTool } = useEditorStore();

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        {activeTool === 'touchup-add'
          ? '캔버스 위를 드래그하여 배경을 추가 제거합니다.'
          : '캔버스 위를 드래그하여 원본을 복원합니다.'}
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTool('touchup-add')}
          className={`flex-1 py-2 rounded-lg text-xs transition-colors ${
            activeTool === 'touchup-add'
              ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40'
              : 'bg-gray-800 text-gray-400 border border-gray-700'
          }`}
        >
          지우기
        </button>
        <button
          onClick={() => setActiveTool('touchup-remove')}
          className={`flex-1 py-2 rounded-lg text-xs transition-colors ${
            activeTool === 'touchup-remove'
              ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40'
              : 'bg-gray-800 text-gray-400 border border-gray-700'
          }`}
        >
          복원
        </button>
      </div>

      <Slider
        label="브러시 크기"
        value={brushSize}
        min={5}
        max={100}
        step={1}
        onChange={setBrushSize}
      />

      <div className="flex justify-center py-2">
        <div
          className="rounded-full border-2 border-primary-500/50"
          style={{ width: Math.min(brushSize, 60), height: Math.min(brushSize, 60) }}
        />
      </div>
    </div>
  );
}
