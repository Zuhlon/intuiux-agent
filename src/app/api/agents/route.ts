import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - получить всех агентов
export async function GET() {
  try {
    const agents = await db.agent.findMany({
      include: {
        _count: {
          select: { 
            conversations: true, 
            insights: true,
            knowledgeBases: true 
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ success: true, agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// POST - создать нового агента
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, description, systemPrompt, avatar } = body;
    
    if (!name || !type || !systemPrompt) {
      return NextResponse.json(
        { success: false, error: 'Name, type, and systemPrompt are required' },
        { status: 400 }
      );
    }
    
    const agent = await db.agent.create({
      data: {
        name,
        type,
        description: description || '',
        systemPrompt,
        avatar: avatar || null,
        isActive: true
      }
    });
    
    return NextResponse.json({ success: true, agent });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}

// PUT - обновить агента
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      );
    }
    
    const agent = await db.agent.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({ success: true, agent });
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

// DELETE - удалить агента
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      );
    }
    
    await db.agent.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}
