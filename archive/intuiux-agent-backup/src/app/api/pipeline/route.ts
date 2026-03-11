import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - получить все сессии
export async function GET() {
  try {
    const sessions = await db.pipelineSession.findMany({
      include: {
        stages: {
          orderBy: { stageNumber: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

// POST - действия с сессиями
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, name, stageNumber, correction, status } = body;

    switch (action) {
      case 'create_session': {
        const session = await db.pipelineSession.create({
          data: {
            name: name || `Проект ${new Date().toLocaleDateString('ru-RU')}`,
            status: 'active',
          }
        });

        const stageNames = ['idea', 'competitors', 'cjm', 'ia', 'userflow', 'prototype', 'invitation', 'guidelines', 'metrics'];
        for (let i = 1; i <= 9; i++) {
          await db.pipelineStage.create({
            data: {
              sessionId: session.id,
              stageNumber: i,
              stageName: stageNames[i - 1],
              status: 'pending',
              isApproved: false
            }
          });
        }

        const sessionWithStages = await db.pipelineSession.findUnique({
          where: { id: session.id },
          include: {
            stages: { orderBy: { stageNumber: 'asc' } }
          }
        });

        return NextResponse.json({ success: true, session: sessionWithStages });
      }

      case 'get_session': {
        const session = await db.pipelineSession.findUnique({
          where: { id: sessionId },
          include: {
            stages: { orderBy: { stageNumber: 'asc' } }
          }
        });
        return NextResponse.json({ success: true, session });
      }

      case 'get_all_sessions': {
        const sessions = await db.pipelineSession.findMany({
          include: {
            stages: { orderBy: { stageNumber: 'asc' } }
          },
          orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ success: true, sessions });
      }

      case 'delete_session': {
        await db.pipelineSession.delete({
          where: { id: sessionId }
        });
        return NextResponse.json({ success: true });
      }

      case 'approve_stage': {
        const stage = await db.pipelineStage.update({
          where: {
            sessionId_stageNumber: {
              sessionId,
              stageNumber
            }
          },
          data: {
            isApproved: true,
            correction: correction || null
          }
        });
        return NextResponse.json({ success: true, stage });
      }

      case 'update_stage_status': {
        const stage = await db.pipelineStage.update({
          where: {
            sessionId_stageNumber: {
              sessionId,
              stageNumber
            }
          },
          data: { status }
        });
        return NextResponse.json({ success: true, stage });
      }

      case 'stop_generation': {
        await db.pipelineSession.update({
          where: { id: sessionId },
          data: { status: 'stopped' }
        });

        const processingStage = await db.pipelineStage.findFirst({
          where: {
            sessionId,
            status: 'processing'
          }
        });

        if (processingStage) {
          await db.pipelineStage.update({
            where: { id: processingStage.id },
            data: {
              status: 'stopped',
              errorMessage: 'Генерация остановлена пользователем'
            }
          });
        }

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Pipeline API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
