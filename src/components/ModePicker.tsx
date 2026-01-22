import React, { useState } from 'react';
import { FileText, Edit3, Check } from 'lucide-react';

export type EditorMode = 'markdown' | 'normal';

interface ModePickerProps {
  onSelectMode: (mode: EditorMode, remember: boolean) => void;
  hasExistingNote: boolean;
  lastUsedMode?: EditorMode;
  onContinueSession?: () => void;
}

export function ModePicker({ 
  onSelectMode, 
  hasExistingNote, 
  lastUsedMode,
  onContinueSession 
}: ModePickerProps) {
  const [rememberChoice, setRememberChoice] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Welcome to InkPad
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose your preferred editing experience
          </p>
        </div>

        {/* Mode cards */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {/* Markdown Editor Card */}
          <button
            onClick={() => onSelectMode('markdown', rememberChoice)}
            className="mode-picker-card group"
          >
            <div className="mode-picker-icon">
              <FileText className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Markdown Editor
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Source + Preview panes with raw Markdown editing and live rendered preview
            </p>
          </button>

          {/* Normal Editor Card */}
          <button
            onClick={() => onSelectMode('normal', rememberChoice)}
            className="mode-picker-card group"
          >
            <div className="mode-picker-icon">
              <Edit3 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Normal Editor
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Notion-style rich editing with formatting toolbar, tables, and slash commands
            </p>
          </button>
        </div>

        {/* Remember choice checkbox */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div 
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                rememberChoice 
                  ? 'bg-primary border-primary' 
                  : 'border-muted-foreground/40 hover:border-muted-foreground'
              }`}
              onClick={() => setRememberChoice(!rememberChoice)}
            >
              {rememberChoice && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
            </div>
            <span 
              className="text-muted-foreground text-sm"
              onClick={() => setRememberChoice(!rememberChoice)}
            >
              Remember my choice
            </span>
          </label>
        </div>

        {/* Continue session CTA */}
        {hasExistingNote && lastUsedMode && onContinueSession && (
          <div className="text-center">
            <button
              onClick={onContinueSession}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
            >
              Continue last session
              <span className="text-primary/60 text-sm">
                ({lastUsedMode === 'markdown' ? 'Markdown' : 'Normal'} mode)
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
