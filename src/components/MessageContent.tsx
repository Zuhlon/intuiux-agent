'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import ReactMarkdown from 'react-markdown';

// Инициализация mermaid
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'neutral',
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'basis'
    },
    securityLevel: 'loose'
  });
}

interface MermaidDiagramProps {
  chart: string;
}

function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const render = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
        setError(false);
      } catch {
        setError(true);
      }
    };
    render();
  }, [chart]);

  if (error) {
    return <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto">{chart}</pre>;
  }

  return (
    <div 
      ref={containerRef}
      className="mermaid-diagram my-2 overflow-x-auto bg-white rounded-lg p-2"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps) {
  // Парсим контент на части: текст и mermaid диаграммы
  const parseContent = (text: string) => {
    const parts: Array<{ type: 'text' | 'mermaid'; content: string; key: string }> = [];
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    
    let lastIndex = 0;
    let match;
    let keyIndex = 0;
    
    while ((match = mermaidRegex.exec(text)) !== null) {
      // Текст до mermaid блока
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
          key: `text-${keyIndex++}`
        });
      }
      
      // Mermaid блок
      parts.push({
        type: 'mermaid',
        content: match[1].trim(),
        key: `mermaid-${keyIndex++}`
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Оставшийся текст
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
        key: `text-${keyIndex++}`
      });
    }
    
    return parts.length > 0 ? parts : [{ type: 'text' as const, content: text, key: 'text-0' }];
  };

  const parts = parseContent(content);

  return (
    <div className="message-content">
      {parts.map((part) => (
        part.type === 'mermaid' ? (
          <MermaidDiagram key={part.key} chart={part.content} />
        ) : (
          <div key={part.key} className="prose prose-sm prose-slate max-w-none prose-headings:text-slate-900 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:text-slate-900 prose-table:my-1 prose-th:py-1 prose-td:py-1">
            <ReactMarkdown>
              {part.content}
            </ReactMarkdown>
          </div>
        )
      ))}
    </div>
  );
}
