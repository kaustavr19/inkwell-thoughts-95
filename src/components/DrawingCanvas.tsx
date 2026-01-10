import React, { useRef, useEffect, useCallback, useState } from 'react';
import { DrawingStroke } from '@/lib/storage';
import { DrawingTool, STROKE_SIZES, HIGHLIGHTER_SIZES, StrokeSize } from '@/hooks/useDrawing';

interface DrawingCanvasProps {
  strokes: DrawingStroke[];
  tool: DrawingTool;
  penColor: string;
  highlighterColor: string;
  strokeSize: StrokeSize;
  onAddStroke: (stroke: DrawingStroke) => void;
  onEraseStroke: (strokeId: string) => void;
  isDrawingMode: boolean;
}

// Performance: minimum distance between points to reduce density
const MIN_POINT_DISTANCE = 2;

// Performance toggle: set to true on slow devices
const REDUCE_SMOOTHING = false;

export function DrawingCanvas({
  strokes,
  tool,
  penColor,
  highlighterColor,
  strokeSize,
  onAddStroke,
  onEraseStroke,
  isDrawingMode,
}: DrawingCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Main canvas for committed strokes
  const committedCanvasRef = useRef<HTMLCanvasElement>(null);
  // Overlay canvas for active stroke (avoids full redraws)
  const activeCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef<DrawingStroke | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const needsRedrawRef = useRef(false);
  const dprRef = useRef(window.devicePixelRatio || 1);

  // Setup canvases with proper DPR scaling
  const setupCanvas = useCallback((canvas: HTMLCanvasElement, width: number, height: number) => {
    const dpr = dprRef.current;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    return ctx;
  }, []);

  // Resize both canvases
  useEffect(() => {
    const resize = () => {
      const container = containerRef.current;
      const committedCanvas = committedCanvasRef.current;
      const activeCanvas = activeCanvasRef.current;
      if (!container || !committedCanvas || !activeCanvas) return;

      const rect = container.getBoundingClientRect();
      dprRef.current = window.devicePixelRatio || 1;
      
      setupCanvas(committedCanvas, rect.width, rect.height);
      setupCanvas(activeCanvas, rect.width, rect.height);
      
      // Redraw committed strokes after resize
      redrawCommitted();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [setupCanvas, strokes]);

  // Redraw all committed strokes to the committed canvas
  const redrawCommitted = useCallback(() => {
    const canvas = committedCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = dprRef.current;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    // Draw all committed strokes
    strokes.forEach((stroke) => drawStroke(ctx, stroke));
  }, [strokes]);

  // Redraw when strokes change
  useEffect(() => {
    redrawCommitted();
  }, [strokes, redrawCommitted]);

  // Draw a single stroke
  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: DrawingStroke) => {
    if (stroke.points.length < 2) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = stroke.size;
    ctx.strokeStyle = stroke.color;

    if (stroke.tool === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply';
    }

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    // Use quadratic curves for smoothing (unless disabled)
    if (!REDUCE_SMOOTHING && stroke.points.length > 2) {
      for (let i = 1; i < stroke.points.length - 1; i++) {
        const p1 = stroke.points[i];
        const p2 = stroke.points[i + 1];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
      }
      const lastPoint = stroke.points[stroke.points.length - 1];
      ctx.lineTo(lastPoint.x, lastPoint.y);
    } else {
      // Simple line-to for fast rendering
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
    }

    ctx.stroke();
    ctx.restore();
  };

  // Draw active stroke on overlay canvas
  const drawActiveStroke = useCallback(() => {
    const canvas = activeCanvasRef.current;
    const stroke = currentStrokeRef.current;
    if (!canvas || !stroke) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = dprRef.current;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    drawStroke(ctx, stroke);
    needsRedrawRef.current = false;
  }, []);

  // RAF loop for smooth active stroke rendering
  const scheduleRedraw = useCallback(() => {
    if (animationFrameRef.current) return;
    
    needsRedrawRef.current = true;
    animationFrameRef.current = requestAnimationFrame(() => {
      if (needsRedrawRef.current) {
        drawActiveStroke();
      }
      animationFrameRef.current = null;
    });
  }, [drawActiveStroke]);

  // Clear active canvas
  const clearActiveCanvas = useCallback(() => {
    const canvas = activeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Eraser using destination-out compositing
  const eraseAtPoint = useCallback((x: number, y: number, size: number) => {
    const canvas = committedCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = dprRef.current;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, []);

  const getPointerPos = (e: React.PointerEvent) => {
    const canvas = committedCanvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 0.5 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5,
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (tool === 'select') return;

    // Set pointer capture for reliable tracking
    e.currentTarget.setPointerCapture(e.pointerId);
    
    const pos = getPointerPos(e);

    if (tool === 'eraser') {
      // Start erasing immediately
      setIsDrawing(true);
      lastPointRef.current = { x: pos.x, y: pos.y };
      const eraserSize = STROKE_SIZES[strokeSize] * 6;
      eraseAtPoint(pos.x, pos.y, eraserSize);
      
      // Also try to find and remove strokes for undo support
      const hitStroke = findStrokeAtPoint(pos.x, pos.y);
      if (hitStroke) {
        onEraseStroke(hitStroke.id);
      }
      return;
    }

    setIsDrawing(true);
    const color = tool === 'pen' ? penColor : highlighterColor;
    const size = tool === 'pen' ? STROKE_SIZES[strokeSize] : HIGHLIGHTER_SIZES[strokeSize];

    currentStrokeRef.current = {
      id: crypto.randomUUID(),
      tool,
      color,
      size,
      points: [pos],
    };
    lastPointRef.current = { x: pos.x, y: pos.y };
    
    scheduleRedraw();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;

    const pos = getPointerPos(e);
    
    // Point density reduction - skip if too close to last point
    if (lastPointRef.current) {
      const dx = pos.x - lastPointRef.current.x;
      const dy = pos.y - lastPointRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < MIN_POINT_DISTANCE) return;
    }

    if (tool === 'eraser') {
      const eraserSize = STROKE_SIZES[strokeSize] * 6;
      eraseAtPoint(pos.x, pos.y, eraserSize);
      
      const hitStroke = findStrokeAtPoint(pos.x, pos.y);
      if (hitStroke) {
        onEraseStroke(hitStroke.id);
      }
      lastPointRef.current = { x: pos.x, y: pos.y };
      return;
    }

    if (!currentStrokeRef.current) return;

    currentStrokeRef.current.points.push(pos);
    lastPointRef.current = { x: pos.x, y: pos.y };
    
    scheduleRedraw();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerId) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (tool === 'eraser') {
      setIsDrawing(false);
      lastPointRef.current = null;
      return;
    }

    if (!isDrawing || !currentStrokeRef.current) return;

    if (currentStrokeRef.current.points.length > 1) {
      onAddStroke(currentStrokeRef.current);
    }

    currentStrokeRef.current = null;
    lastPointRef.current = null;
    setIsDrawing(false);
    clearActiveCanvas();
  };

  const findStrokeAtPoint = (x: number, y: number): DrawingStroke | null => {
    const threshold = 12;

    for (let i = strokes.length - 1; i >= 0; i--) {
      const stroke = strokes[i];
      for (const point of stroke.points) {
        const dx = point.x - x;
        const dy = point.y - y;
        if (dx * dx + dy * dy < threshold * threshold) {
          return stroke;
        }
      }
    }
    return null;
  };

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const cursorClass =
    tool === 'pen'
      ? 'cursor-pen'
      : tool === 'highlighter'
      ? 'cursor-highlighter'
      : tool === 'eraser'
      ? 'cursor-eraser'
      : '';

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 ${isDrawingMode ? 'z-20' : 'z-0 pointer-events-none'}`}
    >
      {/* Committed strokes layer */}
      <canvas
        ref={committedCanvasRef}
        className="absolute inset-0"
        style={{ touchAction: 'none' }}
      />
      {/* Active stroke overlay - handles all pointer events */}
      <canvas
        ref={activeCanvasRef}
        className={`absolute inset-0 ${cursorClass}`}
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
}
