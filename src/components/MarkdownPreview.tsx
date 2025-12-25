import React, { useMemo } from 'react';
import { parseMarkdown } from '@/lib/markdown';

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const html = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div className="h-full overflow-auto p-6 scrollbar-thin">
      <article
        className="inkpad-preview"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
