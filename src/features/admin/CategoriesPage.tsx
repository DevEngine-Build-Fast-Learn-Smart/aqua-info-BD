import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { contentSections, type ContentSection } from '../../data/catalog';
import type { Category } from '../../data/types';
import { api } from '../../lib/api';
import { slugify } from '../../lib/utils';
import { AdminPageHeader } from './AdminPageHeader';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { Modal } from '../../components/ui/Modal';
export default function CategoriesPage() {
  const { data, refresh, notify } = useSite();
  const [section, setSection] = useState<ContentSection>('news'),
    [editing, setEditing] = useState<Category | null>(null),
    [removing, setRemoving] = useState<Category | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    setBusy(true);
    setError('');
    try {
      const { id, entryCount, ...body } = editing;
      void entryCount;
      await api(id ? '/admin/categories/' + encodeURIComponent(id) + '/' : '/admin/categories/', {
        method: id ? 'PATCH' : 'POST',
        body,
      });
      setEditing(null);
      await refresh();
      notify('Category saved.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save category.');
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!removing) return;
    setBusy(true);
    try {
      await api('/admin/categories/' + encodeURIComponent(removing.id) + '/', { method: 'DELETE' });
      setRemoving(null);
      await refresh();
      notify('Category deleted.');
    } catch (reason) {
      throw reason instanceof Error ? reason : new Error('Could not remove category.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <AdminPageHeader
        eyebrow="CONTENT / TOPICS"
        title="Categories"
        description="The workbook’s submenus are organized under their matching content sections. Category addresses remain permanent."
      >
        <button
          className="button button-primary"
          onClick={() => {
            setError('');
            setEditing({
              id: '',
              section,
              slug: '',
              name: '',
              nameBn: '',
              description: '',
              position: data.categories.length,
            });
          }}
        >
          <Plus size={17} />
          Add topic
        </button>
      </AdminPageHeader>
      <nav className="client-topic-tabs">
        {contentSections.map((item) => (
          <button
            key={item.id}
            className={section === item.id ? 'active' : ''}
            onClick={() => setSection(item.id)}
          >
            {item.name}
          </button>
        ))}
      </nav>
      <section className="admin-panel cms-content-list">
        {data.categories
          .filter((item) => item.section === section)
          .map((category) => (
            <article key={category.id}>
              <div>
                <h2>{category.name}</h2>
                <p lang="bn">{category.nameBn}</p>
                <span className="caption">
                  /{category.section}/{category.slug}
                </span>
              </div>
              <div className="cms-row-actions">
                <button
                  className="icon-button"
                  aria-label={'Edit ' + category.name}
                  onClick={() => {
                    setError('');
                    setEditing({ ...category });
                  }}
                >
                  <Pencil size={17} />
                </button>
                <button
                  className="icon-button"
                  aria-label={'Delete ' + category.name}
                  onClick={() => setRemoving(category)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
      </section>
      {editing && (
        <Modal
          title={editing.id ? 'Edit topic' : 'New topic'}
          onClose={() => !busy && setEditing(null)}
        >
          <form onSubmit={save}>
            <fieldset className="cms-fieldset" disabled={busy}>
              <label className="field">
                <span>Content section</span>
                <select
                  value={editing.section}
                  disabled={!!editing.id}
                  onChange={(event) =>
                    setEditing({ ...editing, section: event.target.value as ContentSection })
                  }
                >
                  {contentSections.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Name · English</span>
                <input
                  required
                  maxLength={100}
                  value={editing.name}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      name: event.target.value,
                      ...(!editing.id && !editing.slug
                        ? { slug: slugify(event.target.value) }
                        : {}),
                    })
                  }
                />
              </label>
              <label className="field">
                <span>Name · বাংলা</span>
                <input
                  maxLength={150}
                  value={editing.nameBn}
                  onChange={(event) => setEditing({ ...editing, nameBn: event.target.value })}
                />
              </label>
              <label className="field">
                <span>Permanent topic slug</span>
                <input
                  required
                  disabled={!!editing.id}
                  maxLength={65}
                  value={editing.slug}
                  onChange={(event) =>
                    setEditing({ ...editing, slug: slugify(event.target.value) })
                  }
                />
              </label>
              <label className="field">
                <span>Description</span>
                <textarea
                  maxLength={1500}
                  value={editing.description}
                  onChange={(event) => setEditing({ ...editing, description: event.target.value })}
                />
              </label>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button className="button button-primary" disabled={busy}>
                {busy ? 'Saving…' : 'Save topic'}
              </button>
            </fieldset>
          </form>
        </Modal>
      )}
      {removing && (
        <ConfirmDeleteDialog
          name={removing.name}
          note={
            'A category must be empty before deletion. Move its content to another category first.'
          }
          onClose={() => !busy && setRemoving(null)}
          onConfirm={remove}
        />
      )}
    </>
  );
}
