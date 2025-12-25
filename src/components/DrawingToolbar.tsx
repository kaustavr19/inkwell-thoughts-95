import React from 'react';
import {
  MousePointer2,
  Pen,
  Highlighter,
  Eraser,
  Undo2,
  Trash2,
  Download,
  Upload,
  FilePlus,
} from 'lucide-react';
import { DrawingTool, StrokeSize, PEN_COLORS, HIGHLIGHTER_COLORS } from '@/hooks/useDrawing';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  onClear: () => void;
  canUndo: boolean;
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
  onExport,
  onImport,
  onNewNote,
}: DrawingToolbarProps) {
  const colors = tool === 'highlighter' ? HIGHLIGHTER_COLORS : PEN_COLORS;
  const currentColor = tool === 'highlighter' ? highlighterColor : penColor;
  const onColorChange = tool === 'highlighter' ? onHighlighterColorChange : onPenColorChange;

  const showColorPicker = tool === 'pen' || tool === 'highlighter';

  return (
    <TooltipProvider delayDuration={300}>
      <div className="docked-toolbar">
        {/* File operations */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="toolbar-btn" onClick={onNewNote}>
              <FilePlus className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            New Note
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="toolbar-btn" onClick={onImport}>
              <Upload className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Import .md
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="toolbar-btn" onClick={onExport}>
              <Download className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Export .md
          </TooltipContent>
        </Tooltip>

        <div className="toolbar-divider" />

        {/* Drawing tools */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`toolbar-btn ${tool === 'select' ? 'active' : ''}`}
              onClick={() => onToolChange('select')}
            >
              <MousePointer2 className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Select (Text Mode)
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`toolbar-btn ${tool === 'pen' ? 'active' : ''}`}
              onClick={() => onToolChange('pen')}
            >
              <Pen className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Draw
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`toolbar-btn ${tool === 'highlighter' ? 'active' : ''}`}
              onClick={() => onToolChange('highlighter')}
            >
              <Highlighter className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Highlight
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`toolbar-btn ${tool === 'eraser' ? 'active' : ''}`}
              onClick={() => onToolChange('eraser')}
            >
              <Eraser className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Eraser
          </TooltipContent>
        </Tooltip>

        {showColorPicker && (
          <>
            <div className="toolbar-divider" />
            <div className="flex items-center gap-1 px-1">
              {colors.map((color) => (
                <Tooltip key={color.id}>
                  <TooltipTrigger asChild>
                    <button
                      className={`color-chip ${currentColor === color.value ? 'active' : ''}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => onColorChange(color.value)}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {color.label}
                  </TooltipContent>
                </Tooltip>
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
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="toolbar-btn"
              onClick={onUndo}
              disabled={!canUndo}
            >
              <Undo2 className={`w-5 h-5 ${!canUndo ? 'opacity-40' : ''}`} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Undo
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="toolbar-btn" onClick={onClear}>
              <Trash2 className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Clear Drawings
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
