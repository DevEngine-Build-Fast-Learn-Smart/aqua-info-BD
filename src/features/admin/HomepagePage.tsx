import { useState } from 'react';
import { useRemoteList } from '../../lib/useRemoteList';
import type { Article } from '../../data/types';
import { ArrowDown, ArrowUp, ArrowUpRight, GripVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSite } from '../../app/SiteProvider';
import { AdminPageHeader } from './AdminPageHeader';
export default function HomepagePage() {
  const { data, update, notify, saving } = useSite();
  const [query, setQuery] = useState('');
  const choices = useRemoteList<Article>('/articles/', { search: query, page_size: 100 });
  const publishedChoices = [
    ...new Map(
      [
        ...data.articles.filter(
          (article) => article.status === 'published' && article.id === data.settings.leadArticleId,
        ),
        ...choices.results,
      ].map((article) => [article.id, article]),
    ).values(),
  ];
  async function move(index: number, direction: number) {
    const saved = await update((previous) => {
      const sections = [...previous.sections];
      [sections[index], sections[index + direction]] = [
        sections[index + direction],
        sections[index],
      ];
      return { ...previous, sections };
    });
    if (saved) notify('Homepage order updated.');
  }
  const destinations: Record<string, string> = {
    lead: '/admin/articles',
    news: '/admin/articles',
    videos: '/admin/videos',
    knowledge: '/admin/resources',
    economy: '/admin/articles',
    newsletter: '/admin/settings',
  };
  return (
    <>
      <AdminPageHeader
        eyebrow="01 / THE FRONT PAGE"
        title="An intentional first impression."
        description="Set the lead, arrange the sections, and shape the reader’s journey."
      >
        <Link className="button button-outline" to="/home" target="_blank" rel="noreferrer">
          Preview homepage
          <ArrowUpRight size={16} />
        </Link>
      </AdminPageHeader>
      <div className="homepage-editor-grid">
        <section className="admin-panel">
          <div className="panel-heading">
            <div>
              <span className="tiny-square" />
              <h2>The publication, in sequence</h2>
            </div>
            <span className="caption">
              {data.sections.filter((s) => s.enabled).length} active sections
            </span>
          </div>
          <div className="section-order-list">
            {data.sections.map((section, index) => (
              <div
                className={`section-order-item ${!section.enabled ? 'section-disabled' : ''}`}
                key={section.id}
              >
                <GripVertical className="order-grip" size={18} />
                <span className="section-index">0{index + 1}</span>
                <div>
                  <strong>{section.name}</strong>
                  <small lang="bn">{section.nameBn}</small>
                </div>
                <div className="section-order-controls">
                  <button
                    className="icon-button"
                    disabled={saving || index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`Move ${section.name} up`}
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    className="icon-button"
                    disabled={saving || index === data.sections.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`Move ${section.name} down`}
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    disabled={saving}
                    role="switch"
                    aria-checked={section.enabled}
                    aria-label={`Show ${section.name}`}
                    className={`switch ${section.enabled ? 'switch-on' : ''}`}
                    onClick={async () => {
                      const saved = await update((previous) => ({
                        ...previous,
                        sections: previous.sections.map((s) =>
                          s.id === section.id ? { ...s, enabled: !s.enabled } : s,
                        ),
                      }));
                      if (saved)
                        notify(
                          `${section.name} ${section.enabled ? 'hidden from' : 'shown on'} the homepage.`,
                        );
                    }}
                  >
                    <span />
                  </button>
                  <Link
                    className="icon-button"
                    to={destinations[section.id]}
                    aria-label={`Edit content for ${section.name}`}
                  >
                    <ArrowUpRight size={17} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="panel-footnote">
            Use the arrows to change section order. Switch a section off to hide it from the
            homepage.
          </div>
        </section>
        <aside>
          <section className="admin-panel panel-padding">
            <span className="eyebrow">THE LEAD STORY</span>
            <h3>Give the most important story the first word.</h3>
            <label className="field">
              <span>FIND A PUBLISHED STORY</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search story titles…"
              />
            </label>
            {choices.error && <p className="form-error">{choices.error}</p>}
            <label className="field">
              <span>FEATURED ARTICLE</span>
              <select
                disabled={saving}
                value={data.settings.leadArticleId}
                onChange={async (e) => {
                  const leadId = e.currentTarget.value;
                  const saved = await update((previous) => ({
                    ...previous,
                    settings: { ...previous.settings, leadArticleId: leadId },
                  }));
                  if (saved) notify('Homepage lead story updated.');
                }}
              >
                {!publishedChoices.length && <option value="">No published stories</option>}
                {publishedChoices.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </label>
            <p className="muted caption">
              Choose from published stories. The field dossier fills automatically from the rest of
              your library.
            </p>
          </section>
          <div className="editorial-callout">
            <span>THE READER’S JOURNEY</span>
            <p>
              A clear beginning.
              <br />A thoughtful sequence.
              <br />A reason to keep reading.
            </p>
            <i />
          </div>
        </aside>
      </div>
    </>
  );
}
