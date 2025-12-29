import React from 'react';
import {
  Sun,
  Moon,
  Sunset,
  Columns2,
  PanelLeft,
  PanelRight,
} from 'lucide-react';
import { NoteData } from '@/lib/storage';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ViewThemeDockProps {
  theme: NoteData['theme'];
  onThemeChange: (theme: NoteData['theme']) => void;
  layout: NoteData['layout'];
  onLayoutChange: (layout: NoteData['layout']) => void;
}

export function ViewThemeDock({
  theme,
  onThemeChange,
  layout,
  onLayoutChange,
}: ViewThemeDockProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="top-right-dock">
        {/* Layout controls */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`dock-btn ${layout === 'write' ? 'active' : ''}`}
              onClick={() => onLayoutChange('write')}
              aria-pressed={layout === 'write'}
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8} className="text-xs font-medium">
            Write View
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`dock-btn ${layout === 'split' ? 'active' : ''}`}
              onClick={() => onLayoutChange('split')}
              aria-pressed={layout === 'split'}
            >
              <Columns2 className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8} className="text-xs font-medium">
            Split View
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`dock-btn ${layout === 'preview' ? 'active' : ''}`}
              onClick={() => onLayoutChange('preview')}
              aria-pressed={layout === 'preview'}
            >
              <PanelRight className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8} className="text-xs font-medium">
            Preview View
          </TooltipContent>
        </Tooltip>

        <div className="dock-divider" />

        {/* Theme controls */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`dock-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => onThemeChange('light')}
              aria-pressed={theme === 'light'}
            >
              <Sun className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8} className="text-xs font-medium">
            Light
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`dock-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => onThemeChange('dark')}
              aria-pressed={theme === 'dark'}
            >
              <Moon className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8} className="text-xs font-medium">
            Dark
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`dock-btn ${theme === 'nightlight' ? 'active' : ''}`}
              onClick={() => onThemeChange('nightlight')}
              aria-pressed={theme === 'nightlight'}
            >
              <Sunset className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8} className="text-xs font-medium">
            Nightlight
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}