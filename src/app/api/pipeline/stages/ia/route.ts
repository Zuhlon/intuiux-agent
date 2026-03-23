import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LLM } from '@/lib/zai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, correction } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Missing sessionId' }, { status: 400 });
    }

    // Get session and product type
    const session = await db.pipelineSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    const productType = session.productType || 'landing';

    // Find idea stage
    const ideaStage = await db.pipelineStage.findFirst({
      where: { sessionId, stageName: 'idea' }
    });

    // Find CJM stage if exists
    const cjmStage = await db.pipelineStage.findFirst({
      where: { sessionId, stageName: 'cjm' }
    });

    if (!ideaStage?.outputData) {
      return NextResponse.json({ success: false, error: 'Idea stage not completed' }, { status: 400 });
    }

    const ideaData = JSON.parse(ideaStage.outputData);
    const cjmData = cjmStage?.outputData ? JSON.parse(cjmStage.outputData) : null;

    // Find the IA stage
    const iaStage = await db.pipelineStage.findFirst({
      where: { sessionId, stageName: 'ia' }
    });

    if (!iaStage) {
      return NextResponse.json({ success: false, error: 'IA stage not found' }, { status: 400 });
    }

    await db.pipelineStage.update({
      where: { id: iaStage.id },
      data: {
        status: 'processing',
        startedAt: new Date(),
        inputData: JSON.stringify({ ideaData, cjmData, correction })
      }
    });

    // Generate IA with Mermaid diagram
    const systemPrompt = `Ты — senior information architect. Создай информационную архитектуру продукта типа "${productType}".

Твоя задача — создать СТРУКТУРУ продукта с Mermaid-диаграммами.

Ответь в формате JSON:
{
  "title": "Название продукта",
  "description": "Краткое описание",
  "mainSections": [
    {
      "name": "Название раздела",
      "icon": "emoji",
      "pages": ["Страница 1", "Страница 2"]
    }
  ],
  "navigation": [
    {
      "label": "Пункт меню",
      "url": "/путь",
      "children": []
    }
  ],
  "pages": [
    {
      "name": "Название страницы",
      "url": "/путь",
      "sections": [
        {
          "name": "Секция",
          "components": ["Компонент 1", "Компонент 2"]
        }
      ]
    }
  ],
  "entities": [
    {
      "name": "Сущность",
      "fields": ["поле1", "поле2"]
    }
  ],
  "mermaidSitemap": "flowchart TD\\n    A[Главная] --> B[Каталог]"
}

ВАЖНО: 
- mermaidSitemap должен содержать ПОЛНУЮ Mermaid-диаграмму структуры сайта
- Используй flowchart TD для иерархической структуры
- Включай все основные страницы и разделы
- Добавляй стили для визуального разделения типов страниц

Важно: отвечай ТОЛЬКО валидным JSON.`;

    const userPrompt = correction
      ? `Идея:\n${JSON.stringify(ideaData, null, 2)}\n${cjmData ? `\nCJM:\n${JSON.stringify(cjmData, null, 2)}` : ''}\n\nКорректировка:\n${correction}`
      : `Создай информационную архитектуру для продукта типа "${productType}" на основе:\n\nИдея:\n${JSON.stringify(ideaData, null, 2)}${cjmData ? `\n\nCJM:\n${JSON.stringify(cjmData, null, 2)}` : ''}`;

    const llm = new LLM();
    const response = await llm.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    });

    let iaData;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        iaData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      // Fallback data
      iaData = {
        title: ideaData.title || 'Продукт',
        description: ideaData.description || '',
        mainSections: [],
        navigation: [],
        pages: [],
        entities: [],
        mermaidSitemap: ''
      };
    }

    // Generate enhanced Mermaid diagram
    const mermaidCode = generateEnhancedMermaid(iaData, productType, ideaData.title);

    // Store both the IA data and the enhanced mermaid code
    const outputData = {
      ...iaData,
      mermaidDiagram: mermaidCode
    };

    await db.pipelineStage.update({
      where: { id: iaStage.id },
      data: {
        status: 'completed',
        outputData: JSON.stringify(outputData),
        mermaidCode: mermaidCode,
        completedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: outputData,
      mermaidCode: mermaidCode 
    });

  } catch (error) {
    console.error('IA generation error:', error);
    
    const body = await request.clone().json().catch(() => ({}));
    if (body.sessionId) {
      const iaStage = await db.pipelineStage.findFirst({
        where: { sessionId: body.sessionId, stageName: 'ia' }
      });
      if (iaStage) {
        await db.pipelineStage.update({
          where: { id: iaStage.id },
          data: {
            status: 'error',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create IA' 
    }, { status: 500 });
  }
}

/**
 * Generate enhanced Mermaid diagram for Information Architecture
 */
function generateEnhancedMermaid(
  iaData: {
    title?: string;
    mainSections?: any[];
    navigation?: any[];
    pages?: any[];
    entities?: any[];
    mermaidSitemap?: string;
  },
  productType: string,
  productName: string
): string {
  const lines: string[] = [];
  
  lines.push('```mermaid');
  lines.push('flowchart TD');
  lines.push('');
  
  // Product type colors
  const colors: Record<string, { bg: string; border: string }> = {
    ecommerce: { bg: '#fef3c7', border: '#f59e0b' },
    saas: { bg: '#dbeafe', border: '#3b82f6' },
    b2b: { bg: '#e0e7ff', border: '#6366f1' },
    blog: { bg: '#d1fae5', border: '#10b981' },
    landing: { bg: '#fce7f3', border: '#ec4899' },
    dashboard: { bg: '#cffafe', border: '#06b6d4' },
    booking: { bg: '#fef9c3', border: '#eab308' },
    app: { bg: '#f3e8ff', border: '#a855f7' }
  };
  
  const color = colors[productType] || colors.landing;
  
  // Root node
  const safeName = escapeMermaidText(productName || iaData.title || 'Продукт');
  lines.push(`    root["${safeName}"]`);
  lines.push('');
  
  // If LLM provided sitemap, use it as base and enhance
  if (iaData.mermaidSitemap && iaData.mermaidSitemap.length > 50) {
    // Clean and enhance the provided mermaid
    const cleanedSitemap = iaData.mermaidSitemap
      .replace(/```mermaid\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/flowchart TD\n?/g, '')
      .trim();
    
    lines.push('    %% Структура сайта');
    lines.push(cleanedSitemap);
  } else {
    // Generate from navigation/pages
    const nav = iaData.navigation || [];
    const pages = iaData.pages || [];
    const sections = iaData.mainSections || [];
    
    // Main sections
    if (sections.length > 0) {
      lines.push('    %% Основные разделы');
      sections.forEach((section: any, index: number) => {
        const sectionId = `sec${index}`;
        const sectionName = escapeMermaidText(section.name || `Раздел ${index + 1}`);
        const icon = section.icon || '📁';
        lines.push(`    ${sectionId}["${icon} ${sectionName}"]`);
        lines.push(`    root --> ${sectionId}`);
        
        if (section.pages && section.pages.length > 0) {
          section.pages.forEach((page: string, pageIndex: number) => {
            const pageId = `sec${index}_p${pageIndex}`;
            lines.push(`    ${pageId}["${escapeMermaidText(page)}"]`);
            lines.push(`    ${sectionId} --> ${pageId}`);
          });
        }
      });
      lines.push('');
    }
    
    // Navigation
    if (nav.length > 0) {
      lines.push('    %% Навигация');
      nav.forEach((item: any, index: number) => {
        const navId = `nav${index}`;
        const label = escapeMermaidText(item.label || `Пункт ${index + 1}`);
        lines.push(`    ${navId}["${label}"]`);
        lines.push(`    root --> ${navId}`);
        
        if (item.children && item.children.length > 0) {
          item.children.forEach((child: any, childIndex: number) => {
            const childId = `nav${index}_c${childIndex}`;
            lines.push(`    ${childId}["${escapeMermaidText(child.label || 'Подпункт')}"]`);
            lines.push(`    ${navId} --> ${childId}`);
          });
        }
      });
      lines.push('');
    }
    
    // Pages
    if (pages.length > 0) {
      lines.push('    %% Страницы');
      pages.slice(0, 10).forEach((page: any, index: number) => {
        const pageId = `page${index}`;
        const pageName = escapeMermaidText(page.name || `Страница ${index + 1}`);
        const url = page.url || '/';
        lines.push(`    ${pageId}["${pageName}<br/><small>${url}</small>"]`);
        
        if (sections.length === 0 && nav.length === 0) {
          lines.push(`    root --> ${pageId}`);
        }
        
        // Sections within page
        if (page.sections && page.sections.length > 0) {
          page.sections.slice(0, 3).forEach((section: any, secIndex: number) => {
            const secId = `page${index}_s${secIndex}`;
            lines.push(`    ${secId}["📋 ${escapeMermaidText(section.name || 'Секция')}"]`);
            lines.push(`    ${pageId} --> ${secId}`);
          });
        }
      });
    }
    
    // Entities (ER-like)
    if (iaData.entities && iaData.entities.length > 0) {
      lines.push('');
      lines.push('    %% Сущности данных');
      iaData.entities.slice(0, 5).forEach((entity: any, index: number) => {
        const entityId = `ent${index}`;
        const entityName = escapeMermaidText(entity.name || `Сущность ${index + 1}`);
        const fields = (entity.fields || []).slice(0, 3).map((f: string) => escapeMermaidText(f)).join('<br/>');
        lines.push(`    ${entityId}{{"${entityName}<br/><small>${fields}</small>"}}`);
      });
    }
  }
  
  // Styling
  lines.push('');
  lines.push('    %% Стили');
  lines.push(`    classDef root fill:${color.bg},stroke:${color.border},stroke-width:3px,color:#000`);
  lines.push('    classDef section fill:#f3f4f6,stroke:#6b7280,color:#000');
  lines.push('    classDef page fill:#ffffff,stroke:#d1d5db,color:#000');
  lines.push('    classDef entity fill:#fef3c7,stroke:#f59e0b,color:#000');
  lines.push('');
  lines.push('    class root root');
  
  // Apply styles to section nodes
  const sectionCount = iaData.mainSections?.length || 0;
  for (let i = 0; i < sectionCount; i++) {
    lines.push(`    class sec${i} section`);
  }
  
  // Apply styles to page nodes
  const pageCount = iaData.pages?.length || 0;
  for (let i = 0; i < Math.min(pageCount, 10); i++) {
    lines.push(`    class page${i} page`);
  }
  
  // Apply styles to entity nodes
  const entityCount = iaData.entities?.length || 0;
  for (let i = 0; i < Math.min(entityCount, 5); i++) {
    lines.push(`    class ent${i} entity`);
  }
  
  lines.push('```');
  
  return lines.join('\n');
}

/**
 * Escape special characters for Mermaid
 */
function escapeMermaidText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, ' ')
    .substring(0, 40); // Limit length
}
