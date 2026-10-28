import { Component, Suspense, lazy, useEffect, type ErrorInfo, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { SiteProvider, useSite } from './SiteProvider';
import { PublicLayout } from '../components/layout/PublicLayout';
import { SplashScreen } from '../components/ui/SplashScreen';
import { AccessProvider } from '../features/admin/access/AccessProvider';
import { RequireAccess } from '../features/admin/access/RequireAccess';
import {
  AboutPage,
  KnowledgePage,
  MarketPage,
  NotFoundPage,
  SubscriptionPage,
  VideosPage,
} from '../features/public/InformationPages';

const HomePage = lazy(() => import('../features/public/HomePage'));
const ArchivePage = lazy(() => import('../features/public/ArchivePage'));
const ArticlePage = lazy(() => import('../features/public/ArticlePage'));
const AdminLayout = lazy(() => import('../components/layout/AdminLayout'));
const OverviewPage = lazy(() => import('../features/admin/OverviewPage'));
const HomepagePage = lazy(() => import('../features/admin/HomepagePage'));
const ArticlesPage = lazy(() => import('../features/admin/ArticlesPage'));
const ArticleEditorPage = lazy(() => import('../features/admin/ArticleEditorPage'));
const CollectionsPage = lazy(() => import('../features/admin/CollectionsPage'));
const MarketEditorPage = lazy(() => import('../features/admin/MarketEditorPage'));
const CategoriesPage = lazy(() => import('../features/admin/CategoriesPage'));
const SettingsPage = lazy(() => import('../features/admin/SettingsPage'));
const FooterPage = lazy(() => import('../features/admin/FooterPage'));
const LoginPage = lazy(() => import('../features/admin/access/LoginPage'));
const TeamPage = lazy(() => import('../features/admin/access/TeamPage'));

function NavigationEffects() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { data, t } = useSite();
  useEffect(() => {
    if (pathname === '/admin') {
      navigate('/admin/', { replace: true });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, navigate]);
  useEffect(() => {
    const story = data.articles.find((a) => pathname === `/articles/${a.slug}`);
    const category = data.categories.find((c) => pathname === `/${c.id}`);
    const title = story
      ? t(story.title, story.titleBn)
      : category
        ? t(category.name, category.nameBn)
        : pathname.startsWith('/admin')
          ? 'Editorial Desk'
          : pathname === '/home'
            ? 'Beyond the Water'
            : pathname.slice(1).replaceAll('-', ' ');
    document.title = `${title} | Aqua Info BD`;
  }, [pathname, data.articles, data.categories, t]);
  return null;
}
function CategoryRoute() {
  const { data } = useSite();
  const { pathname } = useLocation();
  return data.categories.some((c) => pathname === `/${c.id}`) ? (
    <ArchivePage key={pathname} />
  ) : (
    <NotFoundPage />
  );
}
function Loading() {
  return (
    <div className="route-loading" role="status">
      <span />
      <p>Opening the journal…</p>
    </div>
  );
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
        <h1>Let’s return to calmer waters.</h1>
        <p>The page couldn’t be displayed. Your saved local content is still in your browser.</p>
        <a className="button button-primary" href="/home">
          Reload the journal
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
                  <Route index element={<Navigate to="/home" replace />} />
                  <Route path="home" element={<HomePage />} />
                  <Route path="news" element={<ArchivePage />} />
                  <Route path="articles/:slug" element={<ArticlePage />} />
                  <Route path="saved" element={<ArchivePage savedOnly />} />
                  <Route path="videos" element={<VideosPage />} />
                  <Route path="knowledge-hub" element={<KnowledgePage />} />
                  <Route path="market" element={<MarketPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="subscription" element={<SubscriptionPage />} />
                  <Route path=":categorySlug" element={<CategoryRoute />} />
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
                  <Route
                    path="homepage"
                    element={
                      <RequireAccess module="homepage">
                        <HomepagePage />
                      </RequireAccess>
                    }
                  />
                  <Route
                    path="articles"
                    element={
                      <RequireAccess module="articles">
                        <ArticlesPage />
                      </RequireAccess>
                    }
                  />
                  <Route
                    path="articles/new"
                    element={
                      <RequireAccess module="articles">
                        <ArticleEditorPage />
                      </RequireAccess>
                    }
                  />
                  <Route
                    path="articles/:id"
                    element={
                      <RequireAccess module="articles">
                        <ArticleEditorPage />
                      </RequireAccess>
                    }
                  />
                  <Route
                    path="videos"
                    element={
                      <RequireAccess module="videos">
                        <CollectionsPage kind="videos" />
                      </RequireAccess>
                    }
                  />
                  <Route
                    path="resources"
                    element={
                      <RequireAccess module="resources">
                        <CollectionsPage kind="resources" />
                      </RequireAccess>
                    }
                  />
                  <Route
                    path="market"
                    element={
                      <RequireAccess module="market">
                        <MarketEditorPage />
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
