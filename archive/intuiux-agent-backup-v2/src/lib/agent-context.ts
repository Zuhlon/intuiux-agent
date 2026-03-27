// Agent Context System - Smart extraction from transcription dialogs
// Each agent receives artifacts from previous agents

export interface AgentContext {
  // Source transcription
  sourceText: string;
  
  // Artifacts from previous stages
  artifacts: {
    idea?: {
      name: string;
      description: string;
      functions: string[];
      useCases: string[];
      userTypes: string;
      valueProposition: string;
      risks: string[];
      difficulties: string[];
    };
    competitors?: {
      directCompetitors: Array<{
        name: string;
        description: string;
        features: string[];
        pricing: string;
        strengths: string[];
        weaknesses: string[];
      }>;
      indirectCompetitors: Array<{
        name: string;
        description: string;
        approach: string;
      }>;
      marketTrends: string[];
      differentiationOpportunities: string[];
    };
    cjm?: {
      stages: Array<{
        name: string;
        actions: string[];
        emotions: string[];
        painPoints: string[];
        opportunities: string[];
      }>;
      mermaidDiagram: string;
    };
    ia?: {
      pages: Array<{
        name: string;
        url: string;
        purpose: string;
        dataElements: string[];
        connections: string[];
      }>;
      mermaidDiagram: string;
      entities: string[];
    };
    userflow?: {
      scenarios: Array<{
        name: string;
        steps: string[];
        mermaidDiagram: string;
      }>;
    };
    prototype?: {
      html: string;
      screens: string[];
    };
  };
}

/**
 * SMART EXTRACTION FROM DIALOG TRANSCRIPTS
 * Extracts meaningful data from conversation format: "Name: text"
 */
export function extractIdeaFromTranscription(sourceText: string): AgentContext['artifacts']['idea'] {
  console.log('[extractIdeaFromTranscription] === SMART DIALOG EXTRACTION START ===');
  
  // Split into dialog lines
  const lines = sourceText.split('\n').filter(l => l.trim());
  const dialogBlocks: { speaker: string; text: string }[] = [];
  
  // Parse dialog format "Speaker: text"
  // Note: Character class must have Latin (65-90) before Cyrillic (1040-1103) to avoid range error
  for (const line of lines) {
    const match = line.match(/^([A-ZА-ЯЁ][a-zA-Za-яё]+):\s*(.+)$/);
    if (match) {
      dialogBlocks.push({ speaker: match[1], text: match[2] });
    } else if (dialogBlocks.length > 0) {
      // Append to last block if no speaker
      dialogBlocks[dialogBlocks.length - 1].text += ' ' + line;
    }
  }
  
  // Combine all text for analysis
  const fullText = dialogBlocks.map(b => b.text).join(' ');
  const lowerText = fullText.toLowerCase();
  
  // === 1. EXTRACT PRODUCT NAME ===
  let name = '';
  
  // Look for quoted names or "это" definitions
  const namePatterns = [
    /«([^»]{2,30})»/,
    /"([^"]{2,30})"/,
    /«([^»]{2,30})/,
    // Use [^.]+ instead of [—.] to avoid "Range out of order" error
    /—\s*это\s+([^.]{5,50})/,
    /называет?ся\s+«?([^«»\n.]+?)(?:\s|$)/,
  ];
  
  for (const pattern of namePatterns) {
    const match = fullText.match(pattern);
    if (match) {
      const candidate = match[1]?.trim();
      if (candidate && candidate.length > 2 && !candidate.includes('это')) {
        name = candidate.replace(/^["«»]+|["«»]+$/g, '');
        console.log(`[extractIdeaFromTranscription] Name found: "${name}"`);
        break;
      }
    }
  }
  
  // === 2. EXTRACT DESCRIPTION ===
  let description = '';
  
  // Look for "это" definitions or mission statements
  const descPatterns = [
    /—\s*это\s+([^.]{20,200})\.?/i,
    /наша миссия\s*—\s*([^.]{20,200})\.?/i,
    /мы пишем\s+([^.]{20,200})\.?/i,
    /продукт[^.]*\s+([^.]{20,200})\.?/i,
  ];
  
  for (const pattern of descPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      description = match[1]?.trim() || '';
      if (description.length > 15) {
        console.log(`[extractIdeaFromTranscription] Description found: "${description.substring(0, 50)}..."`);
        break;
      }
    }
  }
  
  // === 3. EXTRACT FUNCTIONS FROM LISTS ===
  const functions: string[] = [];
  
  // Look for enumerated lists with numbers or bullets
  // Note: Character class must have Latin before Cyrillic to avoid range error
  const listPatterns = [
    /(?:функции|возможности|инструменты|что.*даем)[^:]*:?\s*([\s\S]*?)(?=(?:целевая|аудитория|конкуренты|риски|$))/i,
    /\d+\.\s*([A-Za-zА-Яа-яЁё\s]{5,80})/g,
    // Use (?:—|-|•) instead of [-—•] to avoid "Range out of order" error
    /(?:—|-|•)\s*([A-Za-zА-Яа-яЁё\s]{5,80})/g,
  ];
  
  // Find "ключевые функции" section
  const funcSectionMatch = sourceText.match(/ключевые функции[^:]*:([\s\S]*?)(?=целевая|$)/i);
  if (funcSectionMatch) {
    const funcText = funcSectionMatch[1];
    // Use (?:—|-|•|\d) instead of [-—•\d] to avoid "Range out of order" error
    const funcLines = funcText.match(/(?:—|-|•|\d+)\.?\s*([^\n]+)/g);
    if (funcLines) {
      for (const line of funcLines) {
        const cleaned = line.replace(/^(?:—|-|•|\d+)\.?\s*/, '').trim();
        if (cleaned.length > 5 && cleaned.length < 100) {
          functions.push(cleaned);
        }
      }
    }
  }
  
  // Extract from dialog - look for "что можем дать", "какие инструменты"
  if (functions.length === 0) {
    for (const block of dialogBlocks) {
      if (/что (можем|полезного)|инструменты|функции/i.test(block.text)) {
        // Next block or same block should contain list
        const textToSearch = block.text;
        // Use (?:—|-) instead of [—-] to avoid "Range out of order" error
        // Use [^\n] instead of [^—\n] to avoid character class issues
        const items = textToSearch.match(/(?:—|-)\s*([^\n]{5,80})/g);
        if (items) {
          for (const item of items) {
            const cleaned = item.replace(/^(?:—|-)\s*/, '').trim();
            if (cleaned.length > 5 && !cleaned.startsWith('это')) {
              functions.push(cleaned);
            }
          }
        }
      }
    }
  }
  
  // Extract specific mentioned features
  const featureKeywords = ['калькуляторы', 'шаблоны', 'кейсы', 'интервью', 'аналитика', 'подписка', 'форум', 'чат', 'видео', 'подкаст', 'статьи', 'обзоры'];
  for (const keyword of featureKeywords) {
    if (lowerText.includes(keyword) && !functions.some(f => f.toLowerCase().includes(keyword))) {
      // Find context around keyword
      const regex = new RegExp(`[^.]*${keyword}[^.]*\\.`, 'i');
      const match = fullText.match(regex);
      if (match) {
        functions.push(keyword.charAt(0).toUpperCase() + keyword.slice(1) + ' — ' + match[0].trim().substring(0, 60));
      } else {
        functions.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    }
  }
  
  console.log(`[extractIdeaFromTranscription] Functions found: ${functions.length}`);
  
  // === 4. EXTRACT TARGET AUDIENCE ===
  let userTypes = '';
  
  // Look for audience mentions
  const audiencePatterns = [
    /аудитори[яи][^:]*:?\s*([\s\S]*?)(?=(?:монетиз|сколько|технолог|$))/i,
    /кто\s+(?:наша\s+)?аудитори[яи]/i,
    /чита[ею]т[^.]*\./i,
  ];
  
  for (const pattern of audiencePatterns) {
    const match = fullText.match(pattern);
    if (match) {
      const text = match[1] || match[0];
      // Extract audience segments
      const segments: string[] = [];
      
      // Look for numbered or bulleted audience segments
      // Use (?:—|-) instead of [—-] to avoid "Range out of order" error
      const segMatches = text.match(/(?:\d+|(?:—|-))\s*([А-Яа-я\s]{10,80})/g);
      if (segMatches) {
        for (const seg of segMatches) {
          const cleaned = seg.replace(/^(?:\d+|(?:—|-))\s*/, '').trim();
          if (cleaned.length > 5) {
            segments.push(cleaned);
          }
        }
      }
      
      if (segments.length > 0) {
        userTypes = segments.join('\n');
        break;
      }
    }
  }
  
  // Look for "ядро" mentions (core audience)
  if (!userTypes) {
    const coreMatch = fullText.match(/ядр[ао][^:]*:?\s*([\s\S]*?)(?=(?:виктория|монетиз|$))/i);
    if (coreMatch) {
      userTypes = coreMatch[1].trim().substring(0, 300);
    }
  }
  
  // Check for audience section at end of transcript
  if (!userTypes) {
    const audienceSection = sourceText.match(/целевая аудитория[^:]*:([\s\S]*?)(?=(?:получил|итого|$))/i);
    if (audienceSection) {
      userTypes = audienceSection[1].trim().substring(0, 300);
    }
  }
  
  console.log(`[extractIdeaFromTranscription] User types found: ${userTypes ? 'yes' : 'no'}`);
  
  // === 5. EXTRACT VALUE PROPOSITION ===
  let valueProposition = '';
  
  // Look for "преимущество", "фишка", "чем отличаемся"
  const valuePatterns = [
    /наше преимущество\s*—?\s*([^.]{10,150})\.?/i,
    /фишка\s*—?\s*([^.]{10,150})\.?/i,
    /чем отличаемся[^:]*:?\s*([^.]{10,150})\.?/i,
    /почему\s+(?:мы|люди)[^.]{5,50}([^.]{10,150})\.?/i,
  ];
  
  for (const pattern of valuePatterns) {
    const match = fullText.match(pattern);
    if (match) {
      valueProposition = match[1]?.trim() || '';
      if (valueProposition.length > 10) {
        break;
      }
    }
  }
  
  // Extract from "наше преимущество"
  if (!valueProposition) {
    const advMatch = fullText.match(/преимущество[^—]*—\s*([^.]+)/i);
    if (advMatch) {
      valueProposition = advMatch[1].trim();
    }
  }
  
  console.log(`[extractIdeaFromTranscription] Value proposition found: ${valueProposition ? 'yes' : 'no'}`);
  
  // === 6. EXTRACT USE CASES ===
  const useCases: string[] = [];
  
  // Look for scenarios in the text
  const scenarioPatterns = [
    /сценари[ий][^:]*:?\s*([\s\S]*?)(?=(?:риски|$))/i,
    /люди\s+(?:хотят|ищут)\s+([^.]+)/gi,
    /пользователь\s+([^.]+)/gi,
  ];
  
  for (const pattern of scenarioPatterns) {
    const matches = fullText.matchAll(new RegExp(pattern.source, pattern.flags));
    for (const match of matches) {
      const extracted = match[1]?.trim();
      if (extracted && extracted.length > 10 && extracted.length < 150) {
        useCases.push(extracted);
      }
    }
  }
  
  // Look for "люди хотят" type phrases
  const wantPatterns = [
    /люди\s+(?:устали|хотят|ищут)\s+([^.]+)/gi,
    /читател[иь]\s+([^.]+)/gi,
  ];
  
  for (const pattern of wantPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      useCases.push(match[0].trim());
    }
  }
  
  console.log(`[extractIdeaFromTranscription] Use cases found: ${useCases.length}`);
  
  // === 7. EXTRACT RISKS ===
  const risks: string[] = [];
  
  // Look for risk-related phrases
  const riskPatterns = [
    /риск[^:]*:?\s*([^.]{10,100})\.?/gi,
    /проблем[аы][^:]*:?\s*([^.]{10,100})\.?/gi,
    /рискованно[^.]*\.?/gi,
    /может не[^.]*\.?/gi,
    /опасени[яе][^:]*:?\s*([^.]{10,100})\.?/gi,
  ];
  
  for (const pattern of riskPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      risks.push(match[0].trim().substring(0, 100));
    }
  }
  
  // Look for explicit risk mentions in dialog
  for (const block of dialogBlocks) {
    if (/риск|проблем|опас|сложн/i.test(block.text)) {
      risks.push(block.text.trim().substring(0, 100));
    }
  }
  
  console.log(`[extractIdeaFromTranscription] Risks found: ${risks.length}`);
  
  // === 8. EXTRACT DIFFICULTIES ===
  const difficulties: string[] = [];
  
  const diffPatterns = [
    /трудност[^:]*:?\s*([^.]{10,100})\.?/gi,
    /сложност[^:]*:?\s*([^.]{10,100})\.?/gi,
    /нужно\s+([^.]{10,100})\.?/gi,
    /стоит\s+([^.]{10,100})\.?/gi,
  ];
  
  for (const pattern of diffPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      difficulties.push(match[0].trim().substring(0, 100));
    }
  }
  
  // Look for cost/development mentions
  const costMatch = fullText.match(/стоит[^.]*\d+[^\d.]*\d*[^.]*\./i);
  if (costMatch) {
    difficulties.push(costMatch[0].trim());
  }
  
  console.log(`[extractIdeaFromTranscription] Difficulties found: ${difficulties.length}`);
  console.log('[extractIdeaFromTranscription] === EXTRACTION END ===');
  
  return {
    name: name || 'Продукт из транскрипции',
    description: description || `Продукт, описанный в транскрипции`,
    functions: [...new Set(functions)].slice(0, 8),
    useCases: [...new Set(useCases)].slice(0, 5),
    userTypes: userTypes || '',
    valueProposition: valueProposition || '',
    risks: [...new Set(risks)].slice(0, 5),
    difficulties: [...new Set(difficulties)].slice(0, 5),
  };
}

/**
 * Format extracted idea as markdown with product analysis
 */
export function formatIdeaAsMarkdown(idea: NonNullable<AgentContext['artifacts']['idea']>): string {
  return `## 💡 Название идеи
**${idea.name}**

### Описание сути
${idea.description}

### Use Cases (Сценарии использования)
${idea.useCases.length > 0 
  ? idea.useCases.map((u, i) => `${i + 1}. ${u}`).join('\n')
  : '*Не указаны в транскрипции*'}

### Целевая аудитория и типы пользователей
${idea.userTypes || '*Не указана в транскрипции*'}

### Ключевая ценность (Value Proposition)
${idea.valueProposition || '*Не указана в транскрипции*'}

### Основные функции
${idea.functions.length > 0 
  ? idea.functions.map((f, i) => `${i + 1}. ${f}`).join('\n')
  : '*Не указаны в транскрипции*'}

### Риски реализации (взгляд маркетолога-критика)
${idea.risks.length > 0 
  ? idea.risks.map((r, i) => `${i + 1}. ${r}`).join('\n')
  : '*Не указаны в транскрипции*'}

### Трудности реализации
${idea.difficulties.length > 0 
  ? idea.difficulties.map((d, i) => `${i + 1}. ${d}`).join('\n')
  : '*Не указаны в транскрипции*'}

### Итоговая оценка
**Потенциал идеи:** Требуется валидация на основе транскрипции.
**Рекомендация:** Провести custdev с целевой аудиторией для подтверждения гипотез.`;
}

/**
 * Extract idea from already formatted idea markdown
 */
export function extractIdeaFromMarkdown(markdown: string): AgentContext['artifacts']['idea'] | null {
  console.log('[extractIdeaFromMarkdown] Extracting from formatted idea...');
  
  // Extract name
  let name = '';
  const nameMatch = markdown.match(/## 💡\s*Название идеи\s*\n\*\*([^*]+)\*\*/i);
  if (nameMatch) {
    name = nameMatch[1].trim();
  }
  
  // Extract description
  let description = '';
  const descMatch = markdown.match(/### Описание сути\s*\n([^\n#]+)/i);
  if (descMatch) {
    description = descMatch[1].trim();
  }
  
  // Extract functions
  const functions: string[] = [];
  const funcSection = markdown.match(/### Основные функции\s*\n([\s\S]*?)(?=###|$)/i);
  if (funcSection) {
    const funcLines = funcSection[1].match(/\d+\.\s*(.+)/g);
    if (funcLines) {
      funcLines.forEach(line => {
        const cleaned = line.replace(/^\d+\.\s*/, '').trim();
        if (cleaned && !cleaned.startsWith('*')) {
          functions.push(cleaned);
        }
      });
    }
  }
  
  // Extract use cases
  const useCases: string[] = [];
  const useCaseSection = markdown.match(/### Use Cases[^#]*\n([\s\S]*?)(?=###|$)/i);
  if (useCaseSection) {
    const ucLines = useCaseSection[1].match(/\d+\.\s*(.+)/g);
    if (ucLines) {
      ucLines.forEach(line => {
        const cleaned = line.replace(/^\d+\.\s*/, '').trim();
        if (cleaned && !cleaned.startsWith('*')) {
          useCases.push(cleaned);
        }
      });
    }
  }
  
  // Extract user types
  let userTypes = '';
  const userTypeSection = markdown.match(/### Целевая аудитория[^#]*\n([\s\S]*?)(?=###|$)/i);
  if (userTypeSection) {
    userTypes = userTypeSection[1].trim();
  }
  
  // Extract value proposition
  let valueProposition = '';
  const valueSection = markdown.match(/### Ключевая ценность[^#]*\n([\s\S]*?)(?=###|$)/i);
  if (valueSection) {
    valueProposition = valueSection[1].trim();
  }
  
  // Extract risks
  const risks: string[] = [];
  const riskSection = markdown.match(/### Риски[^#]*\n([\s\S]*?)(?=###|$)/i);
  if (riskSection) {
    const riskLines = riskSection[1].match(/\d+\.\s*(.+)/g);
    if (riskLines) {
      riskLines.forEach(line => {
        const cleaned = line.replace(/^\d+\.\s*/, '').trim();
        if (cleaned && !cleaned.startsWith('*')) {
          risks.push(cleaned);
        }
      });
    }
  }
  
  // Extract difficulties
  const difficulties: string[] = [];
  const diffSection = markdown.match(/### Трудности[^#]*\n([\s\S]*?)(?=###|$)/i);
  if (diffSection) {
    const diffLines = diffSection[1].match(/\d+\.\s*(.+)/g);
    if (diffLines) {
      diffLines.forEach(line => {
        const cleaned = line.replace(/^\d+\.\s*/, '').trim();
        if (cleaned && !cleaned.startsWith('*')) {
          difficulties.push(cleaned);
        }
      });
    }
  }
  
  if (!name && !description && functions.length === 0) {
    return null;
  }
  
  return {
    name,
    description,
    functions,
    useCases,
    userTypes,
    valueProposition,
    risks,
    difficulties,
  };
}

/**
 * Generate CJM based on extracted idea
 */
export function generateCJMFromIdea(idea: NonNullable<AgentContext['artifacts']['idea']>): AgentContext['artifacts']['cjm'] {
  console.log('[generateCJMFromIdea] Generating CJM from idea...');
  
  const stages: AgentContext['artifacts']['cjm']['stages'] = [];
  
  // Generate stages based on functions
  idea.functions.forEach((func, idx) => {
    stages.push({
      name: func.substring(0, 30),
      actions: [`Выполнение: ${func}`],
      emotions: ['Нейтрально'],
      painPoints: [],
      opportunities: [],
    });
  });
  
  // Add basic stages if no functions
  if (stages.length === 0) {
    stages.push(
      { name: 'Осознание потребности', actions: ['Поиск решения'], emotions: ['Заинтересованность'], painPoints: [], opportunities: [] },
      { name: 'Поиск решения', actions: ['Сравнение вариантов'], emotions: ['Ожидание'], painPoints: [], opportunities: [] },
      { name: 'Использование', actions: ['Взаимодействие с продуктом'], emotions: ['Удовлетворение'], painPoints: [], opportunities: [] }
    );
  }
  
  // Generate mermaid
  const mermaidDiagram = `\`\`\`mermaid
journey
    title Customer Journey: ${idea.name}
${stages.map((s, i) => `    section ${s.name}
      ${s.actions.map(a => `${a}: ${i + 1}`).join('\n      ')}`).join('\n')}
\`\`\``;
  
  return {
    stages,
    mermaidDiagram,
  };
}

/**
 * Generate IA based on extracted idea
 */
export function generateIAFromIdea(idea: NonNullable<AgentContext['artifacts']['idea']>): AgentContext['artifacts']['ia'] {
  console.log('[generateIAFromIdea] Generating IA from idea...');
  
  const pages: AgentContext['artifacts']['ia']['pages'] = [];
  
  // Main page
  pages.push({
    name: 'Главная',
    url: '/',
    purpose: 'Точка входа в продукт',
    dataElements: ['Название продукта', 'Основные действия'],
    connections: [],
  });
  
  // Pages based on functions
  idea.functions.forEach((func, idx) => {
    const funcName = func.substring(0, 30);
    const urlSlug = funcName.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '-').replace(/-+/g, '-');
    
    pages.push({
      name: funcName,
      url: `/${urlSlug || `page-${idx + 1}`}`,
      purpose: func,
      dataElements: ['Контент', 'Действия'],
      connections: ['Главная'],
    });
  });
  
  // Generate mermaid
  const mermaidLines = [
    'flowchart TD',
    `    root["${idea.name}<br/><small>${idea.description.substring(0, 40)}...</small>"]`,
  ];
  
  pages.slice(1).forEach((page, idx) => {
    const nodeId = `p${idx + 1}`;
    mermaidLines.push(`    ${nodeId}["📄 ${page.name}"]`);
    mermaidLines.push(`    root --> ${nodeId}`);
  });
  
  mermaidLines.push('');
  mermaidLines.push('    classDef root fill:#f5b942,stroke:#d97706,color:#000');
  mermaidLines.push('    classDef page fill:#1e3a5f,stroke:#2563eb,color:#fff');
  mermaidLines.push('    class root root');
  
  const mermaidDiagram = `\`\`\`mermaid\n${mermaidLines.join('\n')}\n\`\`\``;
  
  return {
    pages,
    mermaidDiagram,
    entities: idea.functions.slice(0, 3),
  };
}

/**
 * Generate Userflow based on extracted idea and IA
 */
export function generateUserflowFromIdea(idea: NonNullable<AgentContext['artifacts']['idea']>, ia: AgentContext['artifacts']['ia']): AgentContext['artifacts']['userflow'] {
  console.log('[generateUserflowFromIdea] Generating Userflow from idea...');
  
  const scenarios: AgentContext['artifacts']['userflow']['scenarios'] = [];
  
  // Main scenario based on functions
  const mainSteps = [
    'Старт',
    'Открытие приложения',
    ...idea.functions.slice(0, 3).map(f => f.substring(0, 30)),
    'Завершение',
  ];
  
  const mermaidDiagram = `\`\`\`mermaid
flowchart TD
${mainSteps.map((step, i) => {
  const nodeId = String.fromCharCode(65 + i);
  const nextNodeId = String.fromCharCode(66 + i);
  if (i < mainSteps.length - 1) {
    return `    ${nodeId}[${step}] --> ${nextNodeId}[${mainSteps[i + 1]}]`;
  }
  return '';
}).filter(Boolean).join('\n')}
\`\`\``;
  
  scenarios.push({
    name: 'Основной сценарий',
    steps: mainSteps,
    mermaidDiagram,
  });
  
  return { scenarios };
}
