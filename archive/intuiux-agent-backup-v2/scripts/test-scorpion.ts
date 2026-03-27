// Test script for fitness club "Скорпион" transcript
// Tests the entire pipeline from Idea → Competitors

import { extractIdeaFromText, formatIdeaAsMarkdown } from '../src/lib/idea-extractor';
import { analyzeCompetitors, formatCompetitorAnalysisAsMarkdown } from '../src/lib/competitor-analyzer';

const SCORPION_TRANSCRIPT = `
Михаил: Привет
Дмитрий: Привет, Миша! Готов начать? У тебя есть идея проекта, которую хочешь обсудить?
Михаил: Да. У меня есть бизнес — фитнес-клуб Скорпион.
Дмитрий: Отлично! Фитнес-клуб Скорпион. Расскажи подробнее, что это за бизнес?
Михаил: Это небольшой фитнес-клуб в районе, работает уже 3 года. Есть тренажёрный зал, групповые занятия, персональные тренировки.
Дмитрий: Понял. Какие проблемы ты сейчас решаешь в клубе?
Михаил: Главная проблема — учёт абонементов и посещений. Сейчас всё в Гугл Таблицах, это неудобно. Тренеры не видят расписание, клиенты звонят записаться.
Дмитрий: То есть нужна автоматизация учёта. А что именно должно быть в приложении?
Михаил: Нужны модули: учёт абонементов, расписание тренировок, запись клиентов, профили тренеров.
Дмитрий: Отлично! Давай уточним по абонементам. Какие типы абонементов есть?
Михаил: Есть разовые посещения, месячные, квартальные, годовые. Также есть карты на определённое количество посещений — 8, 12, 20.
Дмитрий: Понял. А как клиенты должны записываться?
Михаил: Хочу чтобы клиенты могли записываться через приложение или Telegram-бота. Выбирать тренера, время, вид тренировки.
Дмитрий: А тренеры что должны видеть?
Михаил: Тренеры видят своё расписание, кто записан на тренировку, историю клиента.
Дмитрий: А отчёты тебе какие нужны?
Михаил: Нужны отчёты по выручке, по посещаемости, по популярности тренировок, по оттоку клиентов.
Дмитрий: Отлично! Есть ли интеграции?
Михаил: Хочу интеграцию с 1С для бухгалтерии, и Telegram-бота для клиентов.
Дмитрий: А сколько пользователей?
Михаил: Сейчас около 300 активных клиентов, 8 тренеров, 2 администратора.
`;

console.log('='.repeat(60));
console.log('TEST: Fitness Club "Скорпион"');
console.log('='.repeat(60));

// Step 1: Extract Idea
console.log('\n--- STEP 1: IDEA EXTRACTION ---\n');
const idea = extractIdeaFromText(SCORPION_TRANSCRIPT);
console.log('Extracted Idea:');
console.log('- Name:', idea.name || '(empty)');
console.log('- Industry:', idea.industry);
console.log('- Sub-industry:', idea.subIndustry);
console.log('- Functions:', idea.functions.slice(0, 5));
console.log('- Audience:', idea.userTypes.split('\n').slice(0, 2).join(', '));

// Step 2: Format Idea as Markdown
console.log('\n--- STEP 2: FORMATTED IDEA ---\n');
const ideaMarkdown = formatIdeaAsMarkdown(idea);
console.log(ideaMarkdown.substring(0, 500) + '...');

// Step 3: Competitor Analysis
console.log('\n--- STEP 3: COMPETITOR ANALYSIS ---\n');
try {
  const analysis = analyzeCompetitors(idea);
  console.log('Product Name:', analysis.productName);
  console.log('Industry:', analysis.industryName);
  console.log('Market Size:', analysis.marketSize);
  console.log('Direct Competitors:', analysis.directCompetitors.map(c => c.name).join(', '));
  console.log('\n--- FORMATTED COMPETITOR ANALYSIS (first 2000 chars) ---\n');
  const competitorMarkdown = formatCompetitorAnalysisAsMarkdown(analysis);
  console.log(competitorMarkdown.substring(0, 2000) + '...');
} catch (error) {
  console.error('Error in competitor analysis:', error);
}

console.log('\n' + '='.repeat(60));
console.log('TEST COMPLETE');
console.log('='.repeat(60));
