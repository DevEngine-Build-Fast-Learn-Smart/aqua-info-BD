import { Component, Suspense, lazy, useEffect, type ErrorInfo, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { SiteProvider, useSite } from './SiteProvider';
import { PublicLayout } from '../components/layout/PublicLayout';
import { SplashScreen } from '../components/ui/SplashScreen';
import { AccessProvider } from '../features/admin/access/AccessProvider';
import { RequireAccess } from '../features/admin/access/RequireAccess';
import { contentSections, entryPath } from '../data/catalog';
import { AboutPage, AuthorPage, NotFoundPage } from '../features/public/AboutPages';
import { useRemoteRecord } from '../lib/useRemoteRecord';
import { useParams } from 'react-router-dom';
import type { Entry } from '../data/types';
import { assetUrl } from '../lib/utils';
const HomePage = lazy(() => import('../features/public/HomePage'));
const EntryListPage = lazy(() => import('../features/public/EntryListPage'));
const EntryPage = lazy(() => import('../features/public/EntryPage'));
const AdminLayout = lazy(() => import('../components/layout/AdminLayout'));
const OverviewPage = lazy(() => import('../features/admin/OverviewPage'));
const HomepagePage = lazy(() => import('../features/admin/HomepagePage'));
const ContentListPage = lazy(() => import('../features/admin/ContentListPage'));
const ContentEditorPage = lazy(() => import('../features/admin/ContentEditorPage'));
const AuthorsPage = lazy(() => import('../features/admin/AuthorsPage'));
const PagesPage = lazy(() => import('../features/admin/PagesPage'));
const CategoriesPage = lazy(() => import('../features/admin/CategoriesPage'));
const SettingsPage = lazy(() => import('../features/admin/SettingsPage'));
const FooterPage = lazy(() => import('../features/admin/FooterPage'));
const LoginPage = lazy(() => import('../features/admin/access/LoginPage'));
const ProfilePage = lazy(() => import('../features/admin/ProfilePage'));
const TeamPage = lazy(() => import('../features/admin/access/TeamPage'));
const SystemPage = lazy(() => import('../features/admin/SystemPage'));
const DangerZonePage = lazy(() => import('../features/admin/DangerZonePage'));
function NavigationEffects() {
  const { pathname, hash } = useLocation(),
    { loading } = useSite();
  useEffect(() => {
    if (loading) return;
    const frame = requestAnimationFrame(() => {
      if (hash)
        document
          .getElementById(decodeURIComponent(hash.slice(1)))
          ?.scrollIntoView({ behavior: 'instant' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, loading]);
  return null;
}
function Loading() {
  const { siteName } = useSite();
  return (
    <div className="route-loading" role="status">
      <span />
      <p>Opening {siteName}…</p>
    </div>
  );
}
function LegacyEntryRedirect() {
  const { slug } = useParams();
  const result = useRemoteRecord<Entry>('/entries/' + encodeURIComponent(slug || '') + '/');
  if (result.loading) return <Loading />;
  return result.record ? <Navigate to={entryPath(result.record)} replace /> : <NotFoundPage />;
}
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Aqua Info BD rendering error', error, info);
  }
  render() {
    return this.state.failed ? (
      <div className="empty-state">
        <h1>The page could not be displayed.</h1>
        <p>Your publication content remains on the server.</p>
        <a className="button button-primary" href={assetUrl('/')}>
          Reload website
        </a>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  return (
    <ErrorBoundary>
      <SiteProvider>
        <AccessProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <NavigationEffects />
            <SplashScreen />
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="home" element={<Navigate to="/" replace />} />
                  {contentSections.map((section) => (
                    <Route key={section.id} path={section.id}>
                      <Route index element={<EntryListPage section={section.id} />} />
                      <Route path="story/:slug" element={<EntryPage section={section.id} />} />
                      <Route path=":topic" element={<EntryListPage section={section.id} />} />
                    </Route>
                  ))}
                  <Route path="search" element={<EntryListPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="about/team" element={<AboutPage pageId="team" />} />
                  <Route path="about/team/:id" element={<AuthorPage />} />
                  <Route
                    path="about/contact-editorial-policy"
                    element={<AboutPage pageId="editorial-policy" />}
                  />
                  <Route
                    path="contact"
                    element={<Navigate to="/about/contact-editorial-policy" replace />}
                  />
                  <Route path="articles/:slug" element={<LegacyEntryRedirect />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
                <Route path="/admin/login" element={<LoginPage />} />
                <Route
                  path="/admin"
                  element={
                    <RequireAccess>
                      <AdminLayout />
                    </RequireAccess>
                  }
                >
                  <Route index element={<OverviewPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route
                    path="homepage"
                    element={
                      <RequireAccess module="homepage">
                        <HomepagePage />
                      </RequireAccess>
                    }
                  />
                  {contentSections.map((section) => (
                    <Route key={section.id} path={section.id}>
                      <Route
                        index
                        element={
                          <RequireAccess module={section.id}>
                            <ContentListPage section={section.id} />
                          </RequireAccess>
                        }
                      />
                      <Route
                        path="new"
                        element={
                          <RequireAccess module={section.id}>
                            <ContentEditorPage section={section.id} />
                          </RequireAccess>
                        }
                      />
                      <Route
                        path=":id"
                        element={
                          <RequireAccess module={section.id}>
                            <ContentEditorPage section={section.id} />
                          </RequireAccess>
                        }
                      />
                    </Route>
                  ))}
                  <Route
                    path="authors"
                    element={
                      <RequireAccess module="authors">
                        <AuthorsPage />
                      </RequireAccess>
                    }
                  />
                  <Route
                    path="pages"
                    element={
                      <RequireAccess module="pages">
                        <PagesPage />
                      </RequireAccess>
                    }
                  />
                  <Route
                    path="categories"
                    element={
                      <RequireAccess module="categories">
                        <CategoriesPage />
                      </RequireAccess>
                    }
                  />
                  <Route
                    path="footer"
                    element={
                      <RequireAccess module="footer">
                        <FooterPage />
                      </RequireAccess>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <RequireAccess module="settings">
                        <SettingsPage />
                      </RequireAccess>
                    }
                  />
                  <Route
                    path="team"
                    element={
                      <RequireAccess module="team">
                        <TeamPage />
                      </RequireAccess>
                    }
                  />
                  <Route
                    path="system"
                    element={
                      <RequireAccess module="settings">
                        <SystemPage />
                      </RequireAccess>
                    }
                  />
                  <Route
                    path="danger-zone"
                    element={
                      <RequireAccess module="settings">
                        <DangerZonePage />
                      </RequireAccess>
                    }
                  />
                  <Route path="*" element={<Navigate to="/admin/" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AccessProvider>
      </SiteProvider>
    </ErrorBoundary>
  );
}
