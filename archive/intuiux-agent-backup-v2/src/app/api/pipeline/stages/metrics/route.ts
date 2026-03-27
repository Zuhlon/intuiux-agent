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

    const stages = await db.pipelineStage.findMany({
      where: { sessionId }
    });

    const ideaData = stages.find(s => s.stageNumber === 1)?.outputData 
      ? JSON.parse(stages.find(s => s.stageNumber === 1)!.outputData || '{}')
      : null;
    const cjmData = stages.find(s => s.stageNumber === 3)?.outputData 
      ? JSON.parse(stages.find(s => s.stageNumber === 3)!.outputData || '{}')
      : null;

    if (!ideaData) {
      return NextResponse.json({ success: false, error: 'Previous stages not completed' }, { status: 400 });
    }

    await db.pipelineStage.update({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 9 } },
      data: {
        status: 'processing',
        startedAt: new Date(),
        inputData: JSON.stringify({ ideaData, cjmData, correction })
      }
    });

    const llm = new LLM();
    const response = await llm.chat({
      messages: [
        { role: 'system', content: 'Create product metrics in JSON format with metrics array, kpis array, northStar object' },
        { role: 'user', content: `Create metrics for: ${JSON.stringify(ideaData)}` }
      ],
      temperature: 0.7
    });

    let metricsData = { metrics: [], kpis: [], northStar: { metric: '', components: [] } };
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) metricsData = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('Parse error:', e);
    }

    await db.pipelineStage.update({
      where: { sessionId_stageNumber: { sessionId, stageNumber: 9 } },
      data: {
        status: 'completed',
        outputData: JSON.stringify(metricsData),
        completedAt: new Date()
      }
    });

    await db.pipelineSession.update({
      where: { id: sessionId },
      data: { status: 'completed' }
    });

    return NextResponse.json({ success: true, data: metricsData });

  } catch (error) {
    console.error('Metrics error:', error);
    const body = await request.clone().json().catch(() => ({}));
    if (body.sessionId) {
      await db.pipelineStage.update({
        where: { sessionId_stageNumber: { sessionId: body.sessionId, stageNumber: 9 } },
        data: { status: 'error', errorMessage: String(error) }
      }).catch(() => {});
    }
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
