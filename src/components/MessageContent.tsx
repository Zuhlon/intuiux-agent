'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import ReactMarkdown from 'react-markdown';
import { Search, User, MapPin, AlertTriangle, Lightbulb, Heart } from 'lucide-react';

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

// Role color configuration for CJM
const ROLE_CONFIG: Record<string, { color: string; bgColor: string; borderColor: string; icon: typeof User; label: string }> = {
  persona: {
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: User,
    label: 'Персона'
  },
  touchpoint: {
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    icon: MapPin,
    label: 'Touchpoint'
  },
  pain: {
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: AlertTriangle,
    label: 'Боль'
  },
  opportunity: {
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: Lightbulb,
    label: 'Возможность'
  },
  emotion: {
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: Heart,
    label: 'Эмоция'
  }
};

// Parse and render role-tagged content
function parseRoleTags(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\[:role:(\w+)\]([\s\S]*?)\[\/role\]/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const roleType = match[1];
    const content = match[2];
    const config = ROLE_CONFIG[roleType] || ROLE_CONFIG.persona;
    const IconComponent = config.icon;

    parts.push(
      <span
        key={`role-${key++}`}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${config.bgColor} ${config.color} border ${config.borderColor} text-sm font-medium`}
      >
        <IconComponent className="w-3 h-3" />
        <span dangerouslySetInnerHTML={{ __html: content }} />
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
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
    return <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto">{chart}</pre>
  }

  return (
    <div 
      ref={containerRef}
      className="mermaid-diagram my-2 overflow-x-auto bg-white rounded-lg p-2"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

interface MessageContentProps {
  content: string;
  stageId?: string;
  zoomLevel?: number;
}

export function MessageContent({ content, stageId }: MessageContentProps) {
  const hasSearchPerformed = stageId === 'competitors' && content.includes('"searchPerformed": true');
  const isCJM = stageId === 'cjm';

  const parseContent = (text: string) => {
    const parts: Array<{ type: 'text' | 'mermaid'; content: string; key: string }> = [];
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    
    let lastIndex = 0;
    let match;
    let keyIndex = 0;
    
    while ((match = mermaidRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
          key: `text-${keyIndex++}`
        });
      }
      
      parts.push({
        type: 'mermaid',
        content: match[1].trim(),
        key: `mermaid-${keyIndex++}`
      });
      
      lastIndex = match.index + match[0].length;
    }
    
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

  // Custom text renderer that parses role tags
  const renderTextWithRoles = (text: string) => {
    if (!text.includes('[:role:')) {
      return <ReactMarkdown>{text}</ReactMarkdown>;
    }

    // For CJM content with role tags, we need custom rendering
    // Split by role tags and render each part
    const lines = text.split('\n');
    return (
      <div className="prose prose-sm prose-slate max-w-none prose-headings:text-slate-900 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:text-slate-900 prose-table:my-1 prose-th:py-1 prose-td:py-1">
        {lines.map((line, idx) => {
          if (line.includes('[:role:')) {
            // Parse and render role tags in this line
            const parsedParts = parseRoleTags(line);
            return <p key={idx} className="my-1">{parsedParts}</p>;
          }
          // Use ReactMarkdown for lines without role tags
          return <ReactMarkdown key={idx}>{line}</ReactMarkdown>;
        })}
      </div>
    );
  };

  return (
    <div className="message-content">
      {/* CJM Legend */}
      {isCJM && content.includes('[:role:') && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs font-medium text-slate-600 mb-2">Цветовая кодировка ролей:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(ROLE_CONFIG).map(([key, config]) => {
              const IconComponent = config.icon;
              return (
                <span
                  key={key}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded ${config.bgColor} ${config.color} border ${config.borderColor} text-xs`}
                >
                  <IconComponent className="w-3 h-3" />
                  {config.label}
                </span>
              );
            })}
          </div>
        </div>
      )}
      {hasSearchPerformed && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-200/30">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">Веб-поиск конкурентов</span>
          </div>
        </div>
      )}
      {parts.map((part) => (
        part.type === 'mermaid' ? (
          <MermaidDiagram key={part.key} chart={part.content} />
        ) : isCJM && part.content.includes('[:role:') ? (
          <div key={part.key}>
            {renderTextWithRoles(part.content)}
          </div>
        ) : (
          <div key={part.key} className="prose prose-sm prose-slate max-w-none prose-headings:text-slate-900 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:text-slate-900 prose-table:my-1 prose-th:py-1 prose-td:py-1">
            <ReactMarkdown>
              {part.content}
            </ReactMarkdown>
          </div>
        )
      ))}
    </div>
  )
}