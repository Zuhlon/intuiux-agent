import { db } from '@/lib/db';

async function createInitialData() {
  console.log('🚀 Creating initial data...');
  
  // Проверяем инсайты
  const existingInsights = await db.insight.count();
  if (existingInsights === 0) {
    // Создаём начальные инсайты
    const insights = [
      {
        type: 'pain_point',
        title: 'Высокий отказ на этапе оплаты',
        description: '34% пользователей покидают корзину из-за сложной формы оплаты. Основные боли: слишком много полей, отсутствие популярных платёжных методов, непрозрачность итоговой суммы.',
        priority: 'critical',
        source: 'analytics'
      },
      {
        type: 'opportunity',
        title: 'Оптимизация мобильного опыта',
        description: '65% трафика приходит с мобильных устройств, но конверсия на 40% ниже десктопа. Есть потенциал для значительного роста при оптимизации мобильного UX.',
        priority: 'high',
        source: 'research'
      },
      {
        type: 'recommendation',
        title: 'Внедрение AI-ассистента',
        description: 'AI-ассистент на этапе onboarding может снизить churn на 25-30%. Рекомендуется пилотный проект с персонализированными подсказками.',
        priority: 'medium',
        source: 'trends'
      },
      {
        type: 'trend',
        title: 'Голосовой поиск растёт',
        description: 'Использование голосового поиска выросло на 35% за год. Рекомендуется добавить голосовой ввод для ключевых функций.',
        priority: 'medium',
        source: 'web'
      }
    ];
    
    for (const insight of insights) {
      await db.insight.create({
        data: insight
      });
    }
    console.log(`✅ Created ${insights.length} insights`);
  } else {
    console.log('✅ Insights already exist');
  }
  
  // Проверяем метрики
  const existingMetrics = await db.metric.count();
  if (existingMetrics === 0) {
    const metrics = [
      { name: 'Conversion Rate', value: 3.2, unit: '%', category: 'conversion' },
      { name: 'Bounce Rate', value: 42, unit: '%', category: 'engagement' },
      { name: 'CSAT', value: 4.1, unit: '/5', category: 'satisfaction' },
      { name: 'NPS', value: 32, unit: '', category: 'satisfaction' },
      { name: 'Time to Value', value: 8.5, unit: 'min', category: 'engagement' },
      { name: 'Churn Rate', value: 7.2, unit: '%/mo', category: 'retention' }
    ];
    
    for (const metric of metrics) {
      await db.metric.create({
        data: metric
      });
    }
    console.log(`✅ Created ${metrics.length} metrics`);
  } else {
    console.log('✅ Metrics already exist');
  }
  
  console.log('🎉 Done!');
}

createInitialData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
