import { Bookmark, Check, Share2 } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import type { Article } from '../../data/types';
export function ArticleActions({ article }: { article: Article }) {
  const { saved, toggleSaved, notify, t } = useSite();
  const isSaved = saved.includes(article.id);
  async function share() {
    const url = `${window.location.origin}/articles/${article.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      notify(t('Story link copied.', 'প্রতিবেদনের লিংক কপি হয়েছে।'));
    } catch {
      notify(t(`Copy this story link: ${url}`, `প্রতিবেদনের লিংক: ${url}`));
    }
  }
  return (
    <div className="article-actions">
      <button
        className={`icon-button ${isSaved ? 'is-saved' : ''}`}
        onClick={() => toggleSaved(article.id)}
        aria-pressed={isSaved}
        aria-label={t(
          isSaved ? 'Remove from reading list' : 'Save to reading list',
          isSaved ? 'সংরক্ষণ বাতিল করুন' : 'সংরক্ষণ করুন',
        )}
      >
        {isSaved ? <Check size={19} /> : <Bookmark size={19} />}
      </button>
      <button
        className="icon-button"
        onClick={share}
        aria-label={t('Copy story link', 'প্রতিবেদনের লিংক কপি করুন')}
      >
        <Share2 size={18} />
      </button>
    </div>
  );
}
