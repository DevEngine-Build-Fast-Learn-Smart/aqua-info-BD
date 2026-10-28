import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpRight, Plus, Save, Trash2, Waves } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { AdminPageHeader } from './AdminPageHeader';
import { defaultFooter, validFooterHref } from '../../data/footer';
import type { FooterLink, FooterSettings } from '../../data/types';

const textFields = [
  { en: 'folio', bn: 'folioBn', label: 'Top waterline text', multiline: false },
  { en: 'edition', bn: 'editionBn', label: 'Edition label', multiline: false },
  { en: 'headline', bn: 'headlineBn', label: 'Newsletter headline', multiline: false },
  { en: 'subheadline', bn: 'subheadlineBn', label: 'Newsletter second line', multiline: false },
  { en: 'description', bn: 'descriptionBn', label: 'Newsletter description', multiline: true },
  { en: 'signupTitle', bn: 'signupTitleBn', label: 'Sign-up heading', multiline: false },
  { en: 'aboutText', bn: 'aboutTextBn', label: 'About the publication', multiline: true },
  { en: 'bottomText', bn: 'bottomTextBn', label: 'Bottom tagline', multiline: false },
  { en: 'copyright', bn: 'copyrightBn', label: 'Copyright text', multiline: false },
] as const;

export default function FooterPage() {
  const { data, update, notify } = useSite();
  const [form, setForm] = useState<FooterSettings>(() =>
    structuredClone(data.settings.footer ?? defaultFooter),
  );
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [tab, setTab] = useState('content');
  function save(event: FormEvent) {
    event.preventDefault();
    if (!form.headline.trim()) {
      setTab('content');
      setLanguage('en');
      notify('Add an English newsletter headline before saving.');
      return;
    }
    if (
      form.columns.some((column) =>
        column.links.some((link) => !link.label.trim() || !validFooterHref(link.href)),
      )
    ) {
      setTab('links');
      setLanguage('en');
      notify(
        'Every footer link needs an English label and a valid destination. Use a /page path, an https:// link, mailto:, tel:, or an anchor.',
      );
      return;
    }
    const footer: FooterSettings = {
      ...form,
      email: form.email.trim(),
      columns: form.columns.map((column) => ({
        ...column,
        links: column.links.map((link) => ({
          ...link,
          label: link.label.trim(),
          labelBn: link.labelBn.trim(),
          href: link.href.trim(),
        })),
      })),
    };
    if (update((previous) => ({ ...previous, settings: { ...previous.settings, footer } })))
      notify('Website footer saved. The public footer is updated.');
  }
  function changeLink(columnId: string, linkId: string, change: Partial<FooterLink>) {
    setForm((previous) => ({
      ...previous,
      columns: previous.columns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              links: column.links.map((link) =>
                link.id === linkId ? { ...link, ...change } : link,
              ),
            }
          : column,
      ),
    }));
  }
  function moveLink(columnId: string, index: number, direction: number) {
    setForm((previous) => ({
      ...previous,
      columns: previous.columns.map((column) => {
        if (column.id !== columnId) return column;
        const links = [...column.links];
        [links[index], links[index + direction]] = [links[index + direction], links[index]];
        return { ...column, links };
      }),
    }));
  }
  return (
    <form onSubmit={save}>
      <AdminPageHeader
        eyebrow="07 / THE CLOSING SPREAD"
        title="A thoughtful final impression."
        description="Manage the footer’s message, navigation, and finishing details in English and Bangla."
      >
        <button className="button button-primary" type="submit">
          <Save size={17} />
          Save footer
        </button>
      </AdminPageHeader>
      <div className="footer-editor-layout">
        <section className="admin-panel">
          <div className="content-tabs" role="group" aria-label="Footer settings section">
            {[
              ['content', 'Text & identity'],
              ['links', 'Navigation links'],
              ['display', 'Display options'],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={tab === value ? 'active' : ''}
                onClick={() => setTab(value)}
              >
                {label}
              </button>
            ))}
          </div>
          {tab !== 'display' && (
            <div className="footer-editor-language">
              <span className="eyebrow">EDITING LANGUAGE</span>
              <div className="content-tabs" role="group" aria-label="Footer content language">
                <button
                  type="button"
                  className={language === 'en' ? 'active' : ''}
                  onClick={() => setLanguage('en')}
                >
                  English
                </button>
                <button
                  type="button"
                  lang="bn"
                  className={language === 'bn' ? 'active' : ''}
                  onClick={() => setLanguage('bn')}
                >
                  বাংলা
                </button>
              </div>
            </div>
          )}
          {tab === 'content' && (
            <div className="footer-copy-fields">
              {textFields.map((field) => {
                const key = language === 'bn' ? field.bn : field.en;
                return (
                  <label
                    className={`field ${field.multiline ? 'footer-copy-wide' : ''}`}
                    key={field.en}
                  >
                    <span>
                      {field.label.toUpperCase()}
                      {language === 'bn' ? ' · বাংলা' : ''}
                    </span>
                    {field.multiline ? (
                      <textarea
                        rows={3}
                        lang={language}
                        value={form[key]}
                        placeholder={
                          field.en === 'aboutText'
                            ? language === 'bn'
                              ? 'বাংলা বিবরণ লিখুন'
                              : data.settings.description
                            : ''
                        }
                        onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                      />
                    ) : (
                      <input
                        lang={language}
                        value={form[key]}
                        onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                      />
                    )}
                    {field.en === 'aboutText' && (
                      <small>Leave blank to use the publication description.</small>
                    )}
                  </label>
                );
              })}
              <label className="field footer-copy-wide">
                <span>FOOTER CONTACT EMAIL</span>
                <input
                  type="email"
                  value={form.email}
                  placeholder={data.settings.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
                <small>Leave blank to use the publication’s contact email.</small>
              </label>
            </div>
          )}
          {tab === 'links' && (
            <div className="footer-link-columns">
              {form.columns.map((column, columnIndex) => (
                <section className="footer-column-editor" key={column.id}>
                  <div className="footer-column-title">
                    <span>0{columnIndex + 1}</span>
                    <label className="field">
                      <span>COLUMN HEADING{language === 'bn' ? ' · বাংলা' : ''}</span>
                      <input
                        lang={language}
                        value={language === 'bn' ? column.titleBn : column.title}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            columns: form.columns.map((item) =>
                              item.id === column.id
                                ? {
                                    ...item,
                                    [language === 'bn' ? 'titleBn' : 'title']: event.target.value,
                                  }
                                : item,
                            ),
                          })
                        }
                      />
                    </label>
                  </div>
                  <div className="footer-links-editor">
                    {column.links.map((link, index) => (
                      <div className="footer-link-row" key={link.id}>
                        <div className="footer-link-inputs">
                          <label className="field">
                            <span>LINK LABEL{language === 'bn' ? ' · বাংলা' : ''}</span>
                            <input
                              lang={language}
                              value={language === 'bn' ? link.labelBn : link.label}
                              onChange={(event) =>
                                changeLink(column.id, link.id, {
                                  [language === 'bn' ? 'labelBn' : 'label']: event.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="field">
                            <span>DESTINATION</span>
                            <input
                              value={link.href}
                              placeholder="/about or https://example.com"
                              onChange={(event) =>
                                changeLink(column.id, link.id, { href: event.target.value })
                              }
                            />
                          </label>
                        </div>
                        <div className="footer-link-actions">
                          <button
                            type="button"
                            className="icon-button"
                            disabled={index === 0}
                            aria-label={`Move ${link.label || 'link'} up`}
                            onClick={() => moveLink(column.id, index, -1)}
                          >
                            <ArrowUp size={15} />
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            disabled={index === column.links.length - 1}
                            aria-label={`Move ${link.label || 'link'} down`}
                            onClick={() => moveLink(column.id, index, 1)}
                          >
                            <ArrowDown size={15} />
                          </button>
                          <button
                            type="button"
                            className="icon-button danger-hover"
                            aria-label={`Remove ${link.label || 'link'}`}
                            onClick={() =>
                              setForm((previous) => ({
                                ...previous,
                                columns: previous.columns.map((item) =>
                                  item.id === column.id
                                    ? {
                                        ...item,
                                        links: item.links.filter((value) => value.id !== link.id),
                                      }
                                    : item,
                                ),
                              }))
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,
                        columns: previous.columns.map((item) =>
                          item.id === column.id
                            ? {
                                ...item,
                                links: [
                                  ...item.links,
                                  { id: crypto.randomUUID(), label: '', labelBn: '', href: '' },
                                ],
                              }
                            : item,
                        ),
                      }))
                    }
                  >
                    <Plus size={16} />
                    Add a link
                  </button>
                </section>
              ))}
            </div>
          )}
          {tab === 'display' && (
            <div className="footer-display-options">
              {(
                [
                  [
                    'showNewsletter',
                    'The Friday Dispatch',
                    'Show the newsletter message and email sign-up area.',
                  ],
                  [
                    'showSignature',
                    'Large publication signature',
                    'Show the large Aqua Info BD wordmark above the closing line.',
                  ],
                  [
                    'showBackToTop',
                    'Back to the surface',
                    'Show the button that takes readers back to the top of the page.',
                  ],
                ] as const
              ).map(([key, title, description]) => (
                <div key={key}>
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                  <button
                    type="button"
                    className={`switch ${form[key] ? 'switch-on' : ''}`}
                    role="switch"
                    aria-checked={form[key]}
                    aria-label={title}
                    onClick={() => setForm({ ...form, [key]: !form[key] })}
                  >
                    <span />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="panel-footnote">
            Save footer to apply these changes to the public website. Empty Bangla fields use the
            English text.
          </div>
        </section>
        <aside className="footer-editor-aside">
          <div className="footer-editor-preview">
            <span className="eyebrow">
              <Waves size={18} />
              THE CLOSING SPREAD
            </span>
            <h2>
              {form.headline}
              <br />
              <em>{form.subheadline}</em>
            </h2>
            <p>{form.description}</p>
            <div>
              {form.columns.map((column) => (
                <span key={column.id}>{column.title}</span>
              ))}
            </div>
            <small>{form.bottomText}</small>
          </div>
          <div className="admin-panel panel-padding">
            <h3>Your publication, end to end.</h3>
            <p className="muted">
              The logo comes from Publication settings. Footer text, links, and display options are
              managed here.
            </p>
            <Link className="text-link" to="/home" target="_blank" rel="noreferrer">
              Open public website
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </aside>
      </div>
    </form>
  );
}
