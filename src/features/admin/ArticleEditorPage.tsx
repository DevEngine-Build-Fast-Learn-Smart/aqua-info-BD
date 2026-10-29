import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Save } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { AdminPageHeader } from './AdminPageHeader';
import { slugify, today } from '../../lib/utils';
import type { Article } from '../../data/types';
import { useRemoteRecord } from '../../lib/useRemoteRecord';
import { LoadingSkeleton, RequestError } from '../../components/ui/DataState';
import { MediaInput } from '../../components/ui/MediaInput';
export default function ArticleEditorPage() {
  const { id } = useParams();
  return id && id !== 'new' ? <ExistingArticleEditor id={id} /> : <ArticleEditor />;
}
function ExistingArticleEditor({ id }: { id: string }) {
  const { record, loading, error, retry } = useRemoteRecord<Article>(
    `/admin/articles/${encodeURIComponent(id)}/`,
  );
  const { data, remember } = useSite();
  useEffect(() => {
    if (record) remember('articles', record);
  }, [record, remember]);
  if (loading || (record && !data.articles.some((article) => article.id === id)))
    return <LoadingSkeleton />;
  if (error || !record)
    return <RequestError message={error || 'This story is unavailable.'} retry={retry} />;
  return <ArticleEditor key={id} />;
}
function ArticleEditor() {
  const { id } = useParams();
  const { data, update, notify, saving } = useSite();
  const navigate = useNavigate();
  const existing = data.articles.find((a) => a.id === id);
  const [form, setForm] = useState<Article>(() =>
    existing
      ? { ...existing }
      : {
          id: crypto.randomUUID(),
          slug: '',
          title: '',
          titleBn: '',
          excerpt: '',
          excerptBn: '',
          body: '',
          bodyBn: '',
          category: data.categories[0]?.id || '',
          author: '',
          location: '',
          image: '',
          imageAlt: '',
          date: today(),
          readTime: 5,
          status: 'draft',
        },
  );
  const [tab, setTab] = useState('en');
  function field<K extends keyof Article>(key: K, value: Article[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setTab('en');
      notify('An English headline is required. Add the headline before saving.');
      return;
    }
    const slug = slugify(form.slug || form.title).slice(0, 220);
    if (!slug) {
      notify('Please enter a valid title or URL slug.');
      return;
    }
    if (data.articles.some((a) => a.id !== form.id && a.slug === slug)) {
      notify('This story URL already exists. Choose a unique slug.');
      return;
    }
    const article = {
      ...form,
      title: form.title.trim(),
      slug,
      imageAlt: form.imageAlt || form.title,
      titleBn: form.titleBn.trim(),
    };
    const succeeded = await update((previous) => ({
      ...previous,
      articles: previous.articles.some((a) => a.id === article.id)
        ? previous.articles.map((a) => (a.id === article.id ? article : a))
        : [article, ...previous.articles],
    }));
    if (!succeeded) return;
    notify(
      article.status === 'published' ? 'Story published to your public website.' : 'Draft saved.',
    );
    navigate('/admin/articles');
  }
  return (
    <>
      <Link className="back-link" to="/admin/articles">
        <ArrowLeft size={15} />
        Back to the story library
      </Link>
      <form onSubmit={save}>
        <AdminPageHeader
          eyebrow="THE STORY EDITOR"
          title={
            existing ? 'Give this story its next chapter.' : 'A new story, a fresh perspective.'
          }
          description="Write with care. Add context. Make it worth the reader’s time."
        >
          <button className="button button-primary" type="submit" disabled={saving}>
            <Save size={16} />
            Save {form.status === 'published' ? '& publish' : 'draft'}
          </button>
        </AdminPageHeader>
        <div className="editor-layout">
          <section className="admin-panel editor-writing">
            <div className="content-tabs" role="group" aria-label="Content language">
              <button
                type="button"
                className={tab === 'en' ? 'active' : ''}
                onClick={() => setTab('en')}
              >
                English
              </button>
              <button
                type="button"
                lang="bn"
                className={tab === 'bn' ? 'active' : ''}
                onClick={() => setTab('bn')}
              >
                বাংলা <span>Kalpurush</span>
              </button>
            </div>
            <div className="editor-fields" hidden={tab !== 'en'}>
              <label className="field">
                <span>STORY HEADLINE *</span>
                <textarea
                  className="headline-input"
                  rows={3}
                  placeholder="The story starts with a good headline…"
                  value={form.title}
                  onChange={(e) => field('title', e.target.value)}
                />
              </label>
              <label className="field">
                <span>STORY SUMMARY</span>
                <textarea
                  rows={3}
                  placeholder="A clear introduction for the reader."
                  value={form.excerpt}
                  onChange={(e) => field('excerpt', e.target.value)}
                />
              </label>
              <label className="field">
                <span>THE STORY</span>
                <textarea
                  className="body-input"
                  rows={14}
                  placeholder="Bring the field to the page. Separate paragraphs with a blank line."
                  value={form.body}
                  onChange={(e) => field('body', e.target.value)}
                />
                <small>
                  Plain text · Separate paragraphs with a blank line. Short standalone lines become
                  section headings.
                </small>
              </label>
            </div>
            <div className="editor-fields" hidden={tab !== 'bn'} lang="bn">
              <label className="field">
                <span>বাংলা শিরোনাম</span>
                <textarea
                  className="headline-input"
                  rows={3}
                  placeholder="প্রতিবেদনের শিরোনাম লিখুন…"
                  value={form.titleBn}
                  onChange={(e) => field('titleBn', e.target.value)}
                />
              </label>
              <label className="field">
                <span>বাংলা সংক্ষিপ্তসার</span>
                <textarea
                  rows={3}
                  value={form.excerptBn}
                  onChange={(e) => field('excerptBn', e.target.value)}
                />
              </label>
              <label className="field">
                <span>মূল প্রতিবেদন</span>
                <textarea
                  className="body-input"
                  rows={14}
                  value={form.bodyBn}
                  onChange={(e) => field('bodyBn', e.target.value)}
                />
              </label>
            </div>
          </section>
          <aside className="editor-settings">
            <section className="admin-panel panel-padding">
              <span className="eyebrow">PUBLICATION DETAILS</span>
              <label className="field">
                <span>STATUS</span>
                <select
                  value={form.status}
                  onChange={(e) => field('status', e.target.value as Article['status'])}
                >
                  <option value="draft">Draft · Editing desk</option>
                  <option value="published">Published · Public website</option>
                </select>
              </label>
              <label className="field">
                <span>CATEGORY *</span>
                <select
                  required
                  value={form.category}
                  onChange={(e) => field('category', e.target.value)}
                >
                  {data.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>AUTHOR *</span>
                <input
                  required
                  value={form.author}
                  onChange={(e) => field('author', e.target.value)}
                  placeholder="Author’s full name"
                />
              </label>
              <label className="field">
                <span>FIELD LOCATION</span>
                <input
                  value={form.location}
                  onChange={(e) => field('location', e.target.value)}
                  placeholder="e.g. Mymensingh"
                />
              </label>
              <div className="form-grid">
                <label className="field">
                  <span>DATE</span>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(e) => field('date', e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>READ TIME (MIN)</span>
                  <input
                    required
                    type="number"
                    min="1"
                    max="120"
                    value={form.readTime}
                    onChange={(e) => field('readTime', Number(e.target.value))}
                  />
                </label>
              </div>
              <label className="field">
                <span>URL SLUG</span>
                <input
                  value={form.slug}
                  onChange={(e) => field('slug', e.target.value)}
                  placeholder={slugify(form.title) || 'your-story-title'}
                />
                <small>
                  /articles/{slugify(form.slug || form.title).slice(0, 220) || 'your-story-title'}
                </small>
              </label>
              {existing?.status === 'published' && (
                <Link
                  className="text-link"
                  target="_blank"
                  rel="noreferrer"
                  to={`/articles/${existing.slug}`}
                >
                  Open public story
                  <ArrowUpRight size={14} />
                </Link>
              )}
            </section>
            <section className="admin-panel panel-padding cover-picker">
              <MediaInput
                value={form.image}
                onChange={(value) => field('image', value)}
                purpose="articles"
                label="Cover photograph"
              />
              <label className="field">
                <span>IMAGE DESCRIPTION</span>
                <input
                  value={form.imageAlt}
                  onChange={(e) => field('imageAlt', e.target.value)}
                  placeholder="Describe the photo for readers"
                />
              </label>
            </section>
            <div className="info-note">
              Drafts remain private. Publishing makes this story available on the public website.
            </div>
          </aside>
        </div>
      </form>
    </>
  );
}
