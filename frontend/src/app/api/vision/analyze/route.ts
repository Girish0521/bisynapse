import { NextResponse } from 'next/server';
export function POST() {
  return NextResponse.json({ error: 'Live image analysis is not implemented. No authenticity determination was made.' }, { status: 503 });
}
