import { ArrowUpRight, CalendarDays, Headphones, BookOpen, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSite } from '../../app/SiteProvider';
import { entryPath, sectionById } from '../../data/catalog';
import type { Entry } from '../../data/types';
import { assetUrl, formatDate } from '../../lib/utils';
export function EntryCard({ entry, prominent = false }: { entry: Entry; prominent?: boolean }) {
  const { data, t, language } = useSite();
  const section = sectionById(entry.section);
  const category = data.categories.find((value) => value.id === entry.category);
  return (
    <article className={`entry-card ${prominent ? 'entry-prominent' : ''}`}>
      <Link
        to={entryPath(entry)}
        className="entry-cover"
        aria-label={t(entry.title, entry.titleBn)}
      >
        {entry.image ? (
          <img
            src={assetUrl(entry.image)}
            alt={entry.imageAlt || t(entry.title, entry.titleBn)}
            loading={prominent ? 'eager' : 'lazy'}
          />
        ) : (
          <div className="entry-cover-placeholder">
            <Waves size={52} strokeWidth={0.8} />
            <span>{t(section?.name || '', section?.nameBn)}</span>
          </div>
        )}
        {entry.section === 'podcast' && (
          <span className="entry-media-badge">
            <Headphones size={16} />
            {entry.duration || t('Listen', 'শুনুন')}
          </span>
        )}
        {entry.section === 'publications' && (
          <span className="entry-media-badge">
            <BookOpen size={16} />
            {t('Publication', 'প্রকাশনা')}
          </span>
        )}
      </Link>
      <div className="entry-card-body">
        <span className="eyebrow">
          {t(category?.name || section?.name || '', category?.nameBn || section?.nameBn)}
        </span>
        <h3>
          <Link to={entryPath(entry)}>{t(entry.title, entry.titleBn)}</Link>
        </h3>
        <p>{t(entry.excerpt, entry.excerptBn)}</p>
        {entry.section === 'careers' && (
          <p className="entry-organization">
            {entry.organization}
            {entry.location && ` · ${entry.location}`}
          </p>
        )}
        {entry.section === 'events' && entry.eventStart && (
          <p className="entry-organization">
            <CalendarDays size={16} />
            {new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD' : 'en-GB', {
              dateStyle: 'medium',
              timeZone: 'Asia/Dhaka',
            }).format(new Date(entry.eventStart))}
            {entry.venue && ` · ${entry.venue}`}
          </p>
        )}
        <div className="entry-card-meta">
          <span>
            {entry.authorDetails
              ? t(entry.authorDetails.name, entry.authorDetails.nameBn)
              : entry.author || formatDate(entry.date, language)}
          </span>
          <Link
            to={entryPath(entry)}
            aria-label={t('Read ', 'পড়ুন: ') + t(entry.title, entry.titleBn)}
          >
            <ArrowUpRight size={19} />
          </Link>
        </div>
      </div>
    </article>
  );
}
