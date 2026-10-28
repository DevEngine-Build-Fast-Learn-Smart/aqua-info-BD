import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
export function EmptyState({
  title,
  description,
  action = 'Explore the latest stories',
  to = '/news',
}: {
  title: string;
  description: string;
  action?: string;
  to?: string;
}) {
  return (
    <div className="empty-state">
      <BookOpen size={34} strokeWidth={1.2} />
      <h2>{title}</h2>
      <p>{description}</p>
      <Link className="button button-outline" to={to}>
        {action}
      </Link>
    </div>
  );
}
