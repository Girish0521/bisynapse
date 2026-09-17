import { NextResponse } from 'next/server';
import { mockVisualScanPresets } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { preset, scanMode } = body;

    let result = mockVisualScanPresets.kettle;

    if (scanMode === 'hallmark' || preset === 'hallmark') {
      result = mockVisualScanPresets.hallmark;
    } else if (scanMode === 'bis-mark' || preset === 'charger') {
      result = mockVisualScanPresets.charger;
    }

    return NextResponse.json({
      success: true,
      analysis: result,
      disclaimer: 'Visual detection assists with label reading. Official authenticity must be verified on official BIS services.'
    });
  } catch {
    return NextResponse.json({ error: 'Failed to analyze product image' }, { status: 500 });
  }
}
