import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import type { Author } from '../../data/types';
import { api } from '../../lib/api';
import { useRemoteList } from '../../lib/useRemoteList';
import { EmptyState } from '../../components/ui/EmptyState';
import { AdminPageHeader } from './AdminPageHeader';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { Modal } from '../../components/ui/Modal';
import { MediaInput } from '../../components/ui/MediaInput';
import { LoadingSkeleton, RequestError } from '../../components/ui/DataState';
import { Pagination } from '../../components/ui/Pagination';
const blank: Author = {
  id: '',
  name: '',
  nameBn: '',
  role: '',
  roleBn: '',
  bio: '',
  bioBn: '',
  image: '',
  imageAlt: '',
  website: '',
  isTeam: false,
  isActive: false,
  position: 0,
};
export default function AuthorsPage() {
  const { refresh, notify, siteName } = useSite();
  const [page, setPage] = useState(1),
    [query, setQuery] = useState(''),
    [editing, setEditing] = useState<Author | null>(null),
    [removing, setRemoving] = useState<Author | null>(null),
    [busy, setBusy] = useState(false),
    [uploadBusy, setUploadBusy] = useState(false),
    [error, setError] = useState('');
  const result = useRemoteList<Author>('/admin/authors/', { page, search: query });
  function open(author: Author) {
    setEditing({ ...author });
    setError('');
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy || uploadBusy) return;
    if (!editing) return;
    setBusy(true);
    setError('');
    try {
      const { id, ...body } = editing;
      await api(id ? '/admin/authors/' + id + '/' : '/admin/authors/', {
        method: id ? 'PATCH' : 'POST',
        body,
      });
      setEditing(null);
      await refresh();
      notify('Author profile saved.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save profile.');
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!removing) return;
    setBusy(true);
    try {
      await api('/admin/authors/' + removing.id + '/', { method: 'DELETE' });
      setRemoving(null);
      await refresh();
      notify('Profile deleted. Existing content has been kept.');
    } catch (reason) {
      throw reason instanceof Error ? reason : new Error('Could not delete profile.');
    } finally {
      setBusy(false);
    }
  }
  function field(key: keyof Author, label: string, multiline = false) {
    if (!editing) return null;
    const props = {
      value: String(editing[key] ?? ''),
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setEditing({ ...editing, [key]: event.target.value }),
      required: key === 'name',
      maxLength:
        key === 'bio'
          ? 10000
          : key === 'bioBn'
            ? 15000
            : key === 'website'
              ? 2048
              : key === 'imageAlt'
                ? 400
                : key === 'name'
                  ? 150
                  : 180,
    };
    return (
      <label className="field">
        <span>{label}</span>
        {multiline ? (
          <textarea {...props} rows={3} style={{ minHeight: '84px', resize: 'vertical' }} />
        ) : (
          <input {...props} type={key === 'website' ? 'url' : 'text'} />
        )}
      </label>
    );
  }
  return (
    <>
      <AdminPageHeader
        eyebrow="PEOPLE / PUBLIC PROFILES"
        title="Authors & Contributors"
        description="Publish the people behind the knowledge. These profiles do not grant administrative access."
      >
        <button className="button button-primary" onClick={() => open(blank)}>
          <Plus size={17} />
          Add profile
        </button>
      </AdminPageHeader>
      <section className="admin-panel panel-padding">
        <label className="field">
          <span>Search profiles</span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </label>
        {result.loading ? (
          <LoadingSkeleton />
        ) : result.error ? (
          <RequestError message={result.error} retry={result.retry} />
        ) : (
          <div className="cms-content-list">
            {result.results.map((author) => (
              <article key={author.id}>
                <div>
                  <span className="eyebrow">
                    {author.isActive ? 'PUBLIC PROFILE' : 'HIDDEN'} ·{' '}
                    {author.isTeam ? 'TEAM' : 'CONTRIBUTOR'}
                  </span>
                  <h2>{author.name}</h2>
                  <p>{author.role}</p>
                </div>
                <div className="cms-row-actions">
                  <button
                    className="icon-button"
                    aria-label={'Edit ' + author.name}
                    onClick={() => open(author)}
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={'Delete ' + author.name}
                    onClick={() => setRemoving(author)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
            {!result.results.length && (
              <EmptyState
                section={'authors'}
                title="No entries have been added yet."
                description="Create the first item to begin. Draft content remains private until you publish it."
              />
            )}
          </div>
        )}
        <Pagination page={page} count={result.count} onChange={setPage} />
      </section>
      {editing && (
        <Modal
          title={editing.id ? 'Edit public profile' : 'New public profile'}
          onClose={() => !busy && !uploadBusy && setEditing(null)}
          wide
        >
          <form onSubmit={save} className="author-modal-form">
            <fieldset disabled={busy} className="cms-fieldset">
              <div className="form-grid">
                {field('name', 'Name · English')}
                {field('nameBn', 'Name · বাংলা')}
                {field('role', 'Role / expertise · English')}
                {field('roleBn', 'Role / expertise · বাংলা')}
              </div>
              <div className="form-grid" style={{ marginTop: '4px' }}>
                {field('bio', 'Biography · English', true)}
                {field('bioBn', 'Biography · বাংলা', true)}
              </div>

              <div className="author-photo-row" style={{ marginTop: '16px' }}>
                <MediaInput
                  label="Profile photo"
                  value={editing.image}
                  onChange={(value) =>
                    setEditing((previous) => (previous ? { ...previous, image: value } : null))
                  }
                  purpose="authors"
                  onBusyChange={setUploadBusy}
                  disabled={busy}
                />
              </div>

              <div className="form-grid" style={{ marginTop: '0' }}>
                {field('imageAlt', 'Photo alt text')}
                <label className="field">
                  <span>Display order</span>
                  <input
                    type="number"
                    min={0}
                    value={editing.position}
                    onChange={(event) =>
                      setEditing({ ...editing, position: Number(event.target.value) })
                    }
                  />
                </label>
              </div>

              <div className="form-grid" style={{ marginTop: '0' }}>
                {field('website', 'Website / public professional profile')}
                <div className="field">
                  <span>Profile status & team</span>
                  <div className="author-checkboxes-inline">
                    <label className="cms-checkbox">
                      <input
                        type="checkbox"
                        checked={editing.isTeam}
                        onChange={(event) => setEditing({ ...editing, isTeam: event.target.checked })}
                      />
                      <span>Member of the {siteName} team</span>
                    </label>
                    <label className="cms-checkbox">
                      <input
                        type="checkbox"
                        checked={editing.isActive}
                        onChange={(event) => setEditing({ ...editing, isActive: event.target.checked })}
                      />
                      <span>Publish profile</span>
                    </label>
                  </div>
                </div>
              </div>

              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <div className="modal-actions" style={{ marginTop: '16px', paddingTop: '16px' }}>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setEditing(null)}
                  disabled={busy || uploadBusy}
                >
                  Cancel
                </button>
                <button className="button button-primary" disabled={busy || uploadBusy}>
                  {busy ? 'Saving…' : 'Save profile'}
                </button>
              </div>
            </fieldset>
          </form>
        </Modal>
      )}
      {removing && (
        <ConfirmDeleteDialog
          name={removing.name}
          note={'Published content linked to this profile will be kept.'}
          onClose={() => !busy && setRemoving(null)}
          onConfirm={remove}
        />
      )}
    </>
  );
}
