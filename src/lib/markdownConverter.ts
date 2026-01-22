import TurndownService from 'turndown';
import { parseMarkdown } from './markdown';
// Initialize turndown for HTML -> Markdown conversion
const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**',
});

// Add table support for turndown
turndown.addRule('table', {
  filter: 'table',
  replacement: function (content, node) {
    const table = node as HTMLTableElement;
    const rows: string[][] = [];
    
    // Gather all rows
    table.querySelectorAll('tr').forEach((tr) => {
      const cells: string[] = [];
      tr.querySelectorAll('th, td').forEach((cell) => {
        cells.push(cell.textContent?.trim() || '');
      });
      if (cells.length > 0) {
        rows.push(cells);
      }
    });

    if (rows.length === 0) return '';

    const colCount = Math.max(...rows.map(r => r.length));
    const colWidths = Array(colCount).fill(3);

    // Calculate column widths
    rows.forEach(row => {
      row.forEach((cell, i) => {
        colWidths[i] = Math.max(colWidths[i], cell.length);
      });
    });

    // Build markdown table
    let markdown = '';
    rows.forEach((row, rowIndex) => {
      const cells = row.map((cell, i) => cell.padEnd(colWidths[i]));
      while (cells.length < colCount) {
        cells.push(' '.repeat(colWidths[cells.length]));
      }
      markdown += '| ' + cells.join(' | ') + ' |\n';
      
      // Add separator after first row (header)
      if (rowIndex === 0) {
        const separator = colWidths.map(w => '-'.repeat(w)).join(' | ');
        markdown += '| ' + separator + ' |\n';
      }
    });

    return '\n' + markdown + '\n';
  }
});

// Handle underline
turndown.addRule('underline', {
  filter: 'u',
  replacement: function (content) {
    return '<u>' + content + '</u>';
  }
});

// Handle strikethrough
turndown.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: function (content) {
    return '~~' + content + '~~';
  }
});

// Handle text color spans
turndown.addRule('textColor', {
  filter: function (node) {
    return (
      node.nodeName === 'SPAN' &&
      (node as HTMLElement).style.color !== ''
    );
  },
  replacement: function (content, node) {
    const color = (node as HTMLElement).style.color;
    // Convert rgb to hex if needed
    const hexColor = rgbToHex(color) || color;
    return `<span style="color:${hexColor}">${content}</span>`;
  }
});

// Handle highlight/mark
turndown.addRule('highlight', {
  filter: 'mark',
  replacement: function (content, node) {
    const bg = (node as HTMLElement).style.backgroundColor || (node as HTMLElement).getAttribute('data-color') || 'yellow';
    return `<mark style="background:${bg}">${content}</mark>`;
  }
});

// Handle task lists
turndown.addRule('taskListItem', {
  filter: function (node) {
    return (
      node.nodeName === 'LI' &&
      (node as HTMLElement).hasAttribute('data-type') &&
      (node as HTMLElement).getAttribute('data-type') === 'taskItem'
    );
  },
  replacement: function (content, node) {
    const checked = (node as HTMLElement).getAttribute('data-checked') === 'true';
    return `- [${checked ? 'x' : ' '}] ${content.trim()}\n`;
  }
});

// Utility: Convert RGB to hex
function rgbToHex(rgb: string): string | null {
  if (!rgb) return null;
  if (rgb.startsWith('#')) return rgb;
  
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return null;
  
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  
  return `#${r}${g}${b}`;
}

/**
 * Convert HTML from TipTap editor to Markdown
 */
export function htmlToMarkdown(html: string): string {
  if (!html || html === '<p></p>') return '';
  return turndown.turndown(html);
}

/**
 * Parse markdown to HTML for TipTap consumption
 * This uses marked under the hood for consistency
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '<p></p>';
  return parseMarkdown(markdown);
}

// Color palettes for the editor toolbar
export const TEXT_COLORS = [
  { name: 'Default', color: null },
  { name: 'Black', color: '#121212' },
  { name: 'Blue', color: '#2F6BFF' },
  { name: 'Red', color: '#FF3B3B' },
  { name: 'Green', color: '#14B85A' },
];

export const HIGHLIGHT_COLORS = [
  { name: 'None', color: null },
  { name: 'Yellow', color: 'rgba(255, 235, 59, 0.35)' },
  { name: 'Green', color: 'rgba(57, 255, 20, 0.30)' },
  { name: 'Pink', color: 'rgba(255, 20, 147, 0.28)' },
  { name: 'Orange', color: 'rgba(255, 145, 0, 0.30)' },
  { name: 'Blue', color: 'rgba(0, 183, 255, 0.28)' },
];
