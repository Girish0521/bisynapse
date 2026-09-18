'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { VisualContext } from '@/lib/types';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (visualContext: VisualContext) => void;
}

export function CameraScannerModal({ isOpen, onClose }: CameraScannerModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const openedDialog = dialog.current;
    openedDialog?.showModal();
    return () => { openedDialog?.close(); previousFocus?.focus(); };
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <dialog ref={dialog} aria-labelledby="scanner-dialog-title" onCancel={(event) => { event.preventDefault(); onClose(); }}
      className="fixed inset-0 m-auto max-w-lg w-[calc(100%-2rem)] rounded-xl border border-slate-200 p-6 backdrop:bg-slate-900/70">
      <h2 id="scanner-dialog-title" className="text-xl font-bold text-slate-900">Product lookup guidance</h2>
      <p className="mt-3 text-sm text-slate-600">Image recognition and live authenticity checks are not implemented. The product lookup page supports manual references and clearly labelled prototype examples. The assistant currently covers captured water-sector documents.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/scan" onClick={onClose} className="rounded bg-[#0F4C81] px-4 py-2 text-sm text-white">Open product lookup</Link>
        <button onClick={onClose} className="rounded border border-slate-300 px-4 py-2 text-sm">Close scanner guidance</button>
      </div>
    </dialog>
  );
}
