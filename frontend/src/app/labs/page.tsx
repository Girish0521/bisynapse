import { Suspense } from 'react';
import { ToolWorkspace } from '@/components/ToolWorkspace';

export default function Page() {
  return <Suspense fallback={<p className="p-8">Loading...</p>}><ToolWorkspace kind="labs" /></Suspense>;
}
