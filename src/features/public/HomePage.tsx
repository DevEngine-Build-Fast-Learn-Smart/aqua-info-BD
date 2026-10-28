import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Clock3 } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { Reveal } from '../../components/ui/Reveal';
import { articleTitle, assetUrl, formatDate } from '../../lib/utils';
import { MarketStrip } from './MarketStrip';
import { ArticleCard } from './ArticleCard';
import { ArticleActions } from './ArticleActions';
import { SectionHeading } from './SectionHeading';
import { VideoSection } from './VideoSection';
import { KnowledgeSection } from './KnowledgeSection';
import { DispatchSection } from './DispatchSection';

export default function HomePage() {
  const { data } = useSite();
  const sectionComponents: Record<string, React.ReactNode> = {
    lead: <LeadSection />,
    news: <NewsSection />,
    videos: <VideoSection />,
    knowledge: <KnowledgeSection />,
    economy: <EconomySection />,
    newsletter: <DispatchSection />,
  };
  return (
    <>
      <MarketStrip />
      {data.sections
        .filter((section) => section.enabled)
        .map((section) => (
          <Reveal key={section.id}>{sectionComponents[section.id]}</Reveal>
        ))}
    </>
  );
}
function LeadSection() {
  const { data, language, t } = useSite();
  const published = data.articles.filter((a) => a.status === 'published');
  const lead = published.find((a) => a.id === data.settings.leadArticleId) || published[0];
  if (!lead)
    return (
      <section className="container section-space">
        <h1>{t('New perspectives are on the horizon.', 'নতুন দৃষ্টিভঙ্গি আসছে।')}</h1>
        <p>
          {t(
            'The editorial team is preparing the next stories.',
            'সম্পাদকীয় দল নতুন প্রতিবেদন প্রস্তুত করছে।',
          )}
        </p>
      </section>
    );
  return (
    <section className="lead-section section-space">
      <div className="container frontpage-folio">
        <span className="eyebrow">
          <span className="status-dot" />
          {t('THE CURRENT', 'জলজ জগতের খবর')}
        </span>
        <p>
          {t(
            'On the water. In the field. Beyond the headlines.',
            'জলে। মাঠে। শিরোনামের সীমানা ছাড়িয়ে।',
          )}
        </p>
        <span className="folio-line" />
        <span className="eyebrow">01 / {t('THE FRONT PAGE', 'প্রথম পাতা')}</span>
      </div>
      <div className="container lead-grid">
        <article className="lead-story">
          <Link className="lead-image" to={`/articles/${lead.slug}`}>
            <img src={assetUrl(lead.image)} alt={lead.imageAlt} fetchPriority="high" />
            <span className="image-label">
              {t('FROM THE WATER’S EDGE', 'জলের প্রান্ত থেকে')} · {lead.location}
            </span>
          </Link>
          <div className="lead-copy">
            <span className="eyebrow">
              <span className="status-dot" />
              {t(
                data.categories.find((c) => c.id === lead.category)?.name || 'FIELD REPORT',
                data.categories.find((c) => c.id === lead.category)?.nameBn,
              )}
              <span className="eyebrow-separator">/</span>
              {lead.location}
            </span>
            <h1>
              <Link to={`/articles/${lead.slug}`}>{articleTitle(lead, language)}</Link>
            </h1>
            <p className="lead-excerpt">{t(lead.excerpt, lead.excerptBn)}</p>
            <div className="lead-byline">
              <div>
                <strong>
                  {t('By', 'লেখক')} {lead.author}
                </strong>
                <span>
                  {formatDate(lead.date, language)}
                  <i /> <Clock3 size={13} />
                  {lead.readTime} {t('min read', 'মিনিট')}
                </span>
              </div>
              <ArticleActions article={lead} />
            </div>
          </div>
        </article>
        <aside className="field-dossier">
          <div className="dossier-heading">
            <span className="eyebrow">{t('THE FIELD DOSSIER', 'মাঠ প্রতিবেদন')}</span>
            <span>মাঠের কথা</span>
          </div>
          {published
            .filter((a) => a.id !== lead.id)
            .slice(0, 3)
            .map((article) => (
              <ArticleCard key={article.id} article={article} compact />
            ))}
          <Link className="dossier-link" to="/news">
            {t('More perspectives from the field', 'মাঠের আরও গল্প')}
            <ArrowUpRight size={17} />
          </Link>
        </aside>
      </div>
    </section>
  );
}
function NewsSection() {
  const { data, t } = useSite();
  const stories = data.articles.filter((a) => a.status === 'published');
  const latest = stories.slice(4, 7).length ? stories.slice(4, 7) : stories.slice(0, 3);
  return (
    <section className="news-section section-space">
      <div className="container">
        <SectionHeading
          title={t('Latest Field Reports & Industry News', 'সর্বশেষ মাঠ প্রতিবেদন ও শিল্প সংবাদ')}
          subtitle={t(
            'Fresh perspectives. Grounded in the field.',
            'নতুন দৃষ্টিভঙ্গি। মাঠের অভিজ্ঞতায় সমৃদ্ধ।',
          )}
          to="/news"
          action={t('View the news desk', 'সব সংবাদ')}
        />
        <div className="news-grid">
          {latest[0] && <ArticleCard article={latest[0]} />}
          <div className="news-stack">
            {latest.slice(1).map((article, i) => (
              <ArticleCard article={article} compact dark={i === 0} key={article.id} />
            ))}
          </div>
          <aside className="briefs">
            <div className="eyebrow">
              <span className="tiny-square" />
              {t('REGIONAL BRIEFS', 'আঞ্চলিক সংবাদ')}
            </div>
            {stories.slice(1, 5).map((story, i) => (
              <Link key={story.id} to={`/articles/${story.slug}`}>
                <span className="eyebrow">
                  0{i + 1} / {story.location}
                </span>
                <h4>{t(story.title, story.titleBn)}</h4>
                <ArrowUpRight size={15} />
              </Link>
            ))}
          </aside>
        </div>
      </div>
    </section>
  );
}
function EconomySection() {
  const { data, language, t } = useSite();
  const articles = data.articles.filter(
    (a) => a.category === 'blue-economy' && a.status === 'published',
  );
  const feature = articles.find((a) => a.id === 'a8') || articles[0];
  if (!feature) return null;
  return (
    <section className="economy-section section-space">
      <div className="container economy-grid">
        <article className="economy-feature">
          <Link className="economy-image" to={`/articles/${feature.slug}`}>
            <img src={assetUrl(feature.image)} alt={feature.imageAlt} loading="lazy" />
            <span className="eyebrow">THE BLUE HORIZON / {feature.location}</span>
          </Link>
          <div className="economy-story">
            <span className="eyebrow">
              <span className="tiny-square" />
              {t('SPECIAL BLUE ECONOMY REPORT', 'বিশেষ সুনীল অর্থনীতি প্রতিবেদন')}
            </span>
            <h2>
              <Link to={`/articles/${feature.slug}`}>{articleTitle(feature, language)}</Link>
            </h2>
            <p>{t(feature.excerpt, feature.excerptBn)}</p>
            <div className="economy-topics">
              <span>{t('Coastal livelihoods', 'উপকূলীয় জীবিকা')}</span>
              <span>{t('Community perspectives', 'কমিউনিটির দৃষ্টিভঙ্গি')}</span>
              <span>{t('Sustainable futures', 'টেকসই ভবিষ্যৎ')}</span>
            </div>
            <Link className="button button-primary" to={`/articles/${feature.slug}`}>
              {t('Read the special report', 'বিশেষ প্রতিবেদন পড়ুন')}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </article>
        <div className="economy-aside">
          <span className="eyebrow">{t('BEYOND THE SHORELINE', 'তীরের সীমানা ছাড়িয়ে')}</span>
          <h3>{t('A blue economy. A shared future.', 'সুনীল অর্থনীতি। সবার ভবিষ্যৎ।')}</h3>
          <p>
            {t(
              'Following the connections between healthy waters, resilient communities, and economic opportunity.',
              'সুস্থ জলজ পরিবেশ, সক্ষম কমিউনিটি ও অর্থনৈতিক সম্ভাবনার যোগসূত্র অনুসন্ধানে।',
            )}
          </p>
          {articles
            .filter((a) => a.id !== feature.id)
            .map((article) => (
              <ArticleCard article={article} compact key={article.id} />
            ))}
          <Link className="text-link" to="/blue-economy">
            {t('Explore blue economy', 'সুনীল অর্থনীতি সম্পর্কে জানুন')}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
