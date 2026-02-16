import { create } from 'zustand';
import type { EditorState, ToneSettings, BackgroundSettings, Tool } from '@/types/editor';

const MAX_HISTORY = 20;

const defaultTone: ToneSettings = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
};

const defaultBackground: BackgroundSettings = {
  type: 'transparent',
  color: '#ffffff',
  gradientFrom: '#ffffff',
  gradientTo: '#000000',
  gradientDirection: 'to-bottom',
  imageUrl: null,
  template: null,
};

export const useEditorStore = create<EditorState>((set, get) => ({
  originalImage: null,
  currentImage: null,
  maskImage: null,
  width: 0,
  height: 0,

  activeTool: 'select',
  isProcessing: false,

  tone: { ...defaultTone },
  cropArea: null,
  background: { ...defaultBackground },
  brushSize: 20,

  history: [],
  historyIndex: -1,

  showCompare: false,

  setOriginalImage: (dataUrl: string, w: number, h: number) =>
    set({
      originalImage: dataUrl,
      currentImage: dataUrl,
      width: w,
      height: h,
      history: [{ imageData: dataUrl, label: '원본' }],
      historyIndex: 0,
      tone: { ...defaultTone },
      background: { ...defaultBackground },
      maskImage: null,
      cropArea: null,
      activeTool: 'select',
    }),

  setCurrentImage: (dataUrl: string) => set({ currentImage: dataUrl }),
  setMaskImage: (mask: string | null) => set({ maskImage: mask }),
  setActiveTool: (tool: Tool) => set({ activeTool: tool }),
  setProcessing: (v: boolean) => set({ isProcessing: v }),

  setTone: (partial: Partial<ToneSettings>) =>
    set((s) => ({ tone: { ...s.tone, ...partial } })),

  setCropArea: (area) => set({ cropArea: area }),

  setBackground: (partial: Partial<BackgroundSettings>) =>
    set((s) => ({ background: { ...s.background, ...partial } })),

  setBrushSize: (size: number) => set({ brushSize: size }),
  setShowCompare: (v: boolean) => set({ showCompare: v }),

  pushHistory: (label: string) => {
    const { currentImage, history, historyIndex } = get();
    if (!currentImage) return;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ imageData: currentImage, label });

    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    set({
      currentImage: history[newIndex].imageData,
      historyIndex: newIndex,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    set({
      currentImage: history[newIndex].imageData,
      historyIndex: newIndex,
    });
  },

  reset: () => {
    const { originalImage, width, height } = get();
    if (!originalImage) return;
    set({
      currentImage: originalImage,
      maskImage: null,
      tone: { ...defaultTone },
      background: { ...defaultBackground },
      cropArea: null,
      activeTool: 'select',
      history: [{ imageData: originalImage, label: '원본' }],
      historyIndex: 0,
    });
  },
}));
