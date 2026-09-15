import { NextResponse } from 'next/server';
import { mockLabs } from '@/lib/mockData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state')?.toLowerCase();
  const query = searchParams.get('query')?.toLowerCase();

  let labs = mockLabs;
  if (state) {
    labs = labs.filter(l => l.state.toLowerCase().includes(state));
  }
  if (query) {
    labs = labs.filter(l =>
      l.name.toLowerCase().includes(query) ||
      l.productCategory.toLowerCase().includes(query) ||
      l.supportedStandards.some(s => s.toLowerCase().includes(query))
    );
  }

  return NextResponse.json({
    total: labs.length,
    labs
  });
}
