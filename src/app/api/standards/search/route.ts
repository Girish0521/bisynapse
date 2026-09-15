import { NextResponse } from 'next/server';
import { mockStandards } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const productName = body.productName || '';
    const category = body.category || '';
    const material = body.material || '';
    const industry = body.industry || '';

    const term = (productName || category || material || industry || '').toLowerCase();

    let results = mockStandards;
    if (term) {
      results = mockStandards.filter(s =>
        s.title.toLowerCase().includes(term) ||
        s.category?.toLowerCase().includes(term) ||
        s.whyApplies.toLowerCase().includes(term) ||
        s.number.toLowerCase().includes(term)
      );
      if (results.length === 0) {
        results = mockStandards;
      }
    }

    return NextResponse.json({
      query: { productName, category, material, industry },
      totalResults: results.length,
      disclaimer: 'Final applicability must be verified against the latest BIS publications, standards and Quality Control Orders.',
      standards: results
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to search standards' }, { status: 500 });
  }
}
