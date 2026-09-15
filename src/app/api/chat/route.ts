import { NextResponse } from 'next/server';
import { generateAssistantResponse } from '@/lib/mockAiLogic';

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const query = body.query || body.message || 'electric kettle';
    const visualContext = body.visualContext;

    const response = generateAssistantResponse(query, visualContext);
    return NextResponse.json(response);
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to process chat query' }, { status: 500 });
  }
}
