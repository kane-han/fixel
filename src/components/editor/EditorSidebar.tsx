'use client';

import { useEditorStore } from '@/stores/editor-store';
import { BackgroundRemoval } from '@/components/tools/BackgroundRemoval';
import { ToneAdjustment } from '@/components/tools/ToneAdjustment';
import { UpscalePanel } from '@/components/tools/UpscalePanel';
import { CropPanel } from '@/components/tools/CropPanel';
import { TouchupBrush } from '@/components/tools/TouchupBrush';
import { BackgroundReplace } from '@/components/tools/BackgroundReplace';
import { DownloadPanel } from '@/components/tools/DownloadPanel';

export function EditorSidebar() {
  const activeTool = useEditorStore((s) => s.activeTool);

  return (
    <div className="w-72 bg-gray-900 border-l border-gray-800 flex flex-col shrink-0 overflow-y-auto scrollbar-thin">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-300">
          {toolLabel(activeTool)}
        </h2>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {activeTool === 'select' && <SelectInfo />}
        {activeTool === 'remove-bg' && <BackgroundRemoval />}
        {(activeTool === 'touchup-add' || activeTool === 'touchup-remove') && <TouchupBrush />}
        {activeTool === 'tone' && <ToneAdjustment />}
        {activeTool === 'crop' && <CropPanel />}
        {activeTool === 'upscale' && <UpscalePanel />}
        {activeTool === 'background-replace' && <BackgroundReplace />}
      </div>

      {/* 하단 다운로드 */}
      <div className="border-t border-gray-800 p-4">
        <DownloadPanel />
      </div>
    </div>
  );
}

function toolLabel(tool: string) {
  const map: Record<string, string> = {
    select: '속성',
    'remove-bg': '배경 제거',
    'touchup-add': '터치업 — 지우기',
    'touchup-remove': '터치업 — 복원',
    tone: '톤 보정',
    crop: '크롭 / 리사이즈',
    upscale: '업스케일',
    'background-replace': '배경 교체',
  };
  return map[tool] || tool;
}

function SelectInfo() {
  const { width, height } = useEditorStore();
  return (
    <div className="text-sm text-gray-400 space-y-2">
      <p>왼쪽 도구를 선택하여 편집을 시작하세요.</p>
      {width > 0 && (
        <p className="text-xs text-gray-600">
          {width} × {height}px
        </p>
      )}
    </div>
  );
}
