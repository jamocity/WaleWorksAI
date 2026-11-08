'use client';

import { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';

export function CopyLinkButton({ url, label = 'Copy portfolio link' }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  return <button className="button button-secondary" type="button" onClick={copy}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied' : label}</button>;
}

export function ExternalPortfolioLink({ url }: { url: string }) {
  return <a className="button button-secondary" href={url} target="_blank" rel="noreferrer">View public portfolio <ExternalLink size={16} /></a>;
}
