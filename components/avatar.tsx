import Image from 'next/image';
import { initials } from '@/lib/utils';

export function Avatar({ name, image, size = 'md' }: { name?: string | null; image?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const pixels = size === 'sm' ? 31 : size === 'lg' ? 76 : 40;
  return (
    <span className={`avatar avatar-${size}`}>
      {image ? <Image src={image} alt={`${name ?? 'User'} profile`} width={pixels} height={pixels} unoptimized /> : initials(name)}
    </span>
  );
}
