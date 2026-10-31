import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { sectionById, type ContentSection } from '../../data/catalog';
import type { Author, Entry } from '../../data/types';
import { api } from '../../lib/api';
import { useRemoteRecord } from '../../lib/useRemoteRecord';
import { useRemoteList } from '../../lib/useRemoteList';
import { slugify, today, assetUrl } from '../../lib/utils';
import { AdminPageHeader } from './AdminPageHeader';
import { LoadingSkeleton, RequestError } from '../../components/ui/DataState';
import { GalleryInput } from '../../components/ui/GalleryInput';
import { MediaInput } from '../../components/ui/MediaInput';
function blank(section: ContentSection, category: string): Entry {
  return {
    id: '',
    gallery: [],
    section,
    category,
    slug: '',
    title: '',
    titleBn: '',
    excerpt: '',
    excerptBn: '',
    body: '',
    bodyBn: '',
    author: '',
    authorProfile: null,
    location: '',
    image: '',
    imageAlt: '',
    date: today(),
    readTime: 5,
    status: 'draft',
    featured: false,
    seoTitle: '',
    seoDescription: '',
    sourceUrl: '',
    audioUrl: '',
    embedUrl: '',
    duration: '',
    episodeNumber: null,
    fileUrl: '',
    doi: '',
    citation: '',
    organization: '',
    employmentType: '',
    salary: '',
    deadline: null,
    applicationUrl: '',
    eventStart: null,
    eventEnd: null,
    venue: '',
    eventFormat: 'in-person',
    registrationUrl: '',
    recordingUrl: '',
  };
}
export default function ContentEditorPage({ section }: { section: ContentSection }) {
  const { id } = useParams(),
    { data } = useSite();
  if (!id)
    return (
      <Editor
        key={'new-' + section}
        initial={blank(section, data.categories.find((item) => item.section === section)?.id || '')}
      />
    );
  return <Existing id={id} section={section} />;
}
function Existing({ id, section }: { id: string; section: ContentSection }) {
  const result = useRemoteRecord<Entry>('/admin/entries/' + encodeURIComponent(id) + '/');
  if (result.loading) return <LoadingSkeleton />;
  if (result.error) return <RequestError message={result.error} retry={result.retry} />;
  if (!result.record || result.record.section !== section)
    return <p>This content does not belong to this section.</p>;
  return <Editor key={result.record.id} initial={result.record} />;
}
function Editor({ initial }: { initial: Entry }) {
  const { data, refresh, notify } = useSite(),
    navigate = useNavigate();
  const [form, setForm] = useState<Entry>({ ...initial }),
    [busy, setBusy] = useState(false),
    [imageBusy, setImageBusy] = useState(false),
    [error, setError] = useState(''),
    [slugEdited, setSlugEdited] = useState(false),
    [authorQuery, setAuthorQuery] = useState('');
  const authors = useRemoteList<Author>('/authors/', { search: authorQuery, page_size: 100 });
  const profiles = [
    ...new Map(
      [...(initial.authorDetails ? [initial.authorDetails] : []), ...authors.results].map(
        (author) => [author.id, author],
      ),
    ).values(),
  ];
  const persistedGallery = useRef(initial.gallery || []);
  async function removeGalleryImage(id: string) {
    if (!initial.id || !persistedGallery.current.some((image) => image.id === id)) return;
    const gallery = persistedGallery.current.filter((image) => image.id !== id);
    await api('/admin/entries/' + initial.id + '/', { method: 'PATCH', body: { gallery } });
    persistedGallery.current = gallery;
    await refresh();
  }
  const section = initial.section,
    config = sectionById(section)!;
  function set<K extends keyof Entry>(key: K, value: Entry[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }
  function field(
    key: keyof Entry,
    label: string,
    options: {
      multiline?: boolean;
      required?: boolean;
      type?: string;
      max?: number;
      hint?: string;
    } = {},
  ) {
    const props = {
      value: String(form[key] ?? ''),
      maxLength: options.max,
      required: options.required,
      disabled: busy,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((previous) => ({ ...previous, [key]: event.target.value })),
    };
    return (
      <label className="field" key={key}>
        <span>{label}</span>
        {options.multiline ? (
          <textarea {...props} rows={key === 'body' || key === 'bodyBn' ? 17 : 4} />
        ) : (
          <input {...props} type={options.type || 'text'} />
        )}
        {options.hint && <small className="caption">{options.hint}</small>}
      </label>
    );
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy || imageBusy) return;
    setBusy(true);
    setError('');
    try {
      const { id, authorDetails, ...body } = form;
      void authorDetails;
      await api(id ? '/admin/entries/' + id + '/' : '/admin/entries/', {
        method: id ? 'PATCH' : 'POST',
        body,
      });
      await refresh();
      notify(
        form.status === 'published'
          ? 'Content saved. Future publish dates go live on that date.'
          : 'Draft saved.',
      );
      navigate('/admin/' + section);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Content could not be saved.');
    } finally {
      setBusy(false);
    }
  }
  function dateTime(value: string | null) {
    return value
      ? new Intl.DateTimeFormat('sv-SE', {
          timeZone: 'Asia/Dhaka',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hourCycle: 'h23',
        })
          .format(new Date(value))
          .replace(' ', 'T')
      : '';
  }
  return (
    <form onSubmit={save}>
      <AdminPageHeader
        eyebrow={'CONTENT / ' + config.name.toUpperCase()}
        title={initial.id ? 'Edit ' + config.name : 'Create ' + config.name}
        description="Write clearly, add the relevant details, then save as a draft or publish."
      >
        <Link className="button button-outline" to={'/admin/' + section}>
          <ArrowLeft size={16} />
          Back
        </Link>
        <button className="button button-primary" disabled={busy || imageBusy}>
          <Save size={16} />
          {busy ? 'Saving…' : 'Save content'}
        </button>
      </AdminPageHeader>
      {error && (
        <p className="form-error cms-form-error" role="alert">
          {error}
        </p>
      )}
      <fieldset disabled={busy} className="cms-editor-layout">
        <div className="cms-editor-main">
          <section className="admin-panel panel-padding">
            <span className="eyebrow">THE CONTENT</span>
            <div className="form-grid">
              <label className="field">
                <span>Title · English</span>
                <input
                  required
                  maxLength={400}
                  value={form.title}
                  onChange={(event) => {
                    const title = event.target.value;
                    setForm((previous) => ({
                      ...previous,
                      title,
                      ...(!initial.id && !slugEdited ? { slug: slugify(title).slice(0, 220) } : {}),
                    }));
                  }}
                />
              </label>
              {field('titleBn', 'Title · বাংলা', { max: 500 })}
            </div>
            <label className="field">
              <span>Permanent URL slug</span>
              <input
                required
                maxLength={220}
                value={form.slug}
                disabled={!!initial.id}
                onChange={(event) => {
                  setSlugEdited(true);
                  set('slug', slugify(event.target.value));
                }}
              />
              <small className="caption">
                /{section}/story/{form.slug || 'your-content-slug'} · The address is fixed after
                creation.
              </small>
            </label>
            <div className="form-grid">
              {field('excerpt', 'Short description · English', { multiline: true, max: 3000 })}
              {field('excerptBn', 'Short description · বাংলা', { multiline: true, max: 4000 })}
            </div>
            {field(
              'body',
              section === 'podcast'
                ? 'Episode notes / transcript · English'
                : 'Full content · English',
              { multiline: true, max: 500000 },
            )}
            {field(
              'bodyBn',
              section === 'podcast'
                ? 'পর্বের বিবরণ / ট্রান্সক্রিপ্ট · বাংলা'
                : 'সম্পূর্ণ বিষয়বস্তু · বাংলা',
              { multiline: true, max: 500000 },
            )}
          </section>
          {section === 'podcast' && (
            <section className="admin-panel panel-padding">
              <h2>Hosted podcast episode</h2>
              <p className="muted">
                Use a dedicated podcast host or object storage. Audio files stay outside the
                application database.
              </p>
              {field('audioUrl', 'Direct hosted audio URL', {
                type: 'url',
                max: 2048,
                hint: 'Use a playable MP3 or other browser-supported audio source.',
              })}
              {field('embedUrl', 'Podcast embed URL', {
                type: 'url',
                max: 2048,
                hint: 'Spotify /embed/, YouTube /embed/, SoundCloud player, Apple Podcasts embed or Captivate player. Paste the URL, not iframe HTML.',
              })}
              <div className="form-grid">
                <label className="field">
                  <span>Episode number</span>
                  <input
                    type="number"
                    min={1}
                    value={form.episodeNumber || ''}
                    onChange={(event) =>
                      set('episodeNumber', event.target.value ? Number(event.target.value) : null)
                    }
                  />
                </label>
                {field('duration', 'Duration', { max: 30, hint: 'For example 32:15.' })}
              </div>
            </section>
          )}
          {section === 'publications' && (
            <section className="admin-panel panel-padding">
              <h2>Publication & research details</h2>
              <MediaInput
                label="Publication document / e-book"
                value={form.fileUrl}
                onChange={(value) => set('fileUrl', value)}
                kind="document"
                purpose={section}
                disabled={busy || imageBusy}
                onBusyChange={setImageBusy}
              />
              {field('doi', 'DOI', { max: 300 })}
              {field('citation', 'Citation / research authors / journal details', {
                multiline: true,
                max: 4000,
              })}
            </section>
          )}
          {section === 'careers' && (
            <section className="admin-panel panel-padding">
              <h2>Opportunity details</h2>
              {field('organization', 'Employer / training provider / funding organization', {
                required: form.status === 'published',
                max: 240,
              })}
              <div className="form-grid">
                {field('employmentType', 'Job type / training / scholarship type', { max: 100 })}
                {field('salary', 'Salary / stipend / funding', { max: 180 })}
              </div>
              <label className="field">
                <span>Application deadline</span>
                <input
                  type="date"
                  value={form.deadline || ''}
                  onChange={(event) => set('deadline', event.target.value || null)}
                />
              </label>
              {field('applicationUrl', 'Official application URL', { type: 'url', max: 2048 })}
            </section>
          )}
          {section === 'events' && (
            <section className="admin-panel panel-padding">
              <h2>Event, registration & archive</h2>
              <div className="form-grid">
                {(['eventStart', 'eventEnd'] as const).map((key) => (
                  <label className="field" key={key}>
                    <span>{key === 'eventStart' ? 'Starts' : 'Ends'} · Asia/Dhaka</span>
                    <input
                      type="datetime-local"
                      value={dateTime(form[key])}
                      required={key === 'eventStart' && form.status === 'published'}
                      onChange={(event) =>
                        set(
                          key,
                          event.target.value
                            ? new Date(event.target.value + ':00+06:00').toISOString()
                            : null,
                        )
                      }
                    />
                  </label>
                ))}
              </div>
              {field('venue', 'Venue / online platform', { max: 300 })}
              <label className="field">
                <span>Event format</span>
                <select
                  value={form.eventFormat}
                  onChange={(event) =>
                    set('eventFormat', event.target.value as Entry['eventFormat'])
                  }
                >
                  <option value="in-person">In person</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </label>
              {field('registrationUrl', 'Registration / official event URL', {
                type: 'url',
                max: 2048,
              })}
              {field('recordingUrl', 'Past-event recording URL', { type: 'url', max: 2048 })}
              <MediaInput
                label="Event materials / resources"
                value={form.fileUrl}
                onChange={(value) => set('fileUrl', value)}
                kind="document"
                purpose={section}
                disabled={busy || imageBusy}
                onBusyChange={setImageBusy}
              />
              <p className="caption">
                Events automatically move to Past Events & Resources after their end date.
              </p>
            </section>
          )}
          <section className="admin-panel panel-padding">
            <GalleryInput
              value={form.gallery || []}
              onChange={(value) => set('gallery', value)}
              purpose={section}
              disabled={busy || imageBusy}
              onBusyChange={setImageBusy}
              onRemove={removeGalleryImage}
            />
            <h2 className="gallery-following-heading">Search & source details</h2>
            {field('seoTitle', 'SEO title', {
              max: 160,
              hint: 'Leave blank to use the content title.',
            })}
            {field('seoDescription', 'SEO description', {
              multiline: true,
              max: 320,
              hint: 'Leave blank to use the short description.',
            })}
            {field('sourceUrl', 'Original source / official reference', { type: 'url', max: 2048 })}
          </section>
        </div>
        <aside className="cms-editor-aside">
          <section className="admin-panel panel-padding">
            <h2>Publishing</h2>
            <label className="field">
              <span>Category</span>
              <select
                required
                value={form.category}
                onChange={(event) => set('category', event.target.value)}
              >
                <option value="">Select a category</option>
                {data.categories
                  .filter((item) => item.section === section)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="field">
              <span>Status</span>
              <select
                value={form.status}
                onChange={(event) => set('status', event.target.value as Entry['status'])}
              >
                <option value="draft">Draft · private</option>
                <option value="published">Published</option>
              </select>
            </label>
            {field('date', 'Publish date · Asia/Dhaka', { type: 'date', required: true })}
            <label className="cms-checkbox">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => set('featured', event.target.checked)}
              />
              Feature on the homepage
            </label>
            <label className="field">
              <span>Reading time · minutes</span>
              <input
                type="number"
                min={1}
                max={120}
                value={form.readTime}
                onChange={(event) => set('readTime', Number(event.target.value))}
              />
            </label>
            {field('location', 'Location / region', { max: 200 })}
          </section>
          <section className="admin-panel panel-padding">
            <h2>Cover image</h2>
            {form.image && (
              <img className="cms-cover-preview" src={assetUrl(form.image)} alt={form.imageAlt} />
            )}
            <MediaInput
              label="Upload or image URL"
              value={form.image}
              onChange={(value) => set('image', value)}
              purpose={section}
              disabled={busy || imageBusy}
              onBusyChange={setImageBusy}
            />
            {field('imageAlt', 'Image alt text', {
              max: 400,
              required: !!form.image && form.status === 'published',
              hint: 'Describe what a reader needs to understand from the image.',
            })}
          </section>
          <section className="admin-panel panel-padding">
            <h2>Author / contributor</h2>
            <label className="field">
              <span>Find a public author profile</span>
              <input
                type="search"
                value={authorQuery}
                onChange={(event) => setAuthorQuery(event.target.value)}
                placeholder="Search name…"
              />
            </label>
            <label className="field">
              <span>Link profile</span>
              <select
                value={form.authorProfile || ''}
                onChange={(event) => set('authorProfile', event.target.value || null)}
              >
                <option value="">No linked profile</option>
                {profiles.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </label>
            {field('author', 'Byline / additional authors', { max: 150 })}
            <p className="caption">
              Public profiles are managed separately from accounts with CMS access.
            </p>
          </section>
        </aside>
      </fieldset>
    </form>
  );
}
