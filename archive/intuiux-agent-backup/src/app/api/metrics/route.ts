import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - получить метрики
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const where: Record<string, string | undefined> = {};
    if (category) where.category = category;
    
    const metrics = await db.metric.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 50
    });
    
    return NextResponse.json({ success: true, metrics });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

// POST - создать метрику
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, value, unit, category, source } = body;
    
    if (!name || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Name and value are required' },
        { status: 400 }
      );
    }
    
    const metric = await db.metric.create({
      data: {
        name,
        value,
        unit: unit || null,
        category: category || 'general',
        source: source || null
      }
    });
    
    return NextResponse.json({ success: true, metric });
  } catch (error) {
    console.error('Error creating metric:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create metric' },
      { status: 500 }
    );
  }
}
