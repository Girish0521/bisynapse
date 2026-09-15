/**
 * BISynapse API Client
 *
 * In production (Vercel), calls are routed to the Render backend via
 * NEXT_PUBLIC_BACKEND_URL. In development, falls back to local Next.js
 * API routes at /api/*.
 */

const BACKEND_URL =
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '') || ''
    : '';

function endpoint(path: string): string {
  if (BACKEND_URL) {
    return `${BACKEND_URL}${path}`;
  }
  return path; // local Next.js route handler
}

// ─── /api/chat ─────────────────────────────────────────────
export async function fetchChatResponse(query: string, visualContext?: any) {
  const res = await fetch(endpoint('/api/chat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, visualContext }),
  });
  if (!res.ok) throw new Error(`Chat API error: ${res.status}`);
  return res.json();
}

// ─── /api/standards/search ─────────────────────────────────
export async function fetchStandardsSearch(params: {
  productName?: string;
  category?: string;
  material?: string;
  industry?: string;
}) {
  const res = await fetch(endpoint('/api/standards/search'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Standards API error: ${res.status}`);
  return res.json();
}

// ─── /api/labs ─────────────────────────────────────────────
export async function fetchLabs(params?: { state?: string; standard?: string }) {
  const qs = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => !!v) as [string, string][]).toString()
    : '';
  const res = await fetch(endpoint(`/api/labs${qs}`));
  if (!res.ok) throw new Error(`Labs API error: ${res.status}`);
  return res.json();
}

// ─── /api/certification ────────────────────────────────────
export async function fetchCertification() {
  const res = await fetch(endpoint('/api/certification'));
  if (!res.ok) throw new Error(`Certification API error: ${res.status}`);
  return res.json();
}

// ─── /api/vision ───────────────────────────────────────────
export async function fetchVisionAnalysis(scanType: string) {
  const res = await fetch(endpoint('/api/vision'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scanType }),
  });
  if (!res.ok) throw new Error(`Vision API error: ${res.status}`);
  return res.json();
}
