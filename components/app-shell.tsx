'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell, BriefcaseBusiness, ChevronDown, CircleHelp, Compass, FolderKanban,
  LayoutDashboard, LoaderCircle, LogOut, Menu, Search, Settings, Sparkles, UserRound, UsersRound, X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Brand } from '@/components/brand';
import { Avatar } from '@/components/avatar';
import type { Profile } from '@/lib/types';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: 'My projects', icon: FolderKanban },
  { href: '/dashboard/profile', label: 'My profile', icon: UserRound },
  { href: '/dashboard/invitations', label: 'Team invitations', icon: UsersRound },
];

export function AppShell({ profile, children, initialUnreadCount = 0 }: { profile: Profile; children: React.ReactNode; initialUnreadCount?: number }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [search, setSearch] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const refreshUnreadCount = useCallback(async () => {
    const supabase = createClient();
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .is('read_at', null);

    if (!error && typeof count === 'number') setUnreadCount(count);
  }, [profile.id]);

  // Keep the badge current using Realtime when enabled, with polling as a fallback.
  useEffect(() => {
    let active = true;
    const supabase = createClient();
    const refresh = async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .is('read_at', null);
      if (active && !error && typeof count === 'number') setUnreadCount(count);
    };

    void refresh();
    const channel = supabase
      .channel(`notification-badge-${profile.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${profile.id}`,
      }, () => { void refresh(); })
      .subscribe();

    const interval = window.setInterval(() => { void refresh(); }, 30000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      void supabase.removeChannel(channel);
    };
  }, [profile.id]);

  useEffect(() => {
    void refreshUnreadCount();
  }, [pathname, refreshUnreadCount]);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setMobileOpen(false);
      router.replace('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('WaleWorks sign-out failed:', error);
      setSignOutError('Could not sign out. Please try again.');
      setSigningOut(false);
    }
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(`/dashboard/projects${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`);
    setMobileOpen(false);
  }

  const sidebar = (
    <>
      <div className="sidebar-brand"><Brand /></div>
      <div className="workspace-switcher">
        <span className="workspace-avatar">W</span>
        <span className="workspace-copy"><strong>Wale University</strong><small>Student workspace</small></span>
        <ChevronDown size={15} />
      </div>
      <div className="sidebar-section-label">WORKSPACE</div>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href);
          return <Link onClick={() => setMobileOpen(false)} key={href} href={href} className={`nav-link ${active ? 'active' : ''}`}><Icon size={18} /><span>{label}</span></Link>;
        })}
      </nav>
      <div className="sidebar-section-label sidebar-section-spaced">DISCOVER</div>
      <nav className="sidebar-nav">
        <Link onClick={() => setMobileOpen(false)} href="/dashboard/careers" className={`nav-link ${pathname.startsWith('/dashboard/careers') ? 'active' : ''}`}><Compass size={18} /><span>Career discovery</span></Link>
        <Link onClick={() => setMobileOpen(false)} href="/dashboard/challenges" className={`nav-link ${pathname.startsWith('/dashboard/challenges') ? 'active' : ''}`}><BriefcaseBusiness size={18} /><span>Challenges</span></Link>
        <Link onClick={() => setMobileOpen(false)} href="/dashboard/work-simulations" className={`nav-link ${pathname.startsWith('/dashboard/work-simulations') ? 'active' : ''}`}><Sparkles size={18} /><span>Workday simulations</span></Link>
      </nav>
      <div className="sidebar-bottom">
        <Link href="/dashboard/settings" className={`nav-link ${pathname.startsWith('/dashboard/settings') ? 'active' : ''}`}><Settings size={18} /><span>Settings</span></Link>
        <Link onClick={() => setMobileOpen(false)} href="/dashboard/help" className={`nav-link ${pathname.startsWith('/dashboard/help') ? 'active' : ''}`}><CircleHelp size={18} /><span>Help & feedback</span></Link>
        {profile.role === 'mentor' || profile.role === 'admin' ? <Link onClick={() => setMobileOpen(false)} href="/dashboard/challenges/manage" className={`nav-link ${pathname.startsWith('/dashboard/challenges/manage') ? 'active' : ''}`}><BriefcaseBusiness size={18}/><span>Manage challenges</span></Link> : null}
        {profile.role === 'admin' ? <Link onClick={() => setMobileOpen(false)} href="/dashboard/admin/support" className={`nav-link ${pathname.startsWith('/dashboard/admin/support') ? 'active' : ''}`}><CircleHelp size={18}/><span>Support inbox</span></Link> : null}
        <div className="sidebar-user">
          <Avatar name={profile.full_name} image={profile.avatar_url} size="sm" />
          <div className="sidebar-user-copy"><strong>{profile.full_name || 'Student'}</strong><small>{profile.department || 'Student account'}</small></div>
        </div>
        <button
          type="button"
          className="sidebar-signout-button"
          onClick={signOut}
          disabled={signingOut}
          aria-label={signingOut ? 'Signing out' : 'Log out'}
        >
          {signingOut ? <LoaderCircle size={16} className="spin" /> : <LogOut size={16} />}
          <span>{signingOut ? 'Signing out…' : 'Log out'}</span>
        </button>
        {signOutError && <p className="sidebar-signout-error" role="alert">{signOutError}</p>}
      </div>
    </>
  );

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>{sidebar}</aside>
      {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <div className="app-main">
        <header className="app-topbar">
          <button className="icon-button mobile-menu-button" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
          <form className="topbar-search" onSubmit={submitSearch}><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your projects..." /><kbd>⌘ K</kbd></form>
          <div className="topbar-actions"><Link className="icon-button notification-button" href="/dashboard/notifications" aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'} title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'Notifications'}><Bell size={18} />{unreadCount > 0 && <span className="notification-count" aria-hidden="true">{unreadCount > 99 ? '99+' : unreadCount}</span>}</Link><div className="topbar-divider" /><Link className="topbar-profile" href="/dashboard/profile"><Avatar name={profile.full_name} image={profile.avatar_url} size="sm" /><span>{profile.full_name?.split(' ')[0] || 'Profile'}</span></Link></div>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
