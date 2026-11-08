import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function initials(name?: string | null) {
  if (!name) return 'WW';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 64);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatStatus(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}



/** Return an absolute HTTP(S) URL only. Use this again when rendering links
 * from database content; browser-side form validation alone is not a trust boundary.
 */
export function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

/** Notification destinations are restricted to same-origin app paths. */
export function safeInternalHref(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null;
  try {
    const parsed = new URL(value, 'https://waleworks.invalid');
    return parsed.origin === 'https://waleworks.invalid' ? `${parsed.pathname}${parsed.search}${parsed.hash}` : null;
  } catch {
    return null;
  }
}
