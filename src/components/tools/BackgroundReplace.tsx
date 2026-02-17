'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { useToast } from '@/components/ui/Toast';
import { useEditorStore } from '@/stores/editor-store';
import type { BackgroundType, GradientDirection, CommerceTemplate } from '@/types/editor';
import { fileToDataUrl } from '@/lib/utils/image-validation';

const bgImages = [
  { id: 'studio-white', label: '스튜디오 화이트', url: '/backgrounds/studio-white.bmp' },
  { id: 'studio-gray', label: '스튜디오 그레이', url: '/backgrounds/studio-gray.bmp' },
  { id: 'nature-green', label: '자연 그린', url: '/backgrounds/nature-green.bmp' },
  { id: 'nature-sky', label: '하늘', url: '/backgrounds/nature-sky.bmp' },
  { id: 'marble', label: '대리석', url: '/backgrounds/marble.bmp' },
  { id: 'wood', label: '우드', url: '/backgrounds/wood.bmp' },
  { id: 'fabric', label: '패브릭', url: '/backgrounds/fabric.bmp' },
  { id: 'gradient-pastel', label: '파스텔', url: '/backgrounds/gradient-pastel.bmp' },
];

const gradientDirections: { label: string; value: GradientDirection }[] = [
  { label: '→', value: 'to-right' },
  { label: '←', value: 'to-left' },
  { label: '↓', value: 'to-bottom' },
  { label: '↑', value: 'to-top' },
  { label: '↘', value: 'to-br' },
  { label: '↙', value: 'to-bl' },
];

const templates: { id: CommerceTemplate; label: string; size: string; w: number; h: number }[] = [
  { id: 'smartstore', label: '스마트스토어', size: '1000×1000', w: 1000, h: 1000 },
  { id: 'coupang', label: '쿠팡', size: '800×800', w: 800, h: 800 },
  { id: 'daangn', label: '당근마켓', size: '1080×1080', w: 1080, h: 1080 },
  { id: '11st', label: '11번가', size: '640×640', w: 640, h: 640 },
];

export function BackgroundReplace() {
  const { background, setBackground, currentImage, width, height, setCurrentImage, pushHistory, isProcessing, setProcessing } = useEditorStore();
  const { toast } = useToast();

  const selectType = (type: BackgroundType) => {
    setBackground({ type });
  };

  const applyBackground = useCallback(async () => {
    if (!currentImage || isProcessing) return;

    setProcessing(true);
    try {
      const { compositeWithBackground } = await import('@/lib/canvas/composite');

      // 커머스 템플릿: 지정 크기로 리사이즈 + 흰 배경 + contain 배치
      if (background.type === 'template' && background.template) {
        const tmpl = templates.find((t) => t.id === background.template);
        if (tmpl) {
          const templateBg = { ...background, type: 'solid' as const, color: '#ffffff' };
          const result = await compositeWithBackground(currentImage, templateBg, tmpl.w, tmpl.h, 'contain');
          setCurrentImage(result);
          useEditorStore.setState({ width: tmpl.w, height: tmpl.h });
          pushHistory(`${tmpl.label} 템플릿`);
          toast(`${tmpl.label} 템플릿이 적용되었습니다. (${tmpl.size})`, 'success');
          return;
        }
      }

      const result = await compositeWithBackground(currentImage, background, width, height);
      setCurrentImage(result);
      pushHistory('배경 교체');
      toast('배경이 교체되었습니다.', 'success');
    } catch {
      toast('배경 교체 중 오류가 발생했습니다.', 'error');
    } finally {
      setProcessing(false);
    }
  }, [currentImage, background, width, height, isProcessing, setCurrentImage, pushHistory, setProcessing, toast]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setBackground({ type: 'image', imageUrl: dataUrl });
  };

  return (
    <div className="space-y-4">
      {/* 배경 유형 선택 */}
      <div className="flex flex-wrap gap-1.5">
        {(['transparent', 'solid', 'gradient', 'image', 'template'] as BackgroundType[]).map((type) => (
          <button
            key={type}
            onClick={() => selectType(type)}
            className={`
              px-2.5 py-1 rounded text-xs transition-colors
              ${background.type === type
                ? 'bg-primary-500/20 text-primary-400'
                : 'bg-gray-800 text-gray-400 hover:text-gray-300'}
            `}
          >
            {{ transparent: '투명', solid: '단색', gradient: '그라데이션', image: '이미지', template: '커머스' }[type]}
          </button>
        ))}
      </div>

      {/* 단색 */}
      {background.type === 'solid' && (
        <ColorPicker
          label="배경 색상"
          value={background.color}
          onChange={(c) => setBackground({ color: c })}
        />
      )}

      {/* 그라데이션 */}
      {background.type === 'gradient' && (
        <div className="space-y-3">
          <ColorPicker
            label="시작 색"
            value={background.gradientFrom}
            onChange={(c) => setBackground({ gradientFrom: c })}
          />
          <ColorPicker
            label="끝 색"
            value={background.gradientTo}
            onChange={(c) => setBackground({ gradientTo: c })}
          />
          <div>
            <label className="text-xs text-gray-400 mb-1 block">방향</label>
            <div className="flex gap-1.5">
              {gradientDirections.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setBackground({ gradientDirection: d.value })}
                  className={`
                    w-8 h-8 rounded flex items-center justify-center text-sm
                    ${background.gradientDirection === d.value
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'bg-gray-800 text-gray-500'}
                  `}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 이미지 배경 */}
      {background.type === 'image' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {bgImages.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setBackground({ imageUrl: bg.url })}
                className={`
                  h-16 rounded-lg bg-gray-800 text-xs text-gray-400
                  flex items-center justify-center border transition-colors
                  ${background.imageUrl === bg.url
                    ? 'border-primary-500'
                    : 'border-gray-700 hover:border-gray-600'}
                `}
              >
                {bg.label}
              </button>
            ))}
          </div>
          <label className="block">
            <span className="text-xs text-gray-400">직접 업로드</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-1 block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700"
            />
          </label>
        </div>
      )}

      {/* 커머스 템플릿 */}
      {background.type === 'template' && (
        <div className="space-y-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setBackground({ template: t.id })}
              className={`
                w-full flex justify-between items-center px-3 py-2.5 rounded-lg text-xs transition-colors
                ${background.template === t.id
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40'
                  : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600'}
              `}
            >
              <span>{t.label}</span>
              <span className="text-gray-500">{t.size}</span>
            </button>
          ))}
        </div>
      )}

      <Button onClick={applyBackground} loading={isProcessing} disabled={!currentImage} className="w-full">
        배경 적용
      </Button>
    </div>
  );
}
