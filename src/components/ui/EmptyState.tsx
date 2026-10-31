import {
  BookOpen,
  CalendarDays,
  BriefcaseBusiness,
  Headphones,
  Newspaper,
  SearchX,
  Sprout,
  UsersRound,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useSite } from '../../app/SiteProvider';
const icons: Record<string, LucideIcon> = {
  news: Newspaper,
  blog: BookOpen,
  podcast: Headphones,
  publications: BookOpen,
  solutions: Sprout,
  'blue-economy-climate': Waves,
  careers: BriefcaseBusiness,
  events: CalendarDays,
  authors: UsersRound,
  search: SearchX,
};
export function EmptyState({
  title,
  description,
  section,
  icon,
  action,
  to,
  children,
}: {
  title?: string;
  description?: string;
  section?: string;
  icon?: LucideIcon;
  action?: string;
  to?: string;
  children?: ReactNode;
}) {
  const { t } = useSite();
  const Icon = icon || icons[section || ''] || BookOpen;
  return (
    <div className="polished-empty-state">
      <div className="empty-state-illustration" aria-hidden="true">
        <span />
        <Icon size={56} strokeWidth={1.15} />
        <i />
      </div>
      <span className="eyebrow">{t('EDITORIAL UPDATE', 'সম্পাদকীয় বার্তা')}</span>
      <h2>
        {title ||
          t('No content is currently available.', 'এই বিভাগে এখনো কোনো বিষয়বস্তু প্রকাশিত হয়নি।')}
      </h2>
      <p>
        {description ||
          t(
            'Our editorial team is preparing content for this section. Please visit again for the latest publications and updates.',
            'সম্পাদকীয় দল এই বিভাগের বিষয়বস্তু প্রস্তুত করছে। নতুন প্রকাশনা ও তথ্যের জন্য আবার দেখুন।',
          )}
      </p>
      {action && to && (
        <Link className="button button-outline" to={to}>
          {action}
        </Link>
      )}
      {children}
    </div>
  );
}
