'use client';

import { useRef, useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';

function legacyCopy(text: string, input: HTMLInputElement | null) {
  let temporaryField: HTMLTextAreaElement | null = null;
  try {
    if (input) {
      input.focus();
      input.select();
      input.setSelectionRange(0, input.value.length);
    } else {
      temporaryField = document.createElement('textarea');
      temporaryField.value = text;
      temporaryField.setAttribute('readonly', '');
      temporaryField.style.position = 'fixed';
      temporaryField.style.top = '0';
      temporaryField.style.left = '-9999px';
      document.body.appendChild(temporaryField);
      temporaryField.focus();
      temporaryField.select();
    }
    return typeof document.execCommand === 'function' && document.execCommand('copy');
  } catch {
    return false;
  } finally {
    temporaryField?.remove();
  }
}

export function CopyLinkButton({
  url,
  label = 'Copy portfolio link',
  isPublic = true,
}: {
  url: string;
  label?: string;
  isPublic?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');
  const [showFallback, setShowFallback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [resolvedUrl, setResolvedUrl] = useState('');

  async function copy() {
    const siteBase = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const absoluteUrl = new URL(url, siteBase).toString();
    setResolvedUrl(absoluteUrl);
    setMessage('');
    setCopied(false);

    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(absoluteUrl);
      } else if (!legacyCopy(absoluteUrl, inputRef.current)) {
        throw new Error('Clipboard permission was unavailable.');
      }
      setCopied(true);
      setShowFallback(false);
      setMessage(isPublic
        ? 'Portfolio link copied. You can paste it into a message or application.'
        : 'Link copied, but your portfolio is private. Enable public visibility before sharing it.');
    } catch {
      const fallbackWorked = legacyCopy(absoluteUrl, inputRef.current);
      if (fallbackWorked) {
        setCopied(true);
        setShowFallback(false);
        setMessage(isPublic
          ? 'Portfolio link copied using the browser compatibility method.'
          : 'Link copied, but your portfolio is private. Enable public visibility before sharing it.');
      } else {
        setCopied(false);
        setShowFallback(true);
        setMessage('Automatic copying was blocked. The link is selected below; press Ctrl+C to copy it.');
        window.setTimeout(() => inputRef.current?.select(), 0);
      }
    }
  }

  return (
    <div className="copy-link-control">
      <button className="button button-secondary" type="button" onClick={copy}>
        {copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied' : label}
      </button>
      {message && <span className="copy-link-message" role="status" aria-live="polite">{message}</span>}
      {showFallback && (
        <input
          ref={inputRef}
          className="text-input copy-link-fallback"
          aria-label="Portfolio link to copy manually"
          readOnly
          value={resolvedUrl}
          onFocus={(event) => event.currentTarget.select()}
          onClick={(event) => event.currentTarget.select()}
        />
      )}
    </div>
  );
}

export function ExternalPortfolioLink({ url }: { url: string }) {
  return <a className="button button-secondary" href={url} target="_blank" rel="noreferrer">View public portfolio <ExternalLink size={16} /></a>;
}
