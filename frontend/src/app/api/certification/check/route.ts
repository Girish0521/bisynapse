import { NextResponse } from 'next/server';
export function POST() {
  return NextResponse.json({ error: 'Live certification applicability checks are not implemented. Consult the official BIS service.' }, { status: 503 });
}
