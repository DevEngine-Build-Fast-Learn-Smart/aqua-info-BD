import type { ReactNode } from 'react';
export function AdminPageHeader({
  eyebrow = 'THE EDITORIAL DESK',
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="admin-page-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children && <div className="admin-header-actions">{children}</div>}
    </div>
  );
}
