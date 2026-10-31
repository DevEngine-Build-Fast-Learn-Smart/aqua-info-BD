import { useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSite } from '../../app/SiteProvider';
import type { SitePage } from '../../data/types';
import { api } from '../../lib/api';
import { GalleryInput } from '../../components/ui/GalleryInput';
import { AdminPageHeader } from './AdminPageHeader';
export default function PagesPage() {
  const { data, siteName } = useSite();
  const [selected, setSelected] = useState<SitePage['id']>('about');
  const page = data.pages.find((item) => item.id === selected);
  return (
    <>
      <AdminPageHeader
        eyebrow="ABOUT US / WEBSITE PAGES"
        title="About & Editorial Policy"
        description="Edit the mission, scope, team introduction, contact policy, editorial standards, corrections and submission guidance."
      />
      <nav className="client-topic-tabs" aria-label="Website pages">
        {(['about', 'team', 'editorial-policy'] as const).map((id) => (
          <button
            className={selected === id ? 'active' : ''}
            key={id}
            onClick={() => setSelected(id)}
          >
            {id === 'about'
              ? 'About ' + siteName
              : id === 'team'
                ? 'Our Team & Contributors'
                : 'Contact & Editorial Policy'}
          </button>
        ))}
      </nav>
      {page ? (
        <PageEditor key={page.id} page={page} />
      ) : (
        <p>The website pages need initialization. Run the backend migration/setup command.</p>
      )}
    </>
  );
}
function PageEditor({ page }: { page: SitePage }) {
  const { refresh, notify } = useSite();
  const [form, setForm] = useState({ ...page }),
    [busy, setBusy] = useState(false),
    [imageBusy, setImageBusy] = useState(false),
    [error, setError] = useState('');
  const persistedGallery = useRef(page.gallery || []);
  async function removeGalleryImage(id: string) {
    if (!persistedGallery.current.some((image) => image.id === id)) return;
    const gallery = persistedGallery.current.filter((image) => image.id !== id);
    await api('/admin/pages/' + page.id + '/', { method: 'PATCH', body: { gallery } });
    persistedGallery.current = gallery;
    await refresh();
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy || imageBusy) return;
    setBusy(true);
    setError('');
    try {
      const { id, ...body } = form;
      await api('/admin/pages/' + id + '/', { method: 'PATCH', body });
      await refresh();
      notify('Page saved.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save page.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save} className="admin-panel panel-padding">
      <fieldset disabled={busy} className="cms-fieldset">
        <div className="form-grid">
          {(['title', 'titleBn'] as const).map((key) => (
            <label className="field" key={key}>
              <span>{key === 'title' ? 'Title · English' : 'Title · বাংলা'}</span>
              <input
                required={key === 'title'}
                maxLength={key === 'title' ? 300 : 400}
                value={form[key]}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
              />
            </label>
          ))}
        </div>
        {page.id === 'editorial-policy' && (
          <p className="cms-editor-note">
            Include editorial standards, factual corrections, submission instructions and contact
            guidance here. The contact form and publication email appear below this content.
          </p>
        )}
        {(['body', 'bodyBn'] as const).map((key) => (
          <label className="field" key={key}>
            <span>{key === 'body' ? 'Full page · English' : 'সম্পূর্ণ পাতা · বাংলা'}</span>
            <textarea
              rows={15}
              maxLength={500000}
              value={form[key]}
              onChange={(event) => setForm({ ...form, [key]: event.target.value })}
            />
          </label>
        ))}
        <GalleryInput
          value={form.gallery || []}
          onChange={(gallery) => setForm((previous) => ({ ...previous, gallery }))}
          purpose="pages"
          disabled={busy}
          onBusyChange={setImageBusy}
          onRemove={removeGalleryImage}
        />
        <div className="form-grid">
          <label className="field">
            <span>SEO title</span>
            <input
              maxLength={160}
              value={form.seoTitle}
              onChange={(event) => setForm({ ...form, seoTitle: event.target.value })}
            />
          </label>
          <label className="field">
            <span>SEO description</span>
            <textarea
              maxLength={320}
              rows={3}
              value={form.seoDescription}
              onChange={(event) => setForm({ ...form, seoDescription: event.target.value })}
            />
          </label>
        </div>
        <label className="field">
          <span>Visibility</span>
          <select
            value={form.status}
            onChange={(event) =>
              setForm({ ...form, status: event.target.value as SitePage['status'] })
            }
          >
            <option value="draft">Draft · private</option>
            <option value="published">Published</option>
          </select>
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <Link
            className="button button-outline"
            to={
              page.id === 'about'
                ? '/about'
                : page.id === 'team'
                  ? '/about/team'
                  : '/about/contact-editorial-policy'
            }
            target="_blank"
          >
            View page
            <ArrowUpRight size={16} />
          </Link>
          <button className="button button-primary" disabled={busy || imageBusy}>
            <Save size={16} />
            {busy ? 'Saving…' : 'Save page'}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
