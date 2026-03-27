import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { detectProductType, getStagesForProductType, ProductType, getProductTypeLabel } from '@/lib/pipeline-config';

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
    const { action, sessionId, name, stageNumber, correction, status, productType: providedProductType, inputText } = body;

    switch (action) {
      case 'create_session': {
        // Detect product type from input if provided
        let productType: ProductType = providedProductType || 'landing';
        if (inputText && !providedProductType) {
          productType = detectProductType(inputText);
        }
        
        const stages = getStagesForProductType(productType);
        
        const session = await db.pipelineSession.create({
          data: {
            name: name || `Проект ${new Date().toLocaleDateString('ru-RU')}`,
            productType: productType,
            status: 'active',
          }
        });

        // Create stages dynamically based on product type
        for (let i = 0; i < stages.length; i++) {
          const stageConfig = stages[i];
          await db.pipelineStage.create({
            data: {
              sessionId: session.id,
              stageNumber: i + 1,
              stageName: stageConfig.name,
              stageLabel: stageConfig.label,
              isOptional: stageConfig.isOptional,
              status: 'pending'
            }
          });
        }

        const sessionWithStages = await db.pipelineSession.findUnique({
          where: { id: session.id },
          include: {
            stages: { orderBy: { stageNumber: 'asc' } }
          }
        });

        return NextResponse.json({ 
          success: true, 
          session: sessionWithStages,
          productType: productType,
          productTypeLabel: getProductTypeLabel(productType)
        });
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
            status: 'completed',
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

      case 'detect_product_type': {
        if (!inputText) {
          return NextResponse.json({ 
            success: false, 
            error: 'Missing inputText' 
          }, { status: 400 });
        }
        
        const detectedType = detectProductType(inputText);
        const stages = getStagesForProductType(detectedType);
        
        return NextResponse.json({ 
          success: true, 
          productType: detectedType,
          productTypeLabel: getProductTypeLabel(detectedType),
          stages: stages.map((s, i) => ({
            number: i + 1,
            name: s.name,
            label: s.label,
            description: s.description,
            isOptional: s.isOptional,
            generateMermaid: s.generateMermaid
          }))
        });
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
