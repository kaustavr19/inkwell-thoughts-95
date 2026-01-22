import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Palette,
  Highlighter,
  Table,
  Plus,
  Minus,
  Trash2,
  RowsIcon,
  ColumnsIcon,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TEXT_COLORS, HIGHLIGHT_COLORS } from '@/lib/markdownConverter';

interface RichTextToolbarProps {
  editor: Editor;
}

export function RichTextToolbar({ editor }: RichTextToolbarProps) {
  const [showTextColor, setShowTextColor] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  
  const textColorRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Close popups on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (textColorRef.current && !textColorRef.current.contains(e.target as Node)) {
        setShowTextColor(false);
      }
      if (highlightRef.current && !highlightRef.current.contains(e.target as Node)) {
        setShowHighlight(false);
      }
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setShowTableMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isTableActive = editor.isActive('table');

  return (
    <TooltipProvider delayDuration={300}>
      <div className="rich-text-toolbar">
        {/* Text formatting */}
        <div className="toolbar-group">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            tooltip="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            tooltip="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            tooltip="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            tooltip="Strikethrough (Ctrl+Shift+X)"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className="toolbar-divider" />

        {/* Text color */}
        <div className="toolbar-group relative" ref={textColorRef}>
          <ToolbarButton
            onClick={() => setShowTextColor(!showTextColor)}
            isActive={showTextColor}
            tooltip="Text color"
          >
            <Palette className="w-4 h-4" />
          </ToolbarButton>
          
          {showTextColor && (
            <ColorPicker
              colors={TEXT_COLORS}
              onSelect={(color) => {
                if (color) {
                  editor.chain().focus().setColor(color).run();
                } else {
                  editor.chain().focus().unsetColor().run();
                }
                setShowTextColor(false);
              }}
            />
          )}
        </div>

        {/* Highlight color */}
        <div className="toolbar-group relative" ref={highlightRef}>
          <ToolbarButton
            onClick={() => setShowHighlight(!showHighlight)}
            isActive={showHighlight || editor.isActive('highlight')}
            tooltip="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </ToolbarButton>
          
          {showHighlight && (
            <ColorPicker
              colors={HIGHLIGHT_COLORS}
              onSelect={(color) => {
                if (color) {
                  editor.chain().focus().toggleHighlight({ color }).run();
                } else {
                  editor.chain().focus().unsetHighlight().run();
                }
                setShowHighlight(false);
              }}
              isHighlight
            />
          )}
        </div>

        <div className="toolbar-divider" />

        {/* Table controls */}
        <div className="toolbar-group relative" ref={tableRef}>
          <ToolbarButton
            onClick={() => {
              if (isTableActive) {
                setShowTableMenu(!showTableMenu);
              } else {
                editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
              }
            }}
            isActive={isTableActive || showTableMenu}
            tooltip={isTableActive ? "Table options" : "Insert table"}
          >
            <Table className="w-4 h-4" />
          </ToolbarButton>
          
          {showTableMenu && isTableActive && (
            <TableMenu editor={editor} onClose={() => setShowTableMenu(false)} />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

// Toolbar button component
interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  tooltip: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function ToolbarButton({ onClick, isActive, tooltip, children, disabled }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={`rich-toolbar-btn ${isActive ? 'active' : ''}`}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

// Color picker component
interface ColorPickerProps {
  colors: Array<{ name: string; color: string | null }>;
  onSelect: (color: string | null) => void;
  isHighlight?: boolean;
}

function ColorPicker({ colors, onSelect, isHighlight }: ColorPickerProps) {
  return (
    <div className="color-picker-popup">
      {colors.map((c) => (
        <button
          key={c.name}
          type="button"
          onClick={() => onSelect(c.color)}
          className="color-picker-chip"
          style={{
            backgroundColor: c.color || (isHighlight ? 'transparent' : 'currentColor'),
            border: c.color ? 'none' : '2px dashed hsl(var(--border))',
          }}
          title={c.name}
        >
          {!c.color && <span className="text-xs text-muted-foreground">×</span>}
        </button>
      ))}
    </div>
  );
}

// Table menu component
interface TableMenuProps {
  editor: Editor;
  onClose: () => void;
}

function TableMenu({ editor, onClose }: TableMenuProps) {
  const actions = [
    {
      label: 'Add row above',
      icon: <Plus className="w-3 h-3" />,
      action: () => editor.chain().focus().addRowBefore().run(),
    },
    {
      label: 'Add row below',
      icon: <Plus className="w-3 h-3" />,
      action: () => editor.chain().focus().addRowAfter().run(),
    },
    {
      label: 'Add column left',
      icon: <Plus className="w-3 h-3" />,
      action: () => editor.chain().focus().addColumnBefore().run(),
    },
    {
      label: 'Add column right',
      icon: <Plus className="w-3 h-3" />,
      action: () => editor.chain().focus().addColumnAfter().run(),
    },
    { type: 'divider' },
    {
      label: 'Delete row',
      icon: <Minus className="w-3 h-3" />,
      action: () => editor.chain().focus().deleteRow().run(),
    },
    {
      label: 'Delete column',
      icon: <Minus className="w-3 h-3" />,
      action: () => editor.chain().focus().deleteColumn().run(),
    },
    { type: 'divider' },
    {
      label: 'Delete table',
      icon: <Trash2 className="w-3 h-3" />,
      action: () => editor.chain().focus().deleteTable().run(),
      danger: true,
    },
  ];

  return (
    <div className="table-menu-popup">
      {actions.map((item, i) =>
        item.type === 'divider' ? (
          <div key={i} className="table-menu-divider" />
        ) : (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              item.action?.();
              onClose();
            }}
            className={`table-menu-item ${item.danger ? 'danger' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        )
      )}
    </div>
  );
}
