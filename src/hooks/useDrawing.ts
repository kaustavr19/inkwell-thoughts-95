import { useState, useCallback, useRef } from 'react';
import { DrawingStroke } from '@/lib/storage';

export type DrawingTool = 'select' | 'pen' | 'highlighter' | 'eraser';
export type StrokeSize = 'S' | 'M' | 'L';

export const PEN_COLORS = [
  { id: 'black', value: '#1a1a1a', label: 'Black' },
  { id: 'blue', value: '#2563eb', label: 'Blue' },
  { id: 'red', value: '#dc2626', label: 'Red' },
  { id: 'green', value: '#16a34a', label: 'Green' },
];

export const HIGHLIGHTER_COLORS = [
  { id: 'yellow', value: 'rgba(255, 235, 59, 0.35)', label: 'Yellow' },
  { id: 'green', value: 'rgba(57, 255, 20, 0.30)', label: 'Green' },
  { id: 'pink', value: 'rgba(255, 20, 147, 0.28)', label: 'Pink' },
  { id: 'orange', value: 'rgba(255, 145, 0, 0.30)', label: 'Orange' },
  { id: 'blue', value: 'rgba(0, 183, 255, 0.28)', label: 'Blue' },
];

export const STROKE_SIZES: Record<StrokeSize, number> = {
  S: 2,
  M: 4,
  L: 8,
};

export const HIGHLIGHTER_SIZES: Record<StrokeSize, number> = {
  S: 12,
  M: 20,
  L: 32,
};

export function useDrawing() {
  const [tool, setTool] = useState<DrawingTool>('select');
  const [penColor, setPenColor] = useState(PEN_COLORS[0].value);
  const [highlighterColor, setHighlighterColor] = useState(HIGHLIGHTER_COLORS[0].value);
  const [strokeSize, setStrokeSize] = useState<StrokeSize>('M');
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef<DrawingStroke | null>(null);
  const undoStackRef = useRef<DrawingStroke[]>([]);

  const startStroke = useCallback(
    (x: number, y: number, pressure?: number) => {
      if (tool === 'select' || tool === 'eraser') return null;

      const color = tool === 'pen' ? penColor : highlighterColor;
      const size = tool === 'pen' ? STROKE_SIZES[strokeSize] : HIGHLIGHTER_SIZES[strokeSize];

      const stroke: DrawingStroke = {
        id: crypto.randomUUID(),
        tool,
        color,
        size,
        points: [{ x, y, pressure }],
      };

      currentStrokeRef.current = stroke;
      setIsDrawing(true);
      return stroke;
    },
    [tool, penColor, highlighterColor, strokeSize]
  );

  const addPoint = useCallback((x: number, y: number, pressure?: number) => {
    if (!currentStrokeRef.current) return null;

    currentStrokeRef.current.points.push({ x, y, pressure });
    return { ...currentStrokeRef.current };
  }, []);

  const endStroke = useCallback(() => {
    const stroke = currentStrokeRef.current;
    currentStrokeRef.current = null;
    setIsDrawing(false);
    
    if (stroke && stroke.points.length > 1) {
      undoStackRef.current = []; // Clear redo stack on new stroke
      return stroke;
    }
    return null;
  }, []);

  const getCurrentColor = useCallback(() => {
    return tool === 'highlighter' ? highlighterColor : penColor;
  }, [tool, penColor, highlighterColor]);

  const getCurrentSize = useCallback(() => {
    return tool === 'highlighter' ? HIGHLIGHTER_SIZES[strokeSize] : STROKE_SIZES[strokeSize];
  }, [tool, strokeSize]);

  const isDrawingMode = tool !== 'select';

  return {
    tool,
    setTool,
    penColor,
    setPenColor,
    highlighterColor,
    setHighlighterColor,
    strokeSize,
    setStrokeSize,
    isDrawing,
    isDrawingMode,
    startStroke,
    addPoint,
    endStroke,
    getCurrentColor,
    getCurrentSize,
  };
}
