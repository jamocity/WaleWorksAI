import Image from 'next/image';
import Link from 'next/link';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={`brand-lockup${compact ? ' brand-lockup-compact' : ''}`} aria-label="WaleWorks AI home">
      <Image
        src={compact ? '/brand/waleworks-ai-mark.png' : '/brand/waleworks-ai-logo.png'}
        alt="WaleWorks AI"
        width={compact ? 470 : 780}
        height={compact ? 310 : 425}
        className="brand-logo-image"
        priority
      />
    </Link>
  );
}
