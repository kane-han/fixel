'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { createKeyboardHandler } from '@/lib/utils/keyboard';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = createKeyboardHandler([
      {
        key: 'z',
        ctrl: true,
        handler: () => useEditorStore.getState().undo(),
      },
      {
        key: 'z',
        ctrl: true,
        shift: true,
        handler: () => useEditorStore.getState().redo(),
      },
      {
        key: 'y',
        ctrl: true,
        handler: () => useEditorStore.getState().redo(),
      },
    ]);

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
