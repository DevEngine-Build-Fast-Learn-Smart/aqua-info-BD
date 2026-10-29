import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';

export function LoadingSkeleton() {
  return (
    <div
      className="loading-skeleton container"
      role="status"
      aria-label="Loading content"
      aria-busy="true"
    >
      <div className="skeleton-line skeleton-short" />
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-layout">
        <div className="skeleton-image" />
        <div>
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-short" />
        </div>
      </div>
      <span className="sr-only">Loading the latest content…</span>
    </div>
  );
}
export function RequestError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="request-error" role="alert">
      <h2>The page couldn’t be loaded.</h2>
      <p>{message}</p>
      <button className="button button-outline" onClick={retry}>
        <RefreshCw size={17} />
        Try again
      </button>
    </div>
  );
}
export function SiteDataBoundary({ children }: { children: ReactNode }) {
  const { loading, loadError, refresh } = useSite();
  if (loading) return <LoadingSkeleton />;
  if (loadError) return <RequestError message={loadError} retry={() => void refresh()} />;
  return <>{children}</>;
}
