import { NextResponse } from 'next/server';

// Callers supply fixed API paths. Never accept an upstream URL from the request.
export async function backendProxy(request: Request, path: string) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '');
  if (!backend) return NextResponse.json({ error: 'Backend is not configured' }, { status: 503 });
  let body: string | undefined;
  if (request.method === 'POST') {
    body = await request.text();
    if (body.length > 256 * 1024) return NextResponse.json({ error: 'Request is too large' }, { status: 413 });
    try { JSON.parse(body); }
    catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  }
  try {
    const response = await fetch(backend + path + new URL(request.url).search, {
      method: request.method, headers: { 'Content-Type': 'application/json' }, body,
      signal: AbortSignal.timeout(45000), cache: 'no-store',
    });
    return NextResponse.json(await response.json(), {
      status: response.status,
      headers: response.headers.has('retry-after') ? { 'Retry-After': response.headers.get('retry-after')! } : {},
    });
  } catch {
    return NextResponse.json({ error: 'Backend is unavailable' }, { status: 503 });
  }
}
