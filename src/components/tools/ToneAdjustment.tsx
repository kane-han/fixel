'use client';

import { useCallback } from 'react';
import { Slider } from '@/components/ui/Slider';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useEditorStore } from '@/stores/editor-store';

export function ToneAdjustment() {
  const { tone, setTone, currentImage, setCurrentImage, pushHistory, isProcessing, setProcessing } = useEditorStore();
  const { toast } = useToast();

  const applyTone = useCallback(async () => {
    if (!currentImage || isProcessing) return;

    setProcessing(true);
    try {
      const { applyToneAdjustment } = await import('@/lib/canvas/tone-adjust');
      const result = await applyToneAdjustment(currentImage, tone);
      setCurrentImage(result);
      pushHistory('톤 보정');
      toast('톤 보정이 적용되었습니다.', 'success');
    } catch {
      toast('톤 보정 중 오류가 발생했습니다.', 'error');
    } finally {
      setProcessing(false);
    }
  }, [tone, currentImage, isProcessing, setCurrentImage, pushHistory, setProcessing, toast]);

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
