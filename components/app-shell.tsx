'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell, BriefcaseBusiness, ChevronDown, CircleHelp, Compass, FolderKanban,
  LayoutDashboard, LogOut, Menu, Search, Settings, Sparkles, UserRound, X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Brand } from '@/components/brand';
import { Avatar } from '@/components/avatar';
import type { Profile } from '@/lib/types';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: 'My projects', icon: FolderKanban },
  { href: '/dashboard/profile', label: 'My profile', icon: UserRound },
];

export function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
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
          <button className="icon-button logout-button" title="Sign out" aria-label="Sign out" onClick={signOut} disabled={signingOut}><LogOut size={16} /></button>
        </div>
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
          <div className="topbar-actions"><Link className="icon-button notification-button" href="/dashboard/notifications" aria-label="Notifications"><Bell size={18} /></Link><div className="topbar-divider" /><Link className="topbar-profile" href="/dashboard/profile"><Avatar name={profile.full_name} image={profile.avatar_url} size="sm" /><span>{profile.full_name?.split(' ')[0] || 'Profile'}</span></Link></div>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
