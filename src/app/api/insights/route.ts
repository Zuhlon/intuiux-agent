import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - получить инсайты
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    
    const where: Record<string, string | undefined> = {};
    if (agentId) where.agentId = agentId;
    if (type) where.type = type;
    if (status) where.status = status;
    
    const insights = await db.insight.findMany({
      where,
      include: { agent: true },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 50
    });
    
    return NextResponse.json({ success: true, insights });
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}

// POST - создать инсайт
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, type, title, description, priority, metrics, source } = body;
    
    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      );
    }
    
    const insight = await db.insight.create({
      data: {
        agentId: agentId || null,
        type: type || 'recommendation',
        title,
        description,
        priority: priority || 'medium',
        metrics: metrics ? JSON.stringify(metrics) : null,
        source: source || null
      }
    });
    
    return NextResponse.json({ success: true, insight });
  } catch (error) {
    console.error('Error creating insight:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create insight' },
      { status: 500 }
    );
  }
}

// PUT - обновить статус инсайта
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, priority } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Insight ID is required' },
        { status: 400 }
      );
    }
    
    const updateData: Record<string, string> = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    
    const insight = await db.insight.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({ success: true, insight });
  } catch (error) {
    console.error('Error updating insight:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update insight' },
      { status: 500 }
    );
  }
}

// DELETE - удалить инсайт
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Insight ID is required' },
        { status: 400 }
      );
    }
    
    await db.insight.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting insight:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete insight' },
      { status: 500 }
    );
  }
}
