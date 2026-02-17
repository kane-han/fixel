'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useEditorStore } from '@/stores/editor-store';

export function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentImage, width, height, activeTool, brushSize, showCompare, originalImage } = useEditorStore();
  const [compareX, setCompareX] = useState(0.5);
  const [isDraggingCompare, setIsDraggingCompare] = useState(false);
  const [scale, setScale] = useState(1);
  const [brushPoints, setBrushPoints] = useState<{ x: number; y: number }[]>([]);
  const [isPainting, setIsPainting] = useState(false);

  const isBrushTool = activeTool === 'touchup-add' || activeTool === 'touchup-remove';

  // 캔버스 렌더링
  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage) return;

    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.src = currentImage;
    await new Promise((resolve) => { img.onload = resolve; });

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (showCompare && originalImage) {
      // 비교 모드: 왼쪽 원본, 오른쪽 보정
      const splitX = canvas.width * compareX;

      const origImg = new Image();
      origImg.src = originalImage;
      await new Promise((resolve) => { origImg.onload = resolve; });

      // 왼쪽: 원본
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, canvas.height);
      ctx.clip();
      ctx.drawImage(origImg, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // 오른쪽: 보정본
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, canvas.width - splitX, canvas.height);
      ctx.clip();
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // 구분선
      ctx.strokeStyle = '#16be63';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, canvas.height);
      ctx.stroke();
    } else {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }, [currentImage, showCompare, originalImage, compareX]);

  // 컨테이너에 맞게 스케일 조정 + 리사이즈 리스너
  useEffect(() => {
    if (!containerRef.current || !width || !height) return;

    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;
      const maxW = container.clientWidth - 40;
      const maxH = container.clientHeight - 40;
      const s = Math.min(maxW / width, maxH / height, 1);
      setScale(s);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width, height]);

  useEffect(() => {
    render();
  }, [render]);

  // 브러시 드로잉
  const getCanvasPoint = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * width,
      y: ((e.clientY - rect.top) / rect.height) * height,
    };
  }, [width, height]);

  const getCompareX = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return 0.5;
    const rect = canvas.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 비교 모드 슬라이더 — 모든 도구에서 동작
    if (showCompare) {
      setIsDraggingCompare(true);
      setCompareX(getCompareX(e));
      return;
    }

    // 브러시 도구일 때만 페인팅 시작
    if (!isBrushTool) return;
    setIsPainting(true);
    const pt = getCanvasPoint(e);
    if (pt) setBrushPoints([pt]);
  }, [showCompare, isBrushTool, getCanvasPoint, getCompareX]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // 비교 슬라이더 드래그
    if (isDraggingCompare) {
      setCompareX(getCompareX(e));
      return;
    }

    // 브러시 페인팅
    if (!isPainting) return;
    const pt = getCanvasPoint(e);
    if (pt) setBrushPoints((prev) => [...prev, pt]);
  }, [isPainting, isDraggingCompare, getCanvasPoint, getCompareX]);

  const handleMouseUp = useCallback(async () => {
    // 비교 슬라이더 드래그 종료
    if (isDraggingCompare) {
      setIsDraggingCompare(false);
      return;
    }

    // 브러시 스트로크 적용
    if (!isPainting || brushPoints.length === 0) {
      setIsPainting(false);
      setBrushPoints([]);
      return;
    }
    setIsPainting(false);

    const { applyBrushStroke } = await import('@/lib/canvas/brush');
    const store = useEditorStore.getState();
    if (!store.currentImage || !store.originalImage) {
      setBrushPoints([]);
      return;
    }

    const mode = store.activeTool === 'touchup-add' ? 'add' : 'remove';
    const result = await applyBrushStroke(
      store.currentImage,
      store.originalImage,
      brushPoints,
      brushSize,
      mode
    );
    store.setCurrentImage(result);
    store.pushHistory(mode === 'add' ? '영역 추가 제거' : '영역 복원');
    setBrushPoints([]);
  }, [isPainting, isDraggingCompare, brushPoints, brushSize]);

  const cursorStyle = showCompare
    ? 'col-resize'
    : isBrushTool
    ? 'crosshair'
    : 'default';

  return (
    <div ref={containerRef} className="flex-1 flex items-center justify-center checkerboard overflow-hidden">
      {currentImage ? (
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            width: width * scale,
            height: height * scale,
            cursor: cursorStyle,
          }}
          className="shadow-2xl"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      ) : (
        <p className="text-gray-500">이미지를 업로드해주세요</p>
      )}
    </div>
  );
}
