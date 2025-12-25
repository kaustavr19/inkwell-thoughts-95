import React, { useState, useRef, useEffect, useCallback } from 'react';
import { filterCommands, SlashCommand } from '@/lib/markdown';

interface SlashMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  query: string;
  onSelect: (command: SlashCommand) => void;
  onClose: () => void;
}

export function SlashMenu({ isOpen, position, query, onSelect, onClose }: SlashMenuProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const commands = filterCommands(query);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % commands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + commands.length) % commands.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (commands[activeIndex]) {
            onSelect(commands[activeIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, commands, activeIndex, onSelect, onClose]);

  if (!isOpen || commands.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="slash-menu fixed z-50 animate-fade-in"
      style={{
        left: position.x,
        top: position.y,
        maxHeight: '300px',
        overflowY: 'auto',
      }}
    >
      <div className="py-1">
        <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Commands
        </div>
        {commands.map((command, index) => (
          <div
            key={command.id}
            className={`slash-menu-item ${index === activeIndex ? 'active' : ''}`}
            onClick={() => onSelect(command)}
            onMouseEnter={() => setActiveIndex(index)}
          >
            <span className="icon">
              {command.category === 'block' ? '¶' : 'T'}
            </span>
            <span className="label">{command.label}</span>
            <span className="shortcut">{command.shortcut}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
