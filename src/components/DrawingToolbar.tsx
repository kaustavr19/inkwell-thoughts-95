import React from 'react';
import {
  MousePointer2,
  PenTool,
  Highlighter,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Upload,
  FilePlus,
  FileText,
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
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExport: () => void;
  onExportPdf: () => void;
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
  onRedo,
  onClear,
  canUndo,
  canRedo,
  onExport,
  onExportPdf,
  onImport,
  onNewNote,
}: DrawingToolbarProps) {
  const colors = tool === 'highlighter' ? HIGHLIGHTER_COLORS : PEN_COLORS;
  const currentColor = tool === 'highlighter' ? highlighterColor : penColor;
  const onColorChange = tool === 'highlighter' ? onHighlighterColorChange : onPenColorChange;

  const showColorPicker = tool === 'pen' || tool === 'highlighter';

  return (
    <TooltipProvider delayDuration={200}>
      <div className="docked-toolbar">
        {/* File operations */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="toolbar-btn" onClick={onNewNote}>
              <FilePlus className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8} className="text-xs font-medium">
            New Note
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="toolbar-btn" onClick={onImport}>
              <Upload className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8} className="text-xs font-medium">
            Import .md
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="toolbar-btn" onClick={onExport}>
              <Download className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8} className="text-xs font-medium">
            Export .md
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="toolbar-btn" onClick={onExportPdf}>
              <FileText className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8} className="text-xs font-medium">
            Download PDF
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
          <TooltipContent side="top" sideOffset={8} className="text-xs font-medium">
            Select (Text Mode)
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`toolbar-btn ${tool === 'pen' ? 'active' : ''}`}
              onClick={() => onToolChange('pen')}
            >
              <PenTool className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8} className="text-xs font-medium">
            Pen
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
          <TooltipContent side="top" sideOffset={8} className="text-xs font-medium">
            Highlighter
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
          <TooltipContent side="top" sideOffset={8} className="text-xs font-medium">
            Eraser
          </TooltipContent>
        </Tooltip>

        {showColorPicker && (
          <>
            <div className="toolbar-divider" />
            <div className="flex items-center gap-1.5 px-1">
              {colors.map((color) => (
                <Tooltip key={color.id}>
                  <TooltipTrigger asChild>
                    <button
                      className={`color-chip ${currentColor === color.value ? 'active' : ''}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => onColorChange(color.value)}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={8} className="text-xs font-medium">
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

        {/* Undo/Redo/Clear */}
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
          <TooltipContent side="top" sideOffset={8} className="text-xs font-medium">
            Undo
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="toolbar-btn"
              onClick={onRedo}
              disabled={!canRedo}
            >
              <Redo2 className={`w-5 h-5 ${!canRedo ? 'opacity-40' : ''}`} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8} className="text-xs font-medium">
            Redo
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="toolbar-btn" onClick={onClear}>
              <Trash2 className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8} className="text-xs font-medium">
            Clear Drawings
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
