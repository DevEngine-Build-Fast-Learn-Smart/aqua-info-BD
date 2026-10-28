import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { AdminPageHeader } from './AdminPageHeader';
import { Modal } from '../../components/ui/Modal';
import { slugify } from '../../lib/utils';
import type { Category } from '../../data/types';
export default function CategoriesPage() {
  const { data, update, notify } = useSite();
  const [editing, setEditing] = useState<Category | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  function save(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    const category = { ...editing, id: isNew ? slugify(editing.name) : editing.id };
    const reserved = [
      'admin',
      'home',
      'news',
      'articles',
      'videos',
      'knowledge-hub',
      'market',
      'about',
      'subscription',
      'saved',
    ];
    if (
      !category.id ||
      (isNew &&
        (reserved.includes(category.id) || data.categories.some((c) => c.id === category.id)))
    ) {
      notify('Choose a unique category name. This address is already in use.');
      return;
    }
    update((previous) => ({
      ...previous,
      categories: isNew
        ? [...previous.categories, category]
        : previous.categories.map((c) => (c.id === category.id ? category : c)),
    }));
    setEditing(null);
    notify('Editorial category saved. Public navigation is updated.');
  }
  function remove() {
    update((previous) => ({
      ...previous,
      categories: previous.categories.filter((c) => c.id !== deleting),
    }));
    setDeleting(null);
    notify('Unused category removed.');
  }
  return (
    <>
      <AdminPageHeader
        eyebrow="06 / EDITORIAL CATEGORIES"
        title="Every story has its place."
        description="Keep a clear editorial structure across the publication and its navigation."
      >
        <button
          className="button button-primary"
          onClick={() => {
            setIsNew(true);
            setEditing({ id: '', name: '', nameBn: '', description: '' });
          }}
        >
          <Plus size={17} />
          Add a category
        </button>
      </AdminPageHeader>
      <section className="admin-panel">
        <div className="table-scroll">
          <table className="data-table categories-table">
            <thead>
              <tr>
                <th>EDITORIAL CATEGORY</th>
                <th>PUBLIC ADDRESS</th>
                <th>STORIES</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {data.categories.map((category, index) => {
                const count = data.articles.filter((a) => a.category === category.id).length;
                return (
                  <tr key={category.id}>
                    <td>
                      <div className="category-title">
                        <span>0{index + 1}</span>
                        <div>
                          <strong>{category.name}</strong>
                          <small lang="bn">{category.nameBn}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <a
                        href={`/${category.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-link"
                      >
                        /{category.id}
                        <ArrowUpRight size={13} />
                      </a>
                    </td>
                    <td>{count}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="icon-button"
                          aria-label={`Edit ${category.name}`}
                          onClick={() => {
                            setIsNew(false);
                            setEditing({ ...category });
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-button danger-hover"
                          disabled={count > 0}
                          title={
                            count
                              ? 'Move stories to another category before removing this category'
                              : 'Remove category'
                          }
                          aria-label={`Remove ${category.name}`}
                          onClick={() => setDeleting(category.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      {editing && (
        <Modal
          title={isNew ? 'Add an editorial category' : 'Edit editorial category'}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={save} className="collection-editor">
            <label className="field">
              <span>CATEGORY NAME *</span>
              <input
                required
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </label>
            <label className="field">
              <span>BANGLA NAME</span>
              <input
                lang="bn"
                value={editing.nameBn}
                onChange={(e) => setEditing({ ...editing, nameBn: e.target.value })}
              />
            </label>
            <label className="field">
              <span>DESCRIPTION</span>
              <textarea
                rows={3}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </label>
            <p className="caption">
              Public address: /{isNew ? slugify(editing.name) || 'category-name' : editing.id}
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="button button-outline"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button type="submit" className="button button-primary">
                Save category
              </button>
            </div>
          </form>
        </Modal>
      )}
      {deleting && (
        <Modal title="Remove this category?" onClose={() => setDeleting(null)}>
          <p>This unused category will be removed from the public navigation.</p>
          <div className="modal-actions">
            <button className="button button-outline" onClick={() => setDeleting(null)}>
              Keep category
            </button>
            <button className="button button-danger" onClick={remove}>
              Remove category
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
