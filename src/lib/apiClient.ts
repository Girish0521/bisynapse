/**
 * BISynapse / BIS Saarthi AI API Client
 *
 * In production (Vercel), calls are routed to the Render backend via
 * NEXT_PUBLIC_BACKEND_URL. In development, falls back to local Express
 * or Next.js route handlers.
 */

const BACKEND_URL =
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:4000'
    : 'http://localhost:4000';

function endpoint(path: string): string {
  if (BACKEND_URL) {
    return `${BACKEND_URL}${path}`;
  }
  return path;
}

// ─── Health Check ──────────────────────────────────────────
export async function fetchHealth() {
  const res = await fetch(endpoint('/api/health'));
  if (!res.ok) throw new Error(`Health API error: ${res.status}`);
  return res.json();
}

// ─── Chat / RAG ────────────────────────────────────────────
export async function fetchChatResponse(query: string, visualContext?: any, options?: { userId?: string; language?: string }) {
  const res = await fetch(endpoint('/api/chat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, visualContext, ...options }),
  });
  if (!res.ok) throw new Error(`Chat API error: ${res.status}`);
  return res.json();
}

// ─── Standards ─────────────────────────────────────────────
export async function fetchStandards(params?: { category?: string; sector?: string; query?: string }) {
  const qs = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => !!v) as [string, string][]).toString()
    : '';
  const res = await fetch(endpoint(`/api/standards${qs}`));
  if (!res.ok) throw new Error(`Standards API error: ${res.status}`);
  return res.json();
}

export async function fetchStandardsSearch(params: {
  productName?: string;
  category?: string;
  material?: string;
  industry?: string;
  query?: string;
}) {
  const res = await fetch(endpoint('/api/standards/search'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Standards API error: ${res.status}`);
  return res.json();
}

// ─── Products Registry ─────────────────────────────────────
export async function fetchProducts(params?: { query?: string; regNo?: string; category?: string; status?: string }) {
  const qs = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => !!v) as [string, string][]).toString()
    : '';
  const res = await fetch(endpoint(`/api/products${qs}`));
  if (!res.ok) throw new Error(`Products API error: ${res.status}`);
  return res.json();
}

export async function fetchProductByRegNo(regNo: string) {
  const res = await fetch(endpoint(`/api/products/${encodeURIComponent(regNo)}`));
  if (!res.ok) throw new Error(`Product lookup error: ${res.status}`);
  return res.json();
}

// ─── Hallmarking ───────────────────────────────────────────
export async function fetchHallmarking(huid?: string) {
  const qs = huid ? `?huid=${encodeURIComponent(huid)}` : '';
  const res = await fetch(endpoint(`/api/hallmarking${qs}`));
  if (!res.ok) throw new Error(`Hallmarking API error: ${res.status}`);
  return res.json();
}

// ─── Laboratories ──────────────────────────────────────────
export async function fetchLabs(params?: { state?: string; city?: string; standard?: string; query?: string }) {
  const qs = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => !!v) as [string, string][]).toString()
    : '';
  const res = await fetch(endpoint(`/api/labs${qs}`));
  if (!res.ok) throw new Error(`Labs API error: ${res.status}`);
  return res.json();
}

// ─── Services & Certification ──────────────────────────────
export async function fetchServices(category?: string) {
  const qs = category ? `?category=${encodeURIComponent(category)}` : '';
  const res = await fetch(endpoint(`/api/services${qs}`));
  if (!res.ok) throw new Error(`Services API error: ${res.status}`);
  return res.json();
}

export async function fetchCertification() {
  const res = await fetch(endpoint('/api/certification'));
  if (!res.ok) throw new Error(`Certification API error: ${res.status}`);
  return res.json();
}

// ─── Scanning & Verification ───────────────────────────────
export async function fetchScanVerification(payload: {
  scanType: string;
  scannedValue?: string;
  extractedInfo?: any;
  userId?: string;
}) {
  const res = await fetch(endpoint('/api/scan'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Scan API error: ${res.status}`);
  return res.json();
}

export async function fetchVisionAnalysis(scanType: string) {
  const res = await fetch(endpoint('/api/vision'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scanType }),
  });
  if (!res.ok) throw new Error(`Vision API error: ${res.status}`);
  return res.json();
}

// ─── History & FAQs ────────────────────────────────────────
export async function fetchHistory(userId?: string) {
  const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  const res = await fetch(endpoint(`/api/history${qs}`));
  if (!res.ok) throw new Error(`History API error: ${res.status}`);
  return res.json();
}

export async function fetchFaqs(category?: string) {
  const qs = category ? `?category=${encodeURIComponent(category)}` : '';
  const res = await fetch(endpoint(`/api/faqs${qs}`));
  if (!res.ok) throw new Error(`FAQs API error: ${res.status}`);
  return res.json();
}
