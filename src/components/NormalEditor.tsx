import React, { useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import { RichTextToolbar } from './RichTextToolbar';
import { htmlToMarkdown, markdownToHtml } from '@/lib/markdownConverter';

interface NormalEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  disabled?: boolean;
}

export function NormalEditor({ content, onChange, disabled = false }: NormalEditorProps) {
  const isUpdatingFromExternalRef = useRef(false);
  const lastMarkdownRef = useRef(content);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'highlight',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'tiptap-table',
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: 'Start writing... Type "/" for commands',
      }),
    ],
    content: markdownToHtml(content),
    editable: !disabled,
    editorProps: {
      attributes: {
        class: 'inkpad-preview tiptap-editor outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      if (isUpdatingFromExternalRef.current) return;
      
      // Debounce conversion to markdown
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      debounceTimeoutRef.current = setTimeout(() => {
        const html = editor.getHTML();
        const markdown = htmlToMarkdown(html);
        
        if (markdown !== lastMarkdownRef.current) {
          lastMarkdownRef.current = markdown;
          onChange(markdown);
        }
      }, 150);
    },
  });

  // Sync external content changes to editor
  useEffect(() => {
    if (!editor) return;
    
    // Only update if the content actually differs
    if (content !== lastMarkdownRef.current) {
      isUpdatingFromExternalRef.current = true;
      lastMarkdownRef.current = content;
      
      const html = markdownToHtml(content);
      editor.commands.setContent(html, { emitUpdate: false });
      
      // Reset flag after a tick
      setTimeout(() => {
        isUpdatingFromExternalRef.current = false;
      }, 0);
    }
  }, [content, editor]);

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  if (!editor) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Floating toolbar */}
      <RichTextToolbar editor={editor} />
      
      {/* Editor content */}
      <div className="flex-1 overflow-auto p-6 scrollbar-thin">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
