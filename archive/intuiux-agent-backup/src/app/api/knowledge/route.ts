import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - получить базу знаний
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const category = searchParams.get('category');
    const source = searchParams.get('source');
    
    const where: Record<string, string | undefined> = {};
    if (agentId) where.agentId = agentId;
    if (category) where.category = category;
    if (source) where.source = source;
    
    const knowledge = await db.knowledgeBase.findMany({
      where,
      include: { agent: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    return NextResponse.json({ success: true, knowledge });
  } catch (error) {
    console.error('Error fetching knowledge:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch knowledge base' },
      { status: 500 }
    );
  }
}

// POST - добавить знание
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, source, category, tags, agentId } = body;
    
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    const knowledge = await db.knowledgeBase.create({
      data: {
        title,
        content,
        source: source || 'manual',
        category: category || 'general',
        tags: JSON.stringify(tags || []),
        agentId: agentId || null
      }
    });
    
    return NextResponse.json({ success: true, knowledge });
  } catch (error) {
    console.error('Error creating knowledge:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create knowledge entry' },
      { status: 500 }
    );
  }
}

// PUT - обновить знание
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Knowledge ID is required' },
        { status: 400 }
      );
    }
    
    if (updateData.tags) {
      updateData.tags = JSON.stringify(updateData.tags);
    }
    
    const knowledge = await db.knowledgeBase.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({ success: true, knowledge });
  } catch (error) {
    console.error('Error updating knowledge:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update knowledge entry' },
      { status: 500 }
    );
  }
}

// DELETE - удалить знание
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Knowledge ID is required' },
        { status: 400 }
      );
    }
    
    await db.knowledgeBase.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting knowledge:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete knowledge entry' },
      { status: 500 }
    );
  }
}
