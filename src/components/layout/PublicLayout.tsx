import { Outlet, useLocation } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';
import { ScrollProgress } from '../ui/ScrollProgress';
import { useScrollReveal } from '../../lib/useScrollReveal';
import { SiteDataBoundary } from '../ui/DataState';

export function PublicLayout() {
  const { pathname } = useLocation();
  const mainRef = useScrollReveal<HTMLElement>(pathname);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <PublicHeader />
      <ScrollProgress />
      <main id="main-content" ref={mainRef}>
        <SiteDataBoundary>
          <Outlet />
        </SiteDataBoundary>
      </main>
      <PublicFooter />
    </>
  );
}
