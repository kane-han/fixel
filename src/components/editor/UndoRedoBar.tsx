'use client';

import { useEditorStore } from '@/stores/editor-store';

export function UndoRedoBar() {
  const { historyIndex, history, undo, redo, showCompare, setShowCompare, reset } = useEditorStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="h-10 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="text-xs text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 px-2 py-1 rounded hover:bg-gray-800"
          title="실행 취소 (Ctrl+Z)"
        >
          ← 취소
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="text-xs text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 px-2 py-1 rounded hover:bg-gray-800"
          title="다시 실행 (Ctrl+Shift+Z)"
        >
          다시 →
        </button>
        <span className="text-[10px] text-gray-600 ml-2">
          {historyIndex + 1} / {history.length}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowCompare(!showCompare)}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            showCompare ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          비교
        </button>
        <button
          onClick={reset}
          className="text-xs text-gray-400 hover:text-red-400 px-2 py-1 rounded hover:bg-gray-800"
        >
          초기화
        </button>
      </div>
    </div>
  );
}
