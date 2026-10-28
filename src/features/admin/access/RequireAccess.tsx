import { Link, Navigate, useLocation } from 'react-router-dom';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { useAccess } from './AccessProvider';
import type { AdminModule } from './access';
import type { ReactNode } from 'react';

export function RequireAccess({ module, children }: { module?: AdminModule; children: ReactNode }) {
  const { currentUser, can } = useAccess();
  const location = useLocation();
  if (!currentUser)
    return (
      <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />
    );
  if (module && !can(module))
    return (
      <section className="access-denied">
        <span className="access-denied-icon">
          <LockKeyhole size={30} strokeWidth={1.4} />
        </span>
        <span className="eyebrow">YOUR WORKSPACE ACCESS</span>
        <h1>A different seat at the desk.</h1>
        <p>
          This area hasn’t been included in your access. The workspace owner can update your
          permissions from Team & access.
        </p>
        <Link className="button button-primary" to="/admin/">
          <ArrowLeft size={17} />
          Back to your overview
        </Link>
      </section>
    );
  return <>{children}</>;
}
