import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useNote } from '@/hooks/useNote';
import { useDrawing } from '@/hooks/useDrawing';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { MarkdownPreview } from '@/components/MarkdownPreview';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import { DrawingToolbar } from '@/components/DrawingToolbar';
import { ViewThemeDock } from '@/components/ViewThemeDock';
import { NoteTitle } from '@/components/NoteTitle';
import { SaveIndicator } from '@/components/SaveIndicator';
import { DrawingStroke } from '@/lib/storage';

const Index = () => {
  const {
    note,
    isLoading,
    saveStatus,
    updateContent,
    updateTitle,
    updateTheme,
    updateLayout,
    addStroke,
    removeStroke,
    undoStroke,
    clearDrawings,
    exportNote,
    importNote,
    createNew,
  } = useNote();

  const {
    tool,
    setTool,
    penColor,
    setPenColor,
    highlighterColor,
    setHighlighterColor,
    strokeSize,
    setStrokeSize,
    isDrawingMode,
  } = useDrawing();

  const [redoStack, setRedoStack] = useState<DrawingStroke[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply theme class
  useEffect(() => {
    if (!note) return;
    document.documentElement.classList.remove('light', 'dark', 'nightlight');
    document.documentElement.classList.add(note.theme);
  }, [note?.theme]);

  // Handle keyboard shortcuts for layout
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape returns to split view
      if (e.key === 'Escape' && note?.layout !== 'split') {
        updateLayout('split');
        return;
      }

      // Ctrl/Cmd+Alt+1/2/3 for view switching
      if ((e.ctrlKey || e.metaKey) && e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          updateLayout('write');
        } else if (e.key === '2') {
          e.preventDefault();
          updateLayout('split');
        } else if (e.key === '3') {
          e.preventDefault();
          updateLayout('preview');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [note?.layout, updateLayout]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importNote(file);
      } catch (error) {
        console.error('Failed to import:', error);
      }
    }
    e.target.value = '';
  };

  const handleAddStroke = (stroke: DrawingStroke) => {
    addStroke(stroke);
    setRedoStack([]);
  };

  const handleEraseStroke = useCallback((strokeId: string) => {
    if (!note) return;
    const erasedStroke = note.drawings.find(s => s.id === strokeId);
    if (erasedStroke) {
      setRedoStack((prev) => [...prev, erasedStroke]);
      removeStroke(strokeId);
    }
  }, [note, removeStroke]);

  const handleUndo = () => {
    if (!note || note.drawings.length === 0) return;
    const lastStroke = note.drawings[note.drawings.length - 1];
    setRedoStack((prev) => [...prev, lastStroke]);
    undoStroke();
  };

  const handleClear = () => {
    if (!note || note.drawings.length === 0) return;
    if (window.confirm('Clear all drawings? This cannot be undone.')) {
      clearDrawings();
      setRedoStack([]);
    }
  };

  const handleNewNote = () => {
    if (window.confirm('Create a new note? Unsaved changes will be lost.')) {
      createNew();
      setRedoStack([]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading InkPad...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Something went wrong. Please refresh.</p>
      </div>
    );
  }

  const showEditor = note.layout === 'split' || note.layout === 'write';
  const showPreview = note.layout === 'split' || note.layout === 'preview';

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-background/80 backdrop-blur-sm z-30">
        <NoteTitle title={note.title} onChange={updateTitle} />
        <SaveIndicator status={saveStatus} />
      </header>

      {/* Top-right dock for view/theme */}
      <ViewThemeDock
        theme={note.theme}
        onThemeChange={updateTheme}
        layout={note.layout}
        onLayoutChange={updateLayout}
      />

      {/* Main content */}
      <main className="flex-1 relative overflow-hidden" style={{ paddingBottom: '80px' }}>
        <div className="flex h-full">
          {/* Editor pane */}
          {showEditor && (
            <div
              className={`relative ${
                note.layout === 'split' ? 'w-1/2 border-r border-border' : 'w-full'
              }`}
            >
              <MarkdownEditor
                content={note.content}
                onChange={updateContent}
                disabled={isDrawingMode}
              />
            </div>
          )}

          {/* Preview pane */}
          {showPreview && (
            <div
              className={`relative ${note.layout === 'split' ? 'w-1/2' : 'w-full'}`}
            >
              <MarkdownPreview content={note.content} />
              
              {/* Drawing canvas overlays preview */}
              <DrawingCanvas
                strokes={note.drawings}
                tool={tool}
                penColor={penColor}
                highlighterColor={highlighterColor}
                strokeSize={strokeSize}
                onAddStroke={handleAddStroke}
                onEraseStroke={handleEraseStroke}
                isDrawingMode={isDrawingMode}
              />
            </div>
          )}
        </div>
      </main>

      {/* Bottom docked toolbar - drawing only */}
      <DrawingToolbar
        tool={tool}
        onToolChange={setTool}
        penColor={penColor}
        onPenColorChange={setPenColor}
        highlighterColor={highlighterColor}
        onHighlighterColorChange={setHighlighterColor}
        strokeSize={strokeSize}
        onStrokeSizeChange={setStrokeSize}
        onUndo={handleUndo}
        onClear={handleClear}
        canUndo={note.drawings.length > 0}
        onExport={exportNote}
        onImport={handleImportClick}
        onNewNote={handleNewNote}
      />

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default Index;
