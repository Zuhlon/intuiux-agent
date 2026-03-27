import { db } from '../src/lib/db';

async function createPipelineAgents() {
  const agents = [
    {
      id: 'pipeline-transcription_analyst',
      name: 'Аналитик транскрипций',
      type: 'transcription_analyst',
      description: 'Выделяет ключевые идеи из транскрипций',
      systemPrompt: 'Ты — эксперт по анализу транскрипций разговоров.',
      isActive: true
    },
    {
      id: 'pipeline-brand_marketer',
      name: 'Маркетолог',
      type: 'brand_marketer', 
      description: 'Проводит конкурентный анализ',
      systemPrompt: 'Ты — маркетолог с 15-летним опытом.',
      isActive: true
    },
    {
      id: 'pipeline-cjm_researcher',
      name: 'Исследователь CJM',
      type: 'cjm_researcher',
      description: 'Строит Customer Journey Maps',
      systemPrompt: 'Ты — исследователь пользовательского опыта.',
      isActive: true
    },
    {
      id: 'pipeline-ia_architect',
      name: 'Архитектор IA',
      type: 'ia_architect',
      description: 'Создаёт информационную архитектуру',
      systemPrompt: 'Ты — архитектор информационных систем.',
      isActive: true
    },
    {
      id: 'pipeline-task_architect',
      name: 'Архитектор заданий',
      type: 'task_architect',
      description: 'Создаёт планы тестирования',
      systemPrompt: 'Ты — архитектор технических заданий.',
      isActive: true
    },
    {
      id: 'pipeline-prototyper',
      name: 'Прототипировщик',
      type: 'prototyper',
      description: 'Создаёт HTML прототипы',
      systemPrompt: 'Ты — прототипировщик интерфейсов.',
      isActive: true
    }
  ];

  for (const agent of agents) {
    try {
      await db.agent.upsert({
        where: { id: agent.id },
        update: agent,
        create: agent
      });
      console.log(`Created/updated: ${agent.name}`);
    } catch (e) {
      console.error(`Error creating ${agent.name}:`, e);
    }
  }

  console.log('Done!');
}

createPipelineAgents();
