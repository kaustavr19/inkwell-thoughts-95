import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SlashMenu } from './SlashMenu';
import { SlashCommand, applyFormatting, getKeyboardShortcut } from '@/lib/markdown';
import { compressImage } from '@/lib/storage';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  disabled?: boolean;
}

// List patterns for continuation
const LIST_PATTERNS = {
  bullet: /^(\s*)[-*+]\s+(.*)$/,
  numbered: /^(\s*)(\d+)\.\s+(.*)$/,
  checklist: /^(\s*)- \[([ x])\]\s+(.*)$/,
};

function getListInfo(line: string) {
  const bulletMatch = line.match(LIST_PATTERNS.bullet);
  if (bulletMatch) {
    return {
      type: 'bullet' as const,
      indent: bulletMatch[1],
      content: bulletMatch[2],
      prefix: `${bulletMatch[1]}- `,
    };
  }

  const numberedMatch = line.match(LIST_PATTERNS.numbered);
  if (numberedMatch) {
    const nextNum = parseInt(numberedMatch[2], 10) + 1;
    return {
      type: 'numbered' as const,
      indent: numberedMatch[1],
      content: numberedMatch[3],
      prefix: `${numberedMatch[1]}${nextNum}. `,
    };
  }

  const checklistMatch = line.match(LIST_PATTERNS.checklist);
  if (checklistMatch) {
    return {
      type: 'checklist' as const,
      indent: checklistMatch[1],
      content: checklistMatch[3],
      prefix: `${checklistMatch[1]}- [ ] `,
    };
  }

  return null;
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

  // Bottom dock height + buffer for caret safety
  const DOCK_CLEARANCE = 100;

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

  // Ensure caret stays visible above bottom dock
  const ensureCaretVisible = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Get caret position relative to viewport
    const { selectionStart } = textarea;
    const textBefore = textarea.value.slice(0, selectionStart);
    const lines = textBefore.split('\n');
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 28;
    const paddingTop = parseFloat(getComputedStyle(textarea).paddingTop);
    
    const caretLineIndex = lines.length - 1;
    const caretY = paddingTop + (caretLineIndex * lineHeight);
    
    // Get textarea's position and scroll container
    const rect = textarea.getBoundingClientRect();
    const scrollContainer = textarea.closest('.overflow-auto') || textarea.parentElement;
    if (!scrollContainer) return;
    
    const containerRect = scrollContainer.getBoundingClientRect();
    const dockTop = window.innerHeight - DOCK_CLEARANCE;
    
    // Calculate where caret is in viewport
    const caretViewportY = rect.top + caretY - textarea.scrollTop;
    
    // If caret would be hidden behind dock, scroll the container
    if (caretViewportY > dockTop) {
      const scrollAmount = caretViewportY - dockTop + 20;
      scrollContainer.scrollTop += scrollAmount;
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const { selectionStart } = e.target;

    onChange(newContent);

    // Ensure caret stays visible
    requestAnimationFrame(ensureCaretVisible);

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

    // Handle Enter for list continuation
    if (e.key === 'Enter' && !e.shiftKey) {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart, selectionEnd } = textarea;
      if (selectionStart !== selectionEnd) return; // Don't handle with selection

      const lines = content.slice(0, selectionStart).split('\n');
      const currentLine = lines[lines.length - 1];
      const listInfo = getListInfo(currentLine);

      if (listInfo) {
        e.preventDefault();

        // Check if current list item is empty (just the prefix)
        if (listInfo.content.trim() === '') {
          // Exit list mode - remove the prefix and insert blank line
          const beforeLine = content.slice(0, selectionStart - currentLine.length);
          const afterCursor = content.slice(selectionStart);
          const newContent = beforeLine + '\n' + afterCursor;
          const newCursorPos = beforeLine.length + 1;

          onChange(newContent);
          requestAnimationFrame(() => {
            textarea.selectionStart = newCursorPos;
            textarea.selectionEnd = newCursorPos;
          });
        } else {
          // Continue list with new item
          const before = content.slice(0, selectionStart);
          const after = content.slice(selectionStart);
          const newContent = before + '\n' + listInfo.prefix + after;
          const newCursorPos = selectionStart + 1 + listInfo.prefix.length;

          onChange(newContent);
          requestAnimationFrame(() => {
            textarea.selectionStart = newCursorPos;
            textarea.selectionEnd = newCursorPos;
          });
        }
        return;
      }
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

    // Handle Tab for indent/outdent in lists
    if (e.key === 'Tab') {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart } = textarea;
      const lines = content.slice(0, selectionStart).split('\n');
      const currentLine = lines[lines.length - 1];
      const listInfo = getListInfo(currentLine);

      if (listInfo) {
        e.preventDefault();
        const lineStart = selectionStart - currentLine.length;

        if (e.shiftKey) {
          // Outdent - remove up to 2 spaces from start
          const spacesToRemove = Math.min(2, listInfo.indent.length);
          if (spacesToRemove > 0) {
            const newContent = content.slice(0, lineStart) + currentLine.slice(spacesToRemove) + content.slice(selectionStart);
            onChange(newContent);
            requestAnimationFrame(() => {
              textarea.selectionStart = selectionStart - spacesToRemove;
              textarea.selectionEnd = selectionStart - spacesToRemove;
            });
          }
        } else {
          // Indent - add 2 spaces
          const newContent = content.slice(0, lineStart) + '  ' + currentLine + content.slice(selectionStart);
          onChange(newContent);
          requestAnimationFrame(() => {
            textarea.selectionStart = selectionStart + 2;
            textarea.selectionEnd = selectionStart + 2;
          });
        }
        return;
      }

      // Regular tab behavior for non-list content
      e.preventDefault();
      const newContent = content.slice(0, selectionStart) + '  ' + content.slice(textarea.selectionEnd);
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
