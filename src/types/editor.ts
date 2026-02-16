export type Tool =
  | 'select'
  | 'remove-bg'
  | 'touchup-add'
  | 'touchup-remove'
  | 'tone'
  | 'upscale'
  | 'crop'
  | 'background-replace';

export type BackgroundType = 'transparent' | 'solid' | 'gradient' | 'image' | 'template';

export type GradientDirection = 'to-right' | 'to-left' | 'to-bottom' | 'to-top' | 'to-br' | 'to-bl';

export type CommerceTemplate = 'smartstore' | 'coupang' | 'daangn' | '11st';

export interface ToneSettings {
  brightness: number; // -100 ~ 100
  contrast: number;   // -100 ~ 100
  saturation: number; // -100 ~ 100
  temperature: number; // -100 ~ 100 (warm/cool)
}

export interface CropPreset {
  label: string;
  ratio: [number, number] | null; // null = free
}

export interface BackgroundSettings {
  type: BackgroundType;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  gradientDirection: GradientDirection;
  imageUrl: string | null;
  template: CommerceTemplate | null;
}

export interface HistoryEntry {
  imageData: string; // base64 data URL
  label: string;
}

export interface EditorState {
  // Image
  originalImage: string | null;
  currentImage: string | null;
  maskImage: string | null;
  width: number;
  height: number;

  // Tool
  activeTool: Tool;
  isProcessing: boolean;

  // Tone
  tone: ToneSettings;

  // Crop
  cropArea: { x: number; y: number; w: number; h: number } | null;

  // Background
  background: BackgroundSettings;

  // Brush
  brushSize: number;

  // History
  history: HistoryEntry[];
  historyIndex: number;

  // Compare
  showCompare: boolean;

  // Actions
  setOriginalImage: (dataUrl: string, w: number, h: number) => void;
  setCurrentImage: (dataUrl: string) => void;
  setMaskImage: (mask: string | null) => void;
  setActiveTool: (tool: Tool) => void;
  setProcessing: (v: boolean) => void;
  setTone: (tone: Partial<ToneSettings>) => void;
  setCropArea: (area: EditorState['cropArea']) => void;
  setBackground: (bg: Partial<BackgroundSettings>) => void;
  setBrushSize: (size: number) => void;
  setShowCompare: (v: boolean) => void;
  pushHistory: (label: string) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
}
