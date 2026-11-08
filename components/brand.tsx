import Link from 'next/link';
import { Layers3 } from 'lucide-react';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand-lockup" aria-label="WaleWorks AI home">
      <span className="brand-mark"><Layers3 size={21} strokeWidth={2.4} /></span>
      {!compact && <span className="brand-name">WaleWorks<span>AI</span></span>}
    </Link>
  );
}
