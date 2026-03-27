'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Инициализация mermaid
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

interface MermaidRendererProps {
  chart: string;
  className?: string;
}

export function MermaidRenderer({ chart, className = '' }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      try {
        // Генерируем уникальный ID
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        
        // Рендерим диаграмму
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
        setError(null);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError('Ошибка рендеринга диаграммы');
      }
    };

    if (chart) {
      renderChart();
    }
  }, [chart]);

  if (error) {
    return (
      <div className={`p-4 bg-red-50 text-red-600 rounded-lg text-sm ${className}`}>
        {error}
        <pre className="mt-2 text-xs overflow-auto">{chart}</pre>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`mermaid-container overflow-x-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// Компонент для рендеринга контента с Mermaid
interface ContentWithMermaidProps {
  content: string;
  className?: string;
}

export function ContentWithMermaid({ content, className = '' }: ContentWithMermaidProps) {
  // Парсим контент и находим блоки mermaid
  const parseContent = (text: string) => {
    const parts: Array<{ type: 'text' | 'mermaid'; content: string }> = [];
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    
    let lastIndex = 0;
    let match;
    
    while ((match = mermaidRegex.exec(text)) !== null) {
      // Добавляем текст до mermaid блока
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }
      
      // Добавляем mermaid блок
      parts.push({
        type: 'mermaid',
        content: match[1].trim()
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Добавляем оставшийся текст
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }
    
    return parts.length > 0 ? parts : [{ type: 'text' as const, content: text }];
  };

  const parts = parseContent(content);

  return (
    <div className={className}>
      {parts.map((part, index) => (
        part.type === 'mermaid' ? (
          <MermaidRenderer key={index} chart={part.content} className="my-3" />
        ) : (
          <span key={index}>{part.content}</span>
        )
      ))}
    </div>
  );
}
