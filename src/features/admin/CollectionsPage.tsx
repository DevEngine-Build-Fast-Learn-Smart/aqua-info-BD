import { useState, type FormEvent } from 'react';
import { ArrowUpRight, BookOpen, Pencil, Plus, Trash2, Video as VideoIcon } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { AdminPageHeader } from './AdminPageHeader';
import { Modal } from '../../components/ui/Modal';
import { MediaInput } from '../../components/ui/MediaInput';
import { LoadingSkeleton, RequestError } from '../../components/ui/DataState';
import { Pagination } from '../../components/ui/Pagination';
import type { Resource, Video } from '../../data/types';
import { assetUrl } from '../../lib/utils';
import { api } from '../../lib/api';
import { useRemoteList } from '../../lib/useRemoteList';

type Entry = Video | Resource;
export default function CollectionsPage({ kind }: { kind: 'videos' | 'resources' }) {
  const { update, notify, remember, refresh, saving } = useSite();
  const [editing, setEditing] = useState<Entry | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [removing, setRemoving] = useState(false);
  const isVideo = kind === 'videos';
  const result = useRemoteList<Entry>(`/admin/${kind}/`, { page });
  function add() {
    const common = {
      id: crypto.randomUUID(),
      title: '',
      titleBn: '',
      description: '',
      status: 'draft' as const,
    };
    setEditing(
      isVideo
        ? { ...common, image: '', mediaUrl: '', descriptionBn: '', duration: '', location: '' }
        : { ...common, type: 'guide', body: '', bodyBn: '', fileUrl: '' },
    );
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    const success = await update((previous) =>
      isVideo
        ? {
            ...previous,
            videos: previous.videos.some((item) => item.id === editing.id)
              ? previous.videos.map((item) => (item.id === editing.id ? (editing as Video) : item))
              : [...previous.videos, editing as Video],
          }
        : {
            ...previous,
            resources: previous.resources.some((item) => item.id === editing.id)
              ? previous.resources.map((item) =>
                  item.id === editing.id ? (editing as Resource) : item,
                )
              : [...previous.resources, editing as Resource],
          },
    );
    if (!success) return;
    setEditing(null);
    notify(`${isVideo ? 'Video report' : 'Knowledge resource'} saved.`);
  }
  async function remove() {
    setRemoving(true);
    try {
      await api(`/admin/${kind}/${deleting}/`, { method: 'DELETE' });
      setDeleting(null);
      notify('Item removed.');
      await refresh();
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : 'The item could not be removed.');
    } finally {
      setRemoving(false);
    }
  }
  return (
    <>
      <AdminPageHeader
        eyebrow={isVideo ? '03 / VIDEO & FIELD REPORTS' : '04 / THE KNOWLEDGE HUB'}
        title={isVideo ? 'See the story differently.' : 'Knowledge worth putting to work.'}
        description={
          isVideo
            ? 'Publish visual stories with uploaded footage or a hosted video link.'
            : 'Publish practical guides, documents, and worksheets.'
        }
      >
        <button className="button button-primary" onClick={add}>
          <Plus size={17} />
          {isVideo ? 'Add a field report' : 'Add a resource'}
        </button>
      </AdminPageHeader>
      {result.loading && <LoadingSkeleton />}
      {result.error && <RequestError message={result.error} retry={result.retry} />}
      {!result.loading && !result.error && (
        <>
          <div className="admin-collection-grid">
            {result.results.map((item) => (
              <article className="admin-panel collection-card" key={item.id}>
                {'image' in item && item.image ? (
                  <div className="collection-image">
                    <img src={assetUrl(item.image)} alt={item.location} />
                    {item.duration && <span>{item.duration}</span>}
                  </div>
                ) : (
                  <div className="collection-resource-icon">
                    {'image' in item ? <VideoIcon size={29} /> : <BookOpen size={29} />}
                    <span className="eyebrow">{'image' in item ? 'Visual report' : item.type}</span>
                  </div>
                )}
                <div className="panel-padding">
                  <div className="collection-meta">
                    <span className={`status-badge ${item.status}`}>{item.status}</span>
                    <span className="caption">
                      {'location' in item ? item.location : 'Knowledge hub'}
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="collection-actions">
                    <button
                      className="text-link"
                      onClick={() => {
                        remember(kind, item);
                        setEditing({ ...item });
                      }}
                    >
                      Edit {isVideo ? 'report' : 'resource'}
                      <Pencil size={14} />
                    </button>
                    <button
                      className="icon-button danger-hover"
                      aria-label={`Remove ${item.title}`}
                      onClick={() => setDeleting(item.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!result.results.length && (
            <div className="admin-empty">
              {isVideo ? <VideoIcon size={30} /> : <BookOpen size={30} />}
              <h3>Your collection starts here.</h3>
              <p>Add the first item to bring this section to life.</p>
            </div>
          )}
          <Pagination page={page} count={result.count} onChange={setPage} />
        </>
      )}
      {editing && (
        <Modal
          title={isVideo ? 'Edit visual field report' : 'Edit knowledge resource'}
          onClose={() => !saving && setEditing(null)}
          wide
        >
          <form onSubmit={save} className="collection-editor">
            <label className="field">
              <span>TITLE *</span>
              <input
                required
                value={editing.title}
                onChange={(event) => setEditing({ ...editing, title: event.target.value })}
              />
            </label>
            <label className="field">
              <span>BANGLA TITLE</span>
              <input
                lang="bn"
                value={editing.titleBn}
                onChange={(event) => setEditing({ ...editing, titleBn: event.target.value })}
              />
            </label>
            <label className="field">
              <span>DESCRIPTION / STORY *</span>
              <textarea
                required
                rows={5}
                value={editing.description}
                onChange={(event) => setEditing({ ...editing, description: event.target.value })}
              />
            </label>
            {'image' in editing ? (
              <>
                <label className="field">
                  <span>BANGLA DESCRIPTION / STORY</span>
                  <textarea
                    lang="bn"
                    rows={5}
                    value={editing.descriptionBn || ''}
                    onChange={(event) =>
                      setEditing({ ...editing, descriptionBn: event.target.value })
                    }
                  />
                </label>
                <div className="form-grid">
                  <label className="field">
                    <span>LOCATION</span>
                    <input
                      value={editing.location}
                      onChange={(event) => setEditing({ ...editing, location: event.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>DURATION (MM:SS, OPTIONAL)</span>
                    <input
                      pattern="[0-9]{1,3}:[0-5][0-9]"
                      placeholder="08:45"
                      value={editing.duration}
                      onChange={(event) => setEditing({ ...editing, duration: event.target.value })}
                    />
                  </label>
                </div>
                <MediaInput
                  value={editing.image}
                  onChange={(value) => setEditing({ ...editing, image: value })}
                  purpose="videos"
                  label="Cover photograph"
                />
                <MediaInput
                  value={editing.mediaUrl || ''}
                  onChange={(value) => setEditing({ ...editing, mediaUrl: value })}
                  kind="video"
                  purpose="videos"
                  label="Video footage"
                />
              </>
            ) : (
              <>
                <label className="field">
                  <span>RESOURCE TYPE</span>
                  <select
                    value={editing.type}
                    onChange={(event) =>
                      setEditing({ ...editing, type: event.target.value as Resource['type'] })
                    }
                  >
                    <option value="guide">Published guide / document</option>
                    <option value="calculator">Pond-volume calculator</option>
                    <option value="worksheet">Feed conversion worksheet</option>
                  </select>
                </label>
                <label className="field">
                  <span>GUIDE TEXT</span>
                  <textarea
                    rows={8}
                    value={editing.body || ''}
                    onChange={(event) => setEditing({ ...editing, body: event.target.value })}
                  />
                </label>
                <label className="field">
                  <span>BANGLA GUIDE TEXT</span>
                  <textarea
                    lang="bn"
                    rows={8}
                    value={editing.bodyBn || ''}
                    onChange={(event) => setEditing({ ...editing, bodyBn: event.target.value })}
                  />
                </label>
                <MediaInput
                  value={editing.fileUrl || ''}
                  onChange={(value) => setEditing({ ...editing, fileUrl: value })}
                  kind="document"
                  purpose="resources"
                  label="Guide document"
                />
              </>
            )}
            <label className="field">
              <span>PUBLICATION STATUS</span>
              <select
                value={editing.status}
                onChange={(event) =>
                  setEditing({ ...editing, status: event.target.value as Entry['status'] })
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published on the website</option>
              </select>
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="button button-outline"
                disabled={saving}
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button className="button button-primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
                <ArrowUpRight size={16} />
              </button>
            </div>
          </form>
        </Modal>
      )}
      {deleting && (
        <Modal title="Remove this item?" onClose={() => !removing && setDeleting(null)}>
          <p>
            This removes the item from the publication. Uploaded files are retained until a media
            cleanup is performed.
          </p>
          <div className="modal-actions">
            <button
              className="button button-outline"
              disabled={removing}
              onClick={() => setDeleting(null)}
            >
              Keep item
            </button>
            <button className="button button-danger" disabled={removing} onClick={remove}>
              {removing ? 'Removing…' : 'Remove item'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
