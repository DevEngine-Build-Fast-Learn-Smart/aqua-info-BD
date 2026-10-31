import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSite } from '../../app/SiteProvider';
import type { Entry } from '../../data/types';
import { useRemoteList } from '../../lib/useRemoteList';
import { AdminPageHeader } from './AdminPageHeader';
export default function HomepagePage() {
  const { data, update, saving, notify, siteName } = useSite();
  const [query, setQuery] = useState('');
  const choices = useRemoteList<Entry>('/entries/', { search: query, page_size: 100 });
  const options = [
    ...new Map([...data.featured, ...choices.results].map((entry) => [entry.id, entry])).values(),
  ];
  async function move(index: number, direction: number) {
    if (
      await update((previous) => {
        const sections = [...previous.sections];
        [sections[index], sections[index + direction]] = [
          sections[index + direction],
          sections[index],
        ];
        return { ...previous, sections };
      })
    )
      notify('Homepage order updated.');
  }
  return (
    <>
      <AdminPageHeader
        eyebrow="HOME / CONTENT DISCOVERY"
        title="The front page"
        description={`Highlight important news, articles, podcasts and publications, followed by the newest content across ${siteName}.`}
      >
        <Link className="button button-outline" to="/" target="_blank">
          Preview homepage
          <ArrowUpRight size={16} />
        </Link>
      </AdminPageHeader>
      <div className="homepage-editor-grid">
        <section className="admin-panel">
          <div className="panel-heading">
            <h2>Sections, in sequence</h2>
            <span className="caption">
              {data.sections.filter((item) => item.enabled).length} visible
            </span>
          </div>
          <div className="section-order-list">
            {data.sections.map((section, index) => (
              <div className="section-order-item" key={section.id}>
                <span className="section-index">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{section.name}</strong>
                  <small lang="bn">{section.nameBn}</small>
                </div>
                <div className="section-order-controls">
                  <button
                    className="icon-button"
                    disabled={saving || index === 0}
                    aria-label={'Move ' + section.name + ' up'}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    className="icon-button"
                    disabled={saving || index === data.sections.length - 1}
                    aria-label={'Move ' + section.name + ' down'}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    role="switch"
                    aria-checked={section.enabled}
                    aria-label={'Show ' + section.name}
                    disabled={saving}
                    className={`switch ${section.enabled ? 'switch-on' : ''}`}
                    onClick={async () => {
                      if (
                        await update((previous) => ({
                          ...previous,
                          sections: previous.sections.map((item) =>
                            item.id === section.id ? { ...item, enabled: !item.enabled } : item,
                          ),
                        }))
                      )
                        notify('Homepage visibility updated.');
                    }}
                  >
                    <span />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="admin-panel panel-padding">
          <span className="eyebrow">FEATURED CONTENT</span>
          <h2>Choose the opening story.</h2>
          <p className="muted">
            Any published news, blog, podcast or publication can lead the homepage. Mark additional
            entries as Featured in their editors.
          </p>
          <label className="field">
            <span>Find published content</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title or author…"
            />
          </label>
          <label className="field">
            <span>Opening feature</span>
            <select
              disabled={saving}
              value={data.settings.featuredEntryId || ''}
              onChange={async (event) => {
                const featuredEntryId = event.target.value || null;
                if (
                  await update((previous) => ({
                    ...previous,
                    settings: { ...previous.settings, featuredEntryId },
                  }))
                )
                  notify('Opening feature saved.');
              }}
            >
              <option value="">Use featured selections only</option>
              {options.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.title}
                </option>
              ))}
            </select>
          </label>
          {choices.error && <p role="alert">{choices.error}</p>}
          <p className="caption">
            Future-dated content appears publicly on its publish date. Drafts never appear on the
            public homepage.
          </p>
        </section>
      </div>
    </>
  );
}
