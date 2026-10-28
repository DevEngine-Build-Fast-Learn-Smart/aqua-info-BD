import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
export function SectionHeading({
  title,
  subtitle,
  eyebrow,
  to,
  action,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  to?: string;
  action?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && (
          <span className="eyebrow section-kicker">
            <span className="tiny-square" />
            {eyebrow}
          </span>
        )}
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {to && (
        <Link className="section-action" to={to}>
          {action || 'Explore all'}
          <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  );
}
