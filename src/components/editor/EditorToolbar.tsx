'use client';

import { useEditorStore } from '@/stores/editor-store';
import type { Tool } from '@/types/editor';

const tools: { id: Tool; label: string; icon: string }[] = [
  { id: 'select', label: '선택', icon: '↖' },
  { id: 'remove-bg', label: '누끼', icon: '✂' },
  { id: 'touchup-add', label: '지우기', icon: '🖌' },
  { id: 'touchup-remove', label: '복원', icon: '↩' },
  { id: 'tone', label: '톤', icon: '☀' },
  { id: 'crop', label: '크롭', icon: '⬜' },
  { id: 'upscale', label: '확대', icon: '🔍' },
  { id: 'background-replace', label: '배경', icon: '🖼' },
];

export function EditorToolbar() {
  const { activeTool, setActiveTool } = useEditorStore();

  return (
    <div className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-3 gap-1 shrink-0">
      {tools.map((t) => (
        <button
          key={t.id}
          onClick={() => setActiveTool(t.id)}
          className={`
            w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5
            text-xs transition-colors
            ${activeTool === t.id
              ? 'bg-primary-500/20 text-primary-400'
              : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}
          `}
          title={t.label}
        >
          <span className="text-base leading-none">{t.icon}</span>
          <span className="text-[10px]">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
