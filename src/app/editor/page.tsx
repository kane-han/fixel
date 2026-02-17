'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { EditorCanvas } from '@/components/editor/EditorCanvas';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { UndoRedoBar } from '@/components/editor/UndoRedoBar';
import { LoginModal } from '@/components/auth/LoginModal';
import { useEditorStore } from '@/stores/editor-store';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function EditorPage() {
  const router = useRouter();
  const currentImage = useEditorStore((s) => s.currentImage);
  const isProcessing = useEditorStore((s) => s.isProcessing);

  useKeyboardShortcuts();

  // 이미지 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (!currentImage) {
      router.replace('/');
    }
  }, [currentImage, router]);

  if (!currentImage) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
        <Header />
        <LoginModal />

        {/* 처리 중 오버레이 */}
        {isProcessing && (
          <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center">
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-primary-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm text-gray-300">처리 중...</span>
            </div>
          </div>
        )}

        {/* 에디터 레이아웃: 툴바 | 캔버스 | 사이드바 */}
        <div className="flex-1 flex overflow-hidden">
          <EditorToolbar />
          <div className="flex-1 flex flex-col">
            <EditorCanvas />
            <UndoRedoBar />
          </div>
          <EditorSidebar />
        </div>
    </div>
  );
}
