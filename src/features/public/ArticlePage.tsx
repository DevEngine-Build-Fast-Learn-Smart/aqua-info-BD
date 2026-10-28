import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock3, MapPin } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { articleTitle, assetUrl, formatDate } from '../../lib/utils';
import { ArticleActions } from './ArticleActions';
import { ArticleCard } from './ArticleCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { SectionHeading } from './SectionHeading';
export default function ArticlePage() {
  const { slug } = useParams();
  const { data, language, t } = useSite();
  const article = data.articles.find((a) => a.slug === slug && a.status === 'published');
  if (!article)
    return (
      <EmptyState
        title={t('This story is unavailable.', 'এই প্রতিবেদনটি পাওয়া যাচ্ছে না।')}
        description={t(
          'It may be a draft, or the address may have changed.',
          'এটি খসড়া হতে পারে অথবা ঠিকানা পরিবর্তিত হয়েছে।',
        )}
      />
    );
  const category = data.categories.find((c) => c.id === article.category);
  const related = data.articles
    .filter((a) => a.status === 'published' && a.id !== article.id)
    .sort(
      (a, b) => Number(b.category === article.category) - Number(a.category === article.category),
    )
    .slice(0, 3);
  return (
    <>
      <article className="article-page container">
        <Link className="back-link" to="/news">
          <ArrowLeft size={15} />
          {t('Back to the news desk', 'সংবাদ ডেস্কে ফিরুন')}
        </Link>
        <header className="article-page-header">
          <Link className="eyebrow" to={`/${article.category}`}>
            {category ? t(category.name, category.nameBn) : 'FIELD REPORT'}
          </Link>
          <h1>{articleTitle(article, language)}</h1>
          <p className="article-deck">{t(article.excerpt, article.excerptBn)}</p>
          <div className="article-page-meta">
            <div>
              <strong>
                {t('By', 'লেখক')} {article.author}
              </strong>
              <span>
                {formatDate(article.date, language)}
                <i /> <Clock3 size={14} />
                {article.readTime} {t('min read', 'মিনিট')}
              </span>
            </div>
            <ArticleActions article={article} />
          </div>
        </header>
        <figure className="article-main-image">
          <img src={assetUrl(article.image)} alt={article.imageAlt} />
          <figcaption>
            <MapPin size={13} />
            {article.location} ·{' '}
            {t(
              'Illustrative photograph for the interface preview',
              'ইন্টারফেস প্রিভিউর জন্য প্রতীকী ছবি',
            )}
          </figcaption>
        </figure>
        <div className="article-reading-layout">
          <aside>
            <span className="eyebrow">{t('IN THE FIELD', 'মাঠ পর্যায়ে')}</span>
            <p>{article.location}</p>
            <span className="eyebrow">AQUA INFO BD</span>
            <p>{t(data.settings.tagline, data.settings.taglineBn)}</p>
          </aside>
          <div className="article-body">
            {t(article.body, article.bodyBn)
              .split('\n\n')
              .map((paragraph, index) =>
                paragraph.length < 65 && index > 0 ? (
                  <h2 key={index}>{paragraph}</h2>
                ) : (
                  <p key={index}>{paragraph}</p>
                ),
              )}
            <div className="article-endmark">
              AQUA INFO BD <span>■</span>
            </div>
            <div className="info-note">
              {t(
                'Editorial preview · Sample content for reviewing this website’s design and reading experience.',
                'সম্পাদকীয় প্রিভিউ · ওয়েবসাইটের ডিজাইন ও পাঠের অভিজ্ঞতা পর্যালোচনার জন্য নমুনা বিষয়বস্তু।',
              )}
            </div>
          </div>
        </div>
      </article>
      <section className="container section-space">
        <SectionHeading
          title={t('Continue the conversation', 'আরও পড়ুন')}
          to="/news"
          action={t('All stories', 'সব প্রতিবেদন')}
        />
        <div className="archive-grid">
          {related.map((a) => (
            <ArticleCard article={a} key={a.id} />
          ))}
        </div>
      </section>
    </>
  );
}
