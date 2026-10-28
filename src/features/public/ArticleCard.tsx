import { ArrowUpRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Article } from '../../data/types';
import { useSite } from '../../app/SiteProvider';
import { articleTitle, formatDate } from '../../lib/utils';
export function ArticleCard({
  article,
  compact = false,
  dark = false,
}: {
  article: Article;
  compact?: boolean;
  dark?: boolean;
}) {
  const { data, language, t } = useSite();
  const category = data.categories.find((c) => c.id === article.category);
  return (
    <article
      className={`article-card ${compact ? 'article-compact' : ''} ${dark ? 'article-dark' : ''}`}
    >
      {!compact && (
        <Link to={`/articles/${article.slug}`} className="article-image">
          <img src={article.image} alt={article.imageAlt} loading="lazy" />
          <span className="image-label">{article.location}</span>
        </Link>
      )}
      <div className="article-content">
        <Link className="eyebrow category-label" to={`/${article.category}`}>
          {category ? t(category.name, category.nameBn) : article.category}
        </Link>
        <h3>
          <Link to={`/articles/${article.slug}`}>{articleTitle(article, language)}</Link>
        </h3>
        <p>{t(article.excerpt, article.excerptBn)}</p>
        <div className="article-meta">
          <span>{article.author}</span>
          <span>
            <Clock3 size={13} />
            {article.readTime} {t('min read', 'মিনিট')}
          </span>
        </div>
        {!compact && (
          <div className="card-bottom">
            <span>{formatDate(article.date, language)}</span>
            <Link to={`/articles/${article.slug}`} aria-label={`Read ${article.title}`}>
              <ArrowUpRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
