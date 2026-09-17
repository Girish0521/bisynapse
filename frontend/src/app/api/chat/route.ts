import type { VisualContext } from '@/lib/types';
import { NextResponse } from 'next/server';
import { generateAssistantResponse } from '@/lib/mockAiLogic';

export async function POST(request: Request) {
  try {
    let body: { query?: string; message?: string; visualContext?: VisualContext } = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const query = body.query || body.message || 'electric kettle';
    const visualContext = body.visualContext;

    const response = generateAssistantResponse(query, visualContext);
    return NextResponse.json(response);
  } catch (err) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to process chat query' }, { status: 500 });
  }
}
