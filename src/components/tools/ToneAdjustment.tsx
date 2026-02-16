'use client';

import { useCallback } from 'react';
import { Slider } from '@/components/ui/Slider';
import { Button } from '@/components/ui/Button';
import { useEditorStore } from '@/stores/editor-store';

export function ToneAdjustment() {
  const { tone, setTone, originalImage, setCurrentImage, pushHistory, isProcessing, setProcessing } = useEditorStore();

  const applyTone = useCallback(async () => {
    if (!originalImage || isProcessing) return;

    setProcessing(true);
    try {
      const { applyToneAdjustment } = await import('@/lib/canvas/tone-adjust');
      // 히스토리의 현재 상태를 기반으로 톤 적용
      const store = useEditorStore.getState();
      const baseImage = store.history[store.historyIndex]?.imageData || originalImage;
      const result = await applyToneAdjustment(baseImage, tone);
      setCurrentImage(result);
      pushHistory('톤 보정');
    } finally {
      setProcessing(false);
    }
  }, [tone, originalImage, isProcessing, setCurrentImage, pushHistory, setProcessing]);

  const resetTone = () => {
    setTone({ brightness: 0, contrast: 0, saturation: 0, temperature: 0 });
  };

  return (
    <div className="space-y-4">
      <Slider label="밝기" value={tone.brightness} onChange={(v) => setTone({ brightness: v })} />
      <Slider label="대비" value={tone.contrast} onChange={(v) => setTone({ contrast: v })} />
      <Slider label="채도" value={tone.saturation} onChange={(v) => setTone({ saturation: v })} />
      <Slider label="색온도" value={tone.temperature} onChange={(v) => setTone({ temperature: v })} />

      <div className="flex gap-2 pt-2">
        <Button onClick={applyTone} loading={isProcessing} className="flex-1">
          적용
        </Button>
        <Button variant="ghost" onClick={resetTone} size="sm">
          초기화
        </Button>
      </div>
    </div>
  );
}
