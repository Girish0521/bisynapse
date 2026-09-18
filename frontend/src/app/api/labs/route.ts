import { backendProxy } from '@/lib/backendProxy';
export function GET(request: Request) {
  return backendProxy(request, '/api/lims/search');
}
