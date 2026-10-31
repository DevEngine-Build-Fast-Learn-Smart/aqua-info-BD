import { Fragment, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  ExternalLink,
  LogOut,
  Menu,
  ShieldCheck,
  Waves,
  X,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Brand } from './Brand';
import { useSite } from '../../app/SiteProvider';
import { useAccess } from '../../features/admin/access/AccessProvider';
import { type AdminModule } from '../../features/admin/access/access';
import { useScrollReveal } from '../../lib/useScrollReveal';
import { WebsiteLogo } from '../ui/WebsiteLogo';
import { SiteDataBoundary } from '../ui/DataState';
import { contentSections } from '../../data/catalog';

export const adminNavigation: {
  to: string;
  label: string;
  module?: AdminModule;
  end?: boolean;
  ownerOnly?: boolean;
  danger?: boolean;
}[] = [
  { to: '/admin/', label: 'The overview', end: true },
  { to: '/admin/homepage', label: 'The front page', module: 'homepage' },
  ...contentSections.map((section) => ({
    to: '/admin/' + section.id,
    label: section.name,
    module: section.id,
  })),
  { to: '/admin/authors', label: 'Authors & Contributors', module: 'authors' },
  { to: '/admin/pages', label: 'About & Editorial Policy', module: 'pages' },
  { to: '/admin/categories', label: 'Editorial categories', module: 'categories' },
  { to: '/admin/footer', label: 'Website footer', module: 'footer' },
  { to: '/admin/settings', label: 'Publication settings', module: 'settings' },
  { to: '/admin/system', label: 'Health & usages', module: 'settings' },
  { to: '/admin/team', label: 'Team & access', module: 'team' },
  { to: '/admin/danger-zone', label: 'Danger zone', ownerOnly: true, danger: true },
  { to: '/admin/profile', label: 'My profile' },
];
export default function AdminLayout() {
  const { data, siteName } = useSite();
  const { currentUser, can, signOut } = useAccess();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const mainRef = useScrollReveal<HTMLElement>(location.pathname);
  const active = [...adminNavigation]
    .reverse()
    .find((item) =>
      item.end
        ? location.pathname === item.to || location.pathname === '/admin'
        : location.pathname.startsWith(item.to),
    );
  const draftCount =
    data.overview?.sections.find((section) => section.section === 'blog')?.drafts || 0;
  useEffect(() => {
    document.title = `${active?.label || 'Workspace'} | ${siteName}`;
  }, [active?.label, siteName]);
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebarRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const media = window.matchMedia('(min-width: 1024px)');
    const resize = () => {
      if (media.matches) setMenuOpen(false);
    };
    media.addEventListener('change', resize);
    document.addEventListener('keydown', close);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', close);
      media.removeEventListener('change', resize);
      previous?.focus();
    };
  }, [menuOpen]);
  return (
    <div className="admin-shell" lang="en">
      <a className="skip-link" href="#admin-content">
        Skip to workspace
      </a>
      {menuOpen && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside ref={sidebarRef} className={`admin-sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="desk-spine">
          <Link to="/" aria-label={`Open ${siteName}`}>
            <WebsiteLogo />
          </Link>
          <span>THE EDITORIAL DESK</span>
          <div>
            <Link to="/" target="_blank" rel="noreferrer" aria-label="Preview publication">
              <ExternalLink size={20} />
            </Link>
            <button onClick={signOut} aria-label="Sign out">
              <LogOut size={20} />
            </button>
          </div>
        </div>
        <div className="desk-index">
          <div className="admin-brand">
            <Brand compact />
            <button
              className="icon-button sidebar-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation"
            >
              <X size={21} />
            </button>
          </div>
          <div className="desk-index-heading">
            <span className="eyebrow">YOUR PUBLICATION WORKSPACE</span>
            <h2>
              Editorial desk<span>.</span>
            </h2>
            <p>A clear space for your next perspective.</p>
          </div>
          <nav aria-label="Admin navigation">
            {adminNavigation
              .filter((item) => {
                if (item.ownerOnly) {
                  const role = (currentUser?.role || '').toLowerCase();
                  return role === 'owner' || role === 'superadmin' || role === 'admin';
                }
                return !item.module || can(item.module);
              })
              .map((item, idx) => {
                const numberStr = String(idx).padStart(2, '0');
                return (
                  <Fragment key={item.to}>
                    {idx === 0 && (
                      <span className="desk-nav-group">THE PUBLICATION</span>
                    )}
                    {item.to === '/admin/settings' && (
                      <span className="desk-nav-group">WORKSPACE & PEOPLE</span>
                    )}
                    {item.danger && (
                      <span className="desk-nav-group text-danger-group">DESTRUCTIVE CONTROLS</span>
                    )}
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={item.danger ? 'desk-nav-danger' : undefined}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="desk-nav-number" aria-hidden="true">
                        {numberStr}
                      </span>
                      <span className="desk-nav-label">{item.label}</span>
                      {item.module === 'blog' && draftCount > 0 ? (
                        <b className="nav-count">{draftCount}</b>
                      ) : (
                        <ArrowUpRight className="desk-nav-arrow" size={16} />
                      )}
                    </NavLink>
                  </Fragment>
                );
              })}
          </nav>
          <div className="sidebar-bottom">
            <div className="sidebar-preview">
              <span className="status-dot" />
              <span>EDITORIAL WORKSPACE</span>
              <p>
                Thoughtfully put together.
                <br />
                One story at a time.
              </p>
            </div>
            <Link to="/" target="_blank" rel="noreferrer" className="sidebar-open-link">
              <span>Open the publication</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/admin/profile" className="editor-profile" onClick={() => setMenuOpen(false)}>
              <Avatar user={currentUser} size="small" />
              <div>
                <strong>{currentUser?.name || 'Aqua Editorial'}</strong>
                <small>{currentUser?.role || 'Owner'} · Signed In</small>
              </div>
              <ShieldCheck size={18} />
            </Link>
          </div>
        </div>
      </aside>
      <div className="admin-workspace" inert={menuOpen}>
        <header className="admin-topbar">
          <div>
            <button
              className="icon-button admin-menu"
              aria-label="Open navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={23} />
            </button>
            <span className="topbar-publication">The editorial desk</span>
            <ChevronRight size={14} />
            <strong>{active?.label || 'Workspace'}</strong>
          </div>
          <div>
            <span className="workspace-status">
              <i />
              Connected to server
            </span>
            <Link to="/" className="preview-link" target="_blank" rel="noreferrer">
              View publication
              <ArrowUpRight size={17} />
            </Link>
            <button className="admin-signout" onClick={signOut}>
              <LogOut size={17} />
              <span>Sign out</span>
            </button>
            <Link to="/admin/profile" className="header-profile-link" aria-label="Open my profile">
              <Avatar user={currentUser} size="small" />
            </Link>
          </div>
        </header>
        <main ref={mainRef} id="admin-content" className="admin-main" key={location.pathname}>
          <SiteDataBoundary>
            <Outlet />
          </SiteDataBoundary>
        </main>
        <footer className="admin-footer">
          <span>
            <Waves size={17} />
            {siteName} <i />
            THE EDITORIAL DESK
          </span>
          <span>A considered space for a shared perspective.</span>
        </footer>
      </div>
    </div>
  );
}
