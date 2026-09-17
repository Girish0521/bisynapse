import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { isNumber, productName } = body;

    return NextResponse.json({
      isNumber: isNumber || 'IS 302 (Part 2/Sec 3)',
      productName: productName || 'Electric Kettle',
      scheme: 'BIS Product Certification Scheme (Scheme I)',
      status: 'Requires verification against latest QCO',
      isMandatory: true,
      concessionsAvailable: {
        msme: '50% concession on marking fees',
        startup: '50% concession on application fee'
      },
      processSteps: [
        '1. Standard identification',
        '2. Factory testing facility setup',
        '3. ManakOnline application submission',
        '4. BIS inspection & sample drawing',
        '5. Independent lab report validation',
        '6. Licence grant'
      ]
    });
  } catch {
    return NextResponse.json({ error: 'Failed to check certification' }, { status: 500 });
  }
}
