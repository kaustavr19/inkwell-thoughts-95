import { parseMarkdown } from './markdown';
import { DrawingStroke } from './storage';

interface ExportOptions {
  title: string;
  content: string;
  drawings: DrawingStroke[];
}

function strokeToSvgPath(stroke: DrawingStroke): string {
  if (stroke.points.length < 2) return '';
  
  let d = `M ${stroke.points[0].x} ${stroke.points[0].y}`;
  
  for (let i = 1; i < stroke.points.length; i++) {
    d += ` L ${stroke.points[i].x} ${stroke.points[i].y}`;
  }
  
  return d;
}

function getStrokeWidth(size: number): number {
  // Size is stored as numeric value in DrawingStroke
  if (size <= 2) return 2;
  if (size <= 4) return 4;
  return 8;
}

function renderDrawingsToSvg(drawings: DrawingStroke[], width: number, height: number): string {
  if (drawings.length === 0) return '';
  
  const paths = drawings.map(stroke => {
    const pathD = strokeToSvgPath(stroke);
    if (!pathD) return '';
    
    const strokeWidth = stroke.size || getStrokeWidth(stroke.size);
    const isHighlighter = stroke.tool === 'highlighter';
    
    return `<path 
      d="${pathD}" 
      stroke="${stroke.color}" 
      stroke-width="${strokeWidth}" 
      fill="none" 
      stroke-linecap="round" 
      stroke-linejoin="round"
      ${isHighlighter ? 'opacity="0.5"' : ''}
    />`;
  }).join('\n');
  
  return `<svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="${width}" 
    height="${height}"
    style="position: absolute; top: 0; left: 0; pointer-events: none;"
  >${paths}</svg>`;
}

export function exportToPdf({ title, content, drawings }: ExportOptions): void {
  const html = parseMarkdown(content);
  
  // Create print window
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Get viewport dimensions for drawings
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  const drawingsSvg = renderDrawingsToSvg(drawings, viewportWidth, viewportHeight);

  const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #121212;
      background: white;
      margin: 0;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    /* Masthead */
    .pdf-header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #121212;
    }
    
    .pdf-title {
      font-size: 28pt;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0 0 0.5rem 0;
    }
    
    .pdf-date {
      font-size: 10pt;
      color: #666;
    }
    
    /* Content styles */
    .pdf-content {
      position: relative;
    }
    
    h1 {
      font-size: 22pt;
      font-weight: 800;
      margin: 1.5em 0 0.5em 0;
      page-break-after: avoid;
    }
    
    h2 {
      font-size: 18pt;
      font-weight: 700;
      margin: 1.2em 0 0.4em 0;
      page-break-after: avoid;
    }
    
    h3 {
      font-size: 14pt;
      font-weight: 700;
      margin: 1em 0 0.3em 0;
      page-break-after: avoid;
    }
    
    h4 {
      font-size: 12pt;
      font-weight: 600;
      margin: 0.8em 0 0.2em 0;
    }
    
    p {
      margin: 0.8em 0;
      orphans: 3;
      widows: 3;
    }
    
    ul, ol {
      margin: 0.8em 0;
      padding-left: 1.5em;
    }
    
    li {
      margin: 0.3em 0;
    }
    
    blockquote {
      margin: 1em 0;
      padding: 0.5em 1em;
      border-left: 3px solid #2F6BFF;
      background: #f8f8f8;
      font-style: italic;
      color: #555;
    }
    
    code {
      font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
      font-size: 9pt;
      background: #f4f4f4;
      padding: 0.1em 0.3em;
      border-radius: 3px;
    }
    
    pre {
      background: #f4f4f4;
      padding: 1em;
      overflow-x: auto;
      border-radius: 6px;
      border: 1px solid #ddd;
      margin: 1em 0;
      page-break-inside: avoid;
    }
    
    pre code {
      background: none;
      padding: 0;
    }
    
    a {
      color: #2F6BFF;
      text-decoration: underline;
    }
    
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1em auto;
      page-break-inside: avoid;
    }
    
    hr {
      border: none;
      border-top: 1px solid #ddd;
      margin: 2em 0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      page-break-inside: avoid;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 0.5em;
      text-align: left;
    }
    
    th {
      background: #f4f4f4;
      font-weight: 600;
    }
    
    /* Checkbox styling */
    input[type="checkbox"] {
      margin-right: 0.5em;
    }
    
    /* Drawings overlay */
    .drawings-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
    }
    
    @media print {
      body {
        padding: 0;
      }
      
      .pdf-header {
        margin-bottom: 1.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="pdf-header">
    <h1 class="pdf-title">${title}</h1>
    <div class="pdf-date">${currentDate}</div>
  </div>
  <div class="pdf-content">
    ${html}
    ${drawings.length > 0 ? `<div class="drawings-container">${drawingsSvg}</div>` : ''}
  </div>
  <script>
    // Auto-trigger print dialog after content loads
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
}
