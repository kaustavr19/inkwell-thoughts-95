import React, { useState, useRef, useEffect } from 'react';
import { FileText, Edit3, ChevronDown } from 'lucide-react';
import { EditorMode } from './ModePicker';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EditorModeSwitcherProps {
  currentMode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
}

export function EditorModeSwitcher({ currentMode, onModeChange }: EditorModeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleModeSelect = (mode: EditorMode) => {
    if (mode !== currentMode) {
      onModeChange(mode);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="dock-btn flex items-center gap-1.5"
            aria-expanded={isOpen}
          >
            {currentMode === 'markdown' ? (
              <FileText className="w-4 h-4" />
            ) : (
              <Edit3 className="w-4 h-4" />
            )}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8} className="text-xs font-medium">
          Editor Mode
        </TooltipContent>
      </Tooltip>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 rounded-xl bg-dock-bg border border-dock-border shadow-lg overflow-hidden z-50">
          <div className="py-1">
            <button
              onClick={() => handleModeSelect('markdown')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                currentMode === 'markdown'
                  ? 'bg-primary/10 text-primary'
                  : 'text-dock-fg hover:bg-surface/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <div>
                <div className="font-medium text-sm">Markdown</div>
                <div className="text-xs opacity-60">Source + Preview</div>
              </div>
            </button>
            <button
              onClick={() => handleModeSelect('normal')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                currentMode === 'normal'
                  ? 'bg-primary/10 text-primary'
                  : 'text-dock-fg hover:bg-surface/50'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <div>
                <div className="font-medium text-sm">Normal</div>
                <div className="text-xs opacity-60">Notion-style editor</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
