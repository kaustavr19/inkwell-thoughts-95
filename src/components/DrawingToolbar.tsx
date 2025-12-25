import React from 'react';
import {
  MousePointer2,
  Pen,
  Highlighter,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Upload,
  FilePlus,
  Sun,
  Moon,
  Sunset,
  Columns,
  PenLine,
  Eye,
} from 'lucide-react';
import { DrawingTool, StrokeSize, PEN_COLORS, HIGHLIGHTER_COLORS } from '@/hooks/useDrawing';
import { NoteData } from '@/lib/storage';

interface DrawingToolbarProps {
  tool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  penColor: string;
  onPenColorChange: (color: string) => void;
  highlighterColor: string;
  onHighlighterColorChange: (color: string) => void;
  strokeSize: StrokeSize;
  onStrokeSizeChange: (size: StrokeSize) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
  theme: NoteData['theme'];
  onThemeChange: (theme: NoteData['theme']) => void;
  layout: NoteData['layout'];
  onLayoutChange: (layout: NoteData['layout']) => void;
  onExport: () => void;
  onImport: () => void;
  onNewNote: () => void;
}

export function DrawingToolbar({
  tool,
  onToolChange,
  penColor,
  onPenColorChange,
  highlighterColor,
  onHighlighterColorChange,
  strokeSize,
  onStrokeSizeChange,
  onUndo,
  onClear,
  canUndo,
  theme,
  onThemeChange,
  layout,
  onLayoutChange,
  onExport,
  onImport,
  onNewNote,
}: DrawingToolbarProps) {
  const colors = tool === 'highlighter' ? HIGHLIGHTER_COLORS : PEN_COLORS;
  const currentColor = tool === 'highlighter' ? highlighterColor : penColor;
  const onColorChange = tool === 'highlighter' ? onHighlighterColorChange : onPenColorChange;

  const showColorPicker = tool === 'pen' || tool === 'highlighter';

  return (
    <div className="docked-toolbar">
      {/* File operations */}
      <button
        className="toolbar-btn"
        onClick={onNewNote}
        title="New Note"
      >
        <FilePlus className="w-5 h-5" />
      </button>
      <button
        className="toolbar-btn"
        onClick={onImport}
        title="Import .md"
      >
        <Upload className="w-5 h-5" />
      </button>
      <button
        className="toolbar-btn"
        onClick={onExport}
        title="Export .md"
      >
        <Download className="w-5 h-5" />
      </button>

      <div className="toolbar-divider" />

      {/* Layout controls */}
      <button
        className={`toolbar-btn ${layout === 'split' ? 'active' : ''}`}
        onClick={() => onLayoutChange('split')}
        title="Split View"
      >
        <Columns className="w-5 h-5" />
      </button>
      <button
        className={`toolbar-btn ${layout === 'write' ? 'active' : ''}`}
        onClick={() => onLayoutChange('write')}
        title="Write Mode"
      >
        <PenLine className="w-5 h-5" />
      </button>
      <button
        className={`toolbar-btn ${layout === 'preview' ? 'active' : ''}`}
        onClick={() => onLayoutChange('preview')}
        title="Preview Mode"
      >
        <Eye className="w-5 h-5" />
      </button>

      <div className="toolbar-divider" />

      {/* Drawing tools */}
      <button
        className={`toolbar-btn ${tool === 'select' ? 'active' : ''}`}
        onClick={() => onToolChange('select')}
        title="Select"
      >
        <MousePointer2 className="w-5 h-5" />
      </button>
      <button
        className={`toolbar-btn ${tool === 'pen' ? 'active' : ''}`}
        onClick={() => onToolChange('pen')}
        title="Pen"
      >
        <Pen className="w-5 h-5" />
      </button>
      <button
        className={`toolbar-btn ${tool === 'highlighter' ? 'active' : ''}`}
        onClick={() => onToolChange('highlighter')}
        title="Highlighter"
      >
        <Highlighter className="w-5 h-5" />
      </button>
      <button
        className={`toolbar-btn ${tool === 'eraser' ? 'active' : ''}`}
        onClick={() => onToolChange('eraser')}
        title="Eraser"
      >
        <Eraser className="w-5 h-5" />
      </button>

      {showColorPicker && (
        <>
          <div className="toolbar-divider" />
          <div className="flex items-center gap-1 px-1">
            {colors.map((color) => (
              <button
                key={color.id}
                className={`color-chip ${currentColor === color.value ? 'active' : ''}`}
                style={{ backgroundColor: color.value }}
                onClick={() => onColorChange(color.value)}
                title={color.label}
              />
            ))}
          </div>
          <div className="toolbar-divider" />
          <div className="flex items-center gap-0.5">
            {(['S', 'M', 'L'] as StrokeSize[]).map((size) => (
              <button
                key={size}
                className={`size-btn ${strokeSize === size ? 'active' : ''}`}
                onClick={() => onStrokeSizeChange(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="toolbar-divider" />

      {/* Undo/Clear */}
      <button
        className="toolbar-btn"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo"
      >
        <Undo2 className={`w-5 h-5 ${!canUndo ? 'opacity-40' : ''}`} />
      </button>
      <button
        className="toolbar-btn"
        onClick={onClear}
        title="Clear Drawings"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      <div className="toolbar-divider" />

      {/* Theme */}
      <button
        className={`toolbar-btn ${theme === 'light' ? 'active' : ''}`}
        onClick={() => onThemeChange('light')}
        title="Light Theme"
      >
        <Sun className="w-5 h-5" />
      </button>
      <button
        className={`toolbar-btn ${theme === 'dark' ? 'active' : ''}`}
        onClick={() => onThemeChange('dark')}
        title="Dark Theme"
      >
        <Moon className="w-5 h-5" />
      </button>
      <button
        className={`toolbar-btn ${theme === 'nightlight' ? 'active' : ''}`}
        onClick={() => onThemeChange('nightlight')}
        title="Nightlight"
      >
        <Sunset className="w-5 h-5" />
      </button>
    </div>
  );
}
