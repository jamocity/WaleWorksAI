'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, LoaderCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { safeInternalHref } from '@/lib/utils';

type NotificationItem = { id: string; title: string; body: string | null; href: string | null; read_at: string | null; created_at: string };

export function NotificationsList({ userId, items }: { userId: string; items: NotificationItem[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  async function markAllRead() {
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: updateError } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', userId).is('read_at', null);
    if (updateError) setError(updateError.message);
    else router.refresh();
    setLoading(false);
  }
  if (!items.length) return <div className="empty-state"><div className="empty-state-icon"><Bell size={22} /></div><h3>You are all caught up.</h3><p>Project updates, invitations and account activity will appear here when notifications are enabled for your workspace.</p></div>;
  return <div className="notifications-list">{items.some((item) => !item.read_at) && <div className="notifications-toolbar"><span>{items.filter((item) => !item.read_at).length} unread</span><button className="button button-secondary button-small" onClick={markAllRead} disabled={loading}>{loading ? <LoaderCircle size={14} className="spin" /> : <Check size={14} />} Mark all as read</button></div>}{error && <div className="form-alert error" role="alert">{error}</div>}{items.map((item) => <article className={`notification-row ${item.read_at ? 'read' : 'unread'}`} key={item.id}><span className="notification-row-icon"><Bell size={16} /></span><div><strong>{item.title}</strong>{item.body && <p>{item.body}</p>}<small>{new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.created_at))}</small></div>{safeInternalHref(item.href) && <a href={safeInternalHref(item.href)!}>Open</a>}</article>)}</div>;
}
