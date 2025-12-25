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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef<DrawingStroke | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Resize canvas to match container
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redrawAll();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [strokes]);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    strokes.forEach((stroke) => drawStroke(ctx, stroke));

    // Draw current stroke if drawing
    if (currentStrokeRef.current) {
      drawStroke(ctx, currentStrokeRef.current);
    }
  }, [strokes]);

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

    for (let i = 1; i < stroke.points.length; i++) {
      const p1 = stroke.points[i - 1];
      const p2 = stroke.points[i];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
    }

    const lastPoint = stroke.points[stroke.points.length - 1];
    ctx.lineTo(lastPoint.x, lastPoint.y);
    ctx.stroke();
    ctx.restore();
  };

  const getPointerPos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure,
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (tool === 'select') return;

    const pos = getPointerPos(e);

    if (tool === 'eraser') {
      // Find and erase stroke under cursor
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

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (tool === 'eraser' && e.buttons === 1) {
      const pos = getPointerPos(e);
      const hitStroke = findStrokeAtPoint(pos.x, pos.y);
      if (hitStroke) {
        onEraseStroke(hitStroke.id);
      }
      return;
    }

    if (!isDrawing || !currentStrokeRef.current) return;

    const pos = getPointerPos(e);
    currentStrokeRef.current.points.push(pos);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(redrawAll);
  };

  const handlePointerUp = () => {
    if (!isDrawing || !currentStrokeRef.current) return;

    if (currentStrokeRef.current.points.length > 1) {
      onAddStroke(currentStrokeRef.current);
    }

    currentStrokeRef.current = null;
    setIsDrawing(false);
  };

  const findStrokeAtPoint = (x: number, y: number): DrawingStroke | null => {
    const threshold = 10;

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

  useEffect(() => {
    redrawAll();
  }, [strokes, redrawAll]);

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
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 ${cursorClass}`}
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
}
