import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SlashMenu } from './SlashMenu';
import { SlashCommand, applyFormatting, getKeyboardShortcut } from '@/lib/markdown';
import { compressImage } from '@/lib/storage';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  disabled?: boolean;
}

export function MarkdownEditor({ content, onChange, disabled }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [slashMenu, setSlashMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    query: string;
    startIndex: number;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    query: '',
    startIndex: 0,
  });

  const getCaretCoordinates = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return { x: 0, y: 0 };

    const { selectionStart } = textarea;
    const textBefore = content.slice(0, selectionStart);
    const lines = textBefore.split('\n');
    const currentLine = lines.length;
    const charInLine = lines[lines.length - 1].length;

    // Create a hidden span to measure text
    const span = document.createElement('span');
    span.style.font = getComputedStyle(textarea).font;
    span.style.whiteSpace = 'pre';
    span.style.position = 'absolute';
    span.style.visibility = 'hidden';
    span.textContent = lines[lines.length - 1] || ' ';
    document.body.appendChild(span);

    const rect = textarea.getBoundingClientRect();
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 28;
    const paddingTop = parseFloat(getComputedStyle(textarea).paddingTop);
    const paddingLeft = parseFloat(getComputedStyle(textarea).paddingLeft);

    const x = rect.left + paddingLeft + Math.min(span.offsetWidth, rect.width - 250);
    const y = rect.top + paddingTop + (currentLine * lineHeight) - textarea.scrollTop + lineHeight;

    document.body.removeChild(span);

    return { x: Math.min(x, window.innerWidth - 250), y: Math.min(y, window.innerHeight - 320) };
  }, [content]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const { selectionStart } = e.target;

    onChange(newContent);

    // Check for slash command trigger
    const textBefore = newContent.slice(0, selectionStart);
    const lastSlash = textBefore.lastIndexOf('/');

    if (lastSlash !== -1) {
      const textAfterSlash = textBefore.slice(lastSlash + 1);
      const hasSpace = /\s/.test(textAfterSlash);
      const isStartOfLine = lastSlash === 0 || newContent[lastSlash - 1] === '\n' || newContent[lastSlash - 1] === ' ';

      if (!hasSpace && isStartOfLine) {
        setSlashMenu({
          isOpen: true,
          position: getCaretCoordinates(),
          query: textAfterSlash,
          startIndex: lastSlash,
        });
        return;
      }
    }

    setSlashMenu((prev) => ({ ...prev, isOpen: false }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle slash menu navigation
    if (slashMenu.isOpen && ['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
      return; // Let SlashMenu handle these
    }

    // Close slash menu on escape
    if (e.key === 'Escape') {
      setSlashMenu((prev) => ({ ...prev, isOpen: false }));
      return;
    }

    // Handle keyboard shortcuts
    const shortcut = getKeyboardShortcut(e.nativeEvent);
    if (shortcut) {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { newContent, newCursorPos } = applyFormatting(
        content,
        textarea.selectionStart,
        textarea.selectionEnd,
        shortcut
      );
      onChange(newContent);

      requestAnimationFrame(() => {
        textarea.selectionStart = newCursorPos;
        textarea.selectionEnd = newCursorPos;
      });
    }

    // Handle Tab for indent
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart, selectionEnd } = textarea;
      const newContent = content.slice(0, selectionStart) + '  ' + content.slice(selectionEnd);
      onChange(newContent);

      requestAnimationFrame(() => {
        textarea.selectionStart = selectionStart + 2;
        textarea.selectionEnd = selectionStart + 2;
      });
    }
  };

  const handleSlashSelect = (command: SlashCommand) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const before = content.slice(0, slashMenu.startIndex);
    const after = content.slice(textarea.selectionStart);
    const newContent = before + command.insert + after;
    const newCursorPos = slashMenu.startIndex + (command.cursorOffset || command.insert.length);

    onChange(newContent);
    setSlashMenu((prev) => ({ ...prev, isOpen: false }));

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = newCursorPos;
      textarea.selectionEnd = newCursorPos;
    });
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;

        try {
          const dataUrl = await compressImage(file);
          const textarea = textareaRef.current;
          if (!textarea) return;

          const imageMarkdown = `![image](${dataUrl})\n`;
          const { selectionStart } = textarea;
          const newContent =
            content.slice(0, selectionStart) + imageMarkdown + content.slice(selectionStart);
          onChange(newContent);

          requestAnimationFrame(() => {
            textarea.selectionStart = selectionStart + imageMarkdown.length;
            textarea.selectionEnd = selectionStart + imageMarkdown.length;
          });
        } catch (error) {
          console.error('Failed to paste image:', error);
        }
        return;
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    e.preventDefault();

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        try {
          const dataUrl = await compressImage(file);
          const imageMarkdown = `![${file.name}](${dataUrl})\n`;
          onChange(content + imageMarkdown);
        } catch (error) {
          console.error('Failed to drop image:', error);
        }
      }
    }
  };

  return (
    <div className="relative h-full">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        disabled={disabled}
        className="inkpad-editor w-full h-full p-6 bg-transparent resize-none scrollbar-thin focus:outline-none"
        placeholder="Start writing... Type / for commands"
        spellCheck={true}
      />
      <SlashMenu
        isOpen={slashMenu.isOpen}
        position={slashMenu.position}
        query={slashMenu.query}
        onSelect={handleSlashSelect}
        onClose={() => setSlashMenu((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
