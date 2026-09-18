import { backendProxy } from '@/lib/backendProxy';
export function POST(request: Request) {
  return backendProxy(request, '/api/standards/search');
}
