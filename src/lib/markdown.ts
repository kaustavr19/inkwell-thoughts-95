import { marked } from 'marked';

// Configure marked for GFM (GitHub Flavored Markdown)
marked.setOptions({
  gfm: true,
  breaks: true,
});

export function parseMarkdown(content: string): string {
  try {
    return marked.parse(content) as string;
  } catch (error) {
    console.error('Markdown parsing error:', error);
    return content;
  }
}

export interface SlashCommand {
  id: string;
  label: string;
  shortcut: string;
  category: 'block' | 'inline';
  insert: string;
  cursorOffset?: number;
}

export const slashCommands: SlashCommand[] = [
  // Blocks
  { id: 'h1', label: 'Heading 1', shortcut: '/h1', category: 'block', insert: '# ', cursorOffset: 2 },
  { id: 'h2', label: 'Heading 2', shortcut: '/h2', category: 'block', insert: '## ', cursorOffset: 3 },
  { id: 'h3', label: 'Heading 3', shortcut: '/h3', category: 'block', insert: '### ', cursorOffset: 4 },
  { id: 'quote', label: 'Quote', shortcut: '/quote', category: 'block', insert: '> ', cursorOffset: 2 },
  { id: 'divider', label: 'Divider', shortcut: '/divider', category: 'block', insert: '\n---\n', cursorOffset: 5 },
  { id: 'bullets', label: 'Bullet List', shortcut: '/bullets', category: 'block', insert: '- ', cursorOffset: 2 },
  { id: 'numbered', label: 'Numbered List', shortcut: '/numbered', category: 'block', insert: '1. ', cursorOffset: 3 },
  { id: 'checklist', label: 'Checklist', shortcut: '/checklist', category: 'block', insert: '- [ ] ', cursorOffset: 6 },
  { id: 'codeblock', label: 'Code Block', shortcut: '/codeblock', category: 'block', insert: '```\n\n```', cursorOffset: 4 },
  
  // Inline
  { id: 'bold', label: 'Bold', shortcut: '/bold', category: 'inline', insert: '****', cursorOffset: 2 },
  { id: 'italic', label: 'Italic', shortcut: '/italic', category: 'inline', insert: '**', cursorOffset: 1 },
  { id: 'link', label: 'Link', shortcut: '/link', category: 'inline', insert: '[text](url)', cursorOffset: 1 },
  { id: 'inlinecode', label: 'Inline Code', shortcut: '/inlinecode', category: 'inline', insert: '``', cursorOffset: 1 },
];

export function filterCommands(query: string): SlashCommand[] {
  const lowerQuery = query.toLowerCase();
  return slashCommands.filter(
    (cmd) =>
      cmd.id.includes(lowerQuery) ||
      cmd.label.toLowerCase().includes(lowerQuery) ||
      cmd.shortcut.toLowerCase().includes(lowerQuery)
  );
}

export function getKeyboardShortcut(e: KeyboardEvent): string | null {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifier = isMac ? e.metaKey : e.ctrlKey;

  if (modifier && e.key === 'b') return 'bold';
  if (modifier && e.key === 'i') return 'italic';
  if (modifier && e.key === 'u') return 'underline';
  if (modifier && e.key === 'k') return 'link';
  if (modifier && e.shiftKey && e.key === 'C') return 'code';

  return null;
}

export function applyFormatting(
  content: string,
  selectionStart: number,
  selectionEnd: number,
  format: string
): { newContent: string; newCursorPos: number } {
  const before = content.slice(0, selectionStart);
  const selected = content.slice(selectionStart, selectionEnd);
  const after = content.slice(selectionEnd);

  let wrapped: string;
  let cursorOffset: number;

  switch (format) {
    case 'bold':
      wrapped = `**${selected || 'text'}**`;
      cursorOffset = selected ? wrapped.length : 2;
      break;
    case 'italic':
      wrapped = `*${selected || 'text'}*`;
      cursorOffset = selected ? wrapped.length : 1;
      break;
    case 'underline':
      wrapped = `<u>${selected || 'text'}</u>`;
      cursorOffset = selected ? wrapped.length : 3;
      break;
    case 'link':
      wrapped = `[${selected || 'text'}](url)`;
      cursorOffset = selected ? wrapped.length - 5 : 1;
      break;
    case 'code':
      wrapped = `\`${selected || 'code'}\``;
      cursorOffset = selected ? wrapped.length : 1;
      break;
    default:
      return { newContent: content, newCursorPos: selectionEnd };
  }

  return {
    newContent: before + wrapped + after,
    newCursorPos: selectionStart + cursorOffset,
  };
}
