import { useState, type FormEvent } from 'react';
import { ArrowUpRight, BookOpen, Pencil, Plus, Trash2, Video as VideoIcon } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { AdminPageHeader } from './AdminPageHeader';
import { Modal } from '../../components/ui/Modal';
import type { Resource, Video } from '../../data/types';

type Entry = Video | Resource;
export default function CollectionsPage({ kind }: { kind: 'videos' | 'resources' }) {
  const { data, update, notify } = useSite();
  const [editing, setEditing] = useState<Entry | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const isVideo = kind === 'videos';
  const items = data[kind];
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
        ? { ...common, image: '/assets/images/field-dispatch.jpg', duration: '00:00', location: '' }
        : { ...common, type: 'guide' },
    );
  }
  function save(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    update((previous) =>
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
    setEditing(null);
    notify(
      `${isVideo ? 'Video report' : 'Knowledge resource'} saved to the local content library.`,
    );
  }
  function remove() {
    update((previous) =>
      isVideo
        ? { ...previous, videos: previous.videos.filter((item) => item.id !== deleting) }
        : { ...previous, resources: previous.resources.filter((item) => item.id !== deleting) },
    );
    setDeleting(null);
    notify('Item removed from the local content library.');
  }
  return (
    <>
      <AdminPageHeader
        eyebrow={isVideo ? '03 / VIDEO & FIELD REPORTS' : '04 / THE KNOWLEDGE HUB'}
        title={isVideo ? 'See the story differently.' : 'Knowledge worth putting to work.'}
        description={
          isVideo
            ? 'Curate the visual stories that bring the field closer to your readers.'
            : 'Manage practical guides, calculators, and worksheets in one place.'
        }
      >
        <button className="button button-primary" onClick={add}>
          <Plus size={17} />
          {isVideo ? 'Add a field report' : 'Add a resource'}
        </button>
      </AdminPageHeader>
      <div className="info-note collection-note">
        {isVideo
          ? 'Video cards are interactive UI previews. Media hosting will be connected in the backend phase.'
          : 'Calculator, guide, and worksheet types use the built-in pond-volume calculator, observation checklist, and FCR worksheet.'}
      </div>
      <div className="admin-collection-grid">
        {items.map((item) => (
          <article className="admin-panel collection-card" key={item.id}>
            {'image' in item ? (
              <div className="collection-image">
                <img src={item.image} alt={item.location} />
                <span>{item.duration}</span>
              </div>
            ) : (
              <div className="collection-resource-icon">
                <BookOpen size={29} strokeWidth={1.2} />
                <span className="eyebrow">{item.type}</span>
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
                <button className="text-link" onClick={() => setEditing({ ...item })}>
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
      {!items.length && (
        <div className="admin-empty">
          {isVideo ? <VideoIcon size={30} /> : <BookOpen size={30} />}
          <h3>Your collection starts here.</h3>
          <p>Add the first item to bring this section to life.</p>
        </div>
      )}
      {editing && (
        <Modal
          title={isVideo ? 'Edit visual field report' : 'Edit knowledge resource'}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={save} className="collection-editor">
            <label className="field">
              <span>TITLE *</span>
              <input
                required
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </label>
            <label className="field">
              <span>BANGLA TITLE</span>
              <input
                lang="bn"
                value={editing.titleBn}
                onChange={(e) => setEditing({ ...editing, titleBn: e.target.value })}
              />
            </label>
            <label className="field">
              <span>DESCRIPTION *</span>
              <textarea
                required
                rows={3}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </label>
            {'image' in editing ? (
              <>
                <div className="form-grid">
                  <label className="field">
                    <span>LOCATION</span>
                    <input
                      value={editing.location}
                      onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>DURATION (MM:SS)</span>
                    <input
                      required
                      pattern="[0-9]{2,3}:[0-5][0-9]"
                      title="Use minutes and seconds, e.g. 08:45"
                      value={editing.duration}
                      onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
                    />
                  </label>
                </div>
                <label className="field">
                  <span>COVER PHOTO</span>
                  <select
                    value={editing.image}
                    onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                  >
                    {['field-dispatch', 'shrimp-farm', 'biofloc-research'].map((name) => (
                      <option key={name} value={`/assets/images/${name}.jpg`}>
                        {name.replaceAll('-', ' ')}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <label className="field">
                <span>RESOURCE TYPE</span>
                <select
                  value={editing.type}
                  onChange={(e) =>
                    setEditing({ ...editing, type: e.target.value as Resource['type'] })
                  }
                >
                  <option value="calculator">Pond-volume calculator</option>
                  <option value="guide">Field observation checklist</option>
                  <option value="worksheet">Feed conversion worksheet</option>
                </select>
              </label>
            )}
            <label className="field">
              <span>PUBLICATION STATUS</span>
              <select
                value={editing.status}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value as Entry['status'] })
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published in public preview</option>
              </select>
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="button button-outline"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button className="button button-primary" type="submit">
                Save locally
                <ArrowUpRight size={16} />
              </button>
            </div>
          </form>
        </Modal>
      )}
      {deleting && (
        <Modal title="Remove this item?" onClose={() => setDeleting(null)}>
          <p>This removes the item from the local content library and the public preview.</p>
          <div className="modal-actions">
            <button className="button button-outline" onClick={() => setDeleting(null)}>
              Keep item
            </button>
            <button className="button button-danger" onClick={remove}>
              Remove item
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
