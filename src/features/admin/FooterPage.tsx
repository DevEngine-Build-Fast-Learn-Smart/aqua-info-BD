import { useState, type FormEvent } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import type { FooterSettings } from '../../data/types';
import { validFooterHref } from '../../data/footer';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { AdminPageHeader } from './AdminPageHeader';
export default function FooterPage() {
  const { data, update, saving, notify } = useSite();
  const [form, setForm] = useState<FooterSettings>(structuredClone(data.settings.footer)),
    [error, setError] = useState('');
  const [removing, setRemoving] = useState<{ id: string; label: string } | null>(null);
  async function save(event: FormEvent) {
    event.preventDefault();
    if (form.columns.some((column) => column.links.some((link) => !validFooterHref(link.href)))) {
      setError('Use a valid internal path, HTTP(S), email or telephone link.');
      return;
    }
    setError('');
    if (
      await update((previous) => ({
        ...previous,
        settings: { ...previous.settings, footer: form },
      }))
    )
      notify('Website footer saved.');
  }
  return (
    <form onSubmit={save}>
      <AdminPageHeader
        eyebrow="WEBSITE / FOOTER"
        title="Website footer"
        description="Keep the footer aligned with the client’s navigation, platform identity and editorial contact."
      >
        <button className="button button-primary" disabled={saving}>
          <Save size={16} />
          {saving ? 'Saving…' : 'Save footer'}
        </button>
      </AdminPageHeader>
      <fieldset disabled={saving} className="cms-fieldset">
        <section className="admin-panel panel-padding">
          <div className="form-grid">
            {(
              [
                'description',
                'descriptionBn',
                'location',
                'locationBn',
                'bottomText',
                'bottomTextBn',
                'copyright',
                'copyrightBn',
                'email',
              ] as const
            ).map((key) => (
              <label className="field" key={key}>
                <span>
                  {
                    {
                      description: 'Platform description · English',
                      descriptionBn: 'Platform description · বাংলা',
                      location: 'Physical office location · English',
                      locationBn: 'Physical office location · বাংলা',
                      bottomText: 'Signature · English',
                      bottomTextBn: 'Signature · বাংলা',
                      copyright: 'Copyright · English',
                      copyrightBn: 'Copyright · বাংলা',
                      email: 'Footer email (blank uses website email)',
                    }[key]
                  }
                </span>
                <input
                  type={key === 'email' ? 'email' : 'text'}
                  maxLength={key === 'email' ? 254 : 6000}
                  value={form[key] ?? ''}
                  onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                />
              </label>
            ))}
          </div>
          <label className="cms-checkbox">
            <input
              type="checkbox"
              checked={form.showBackToTop}
              onChange={(event) => setForm({ ...form, showBackToTop: event.target.checked })}
            />
            Show Back to top
          </label>
        </section>
        <div className="cms-footer-columns">
          {form.columns.map((column, columnIndex) => (
            <section className="admin-panel panel-padding" key={column.id}>
              <h2>Navigation column {columnIndex + 1}</h2>
              <label className="field">
                <span>Heading · English</span>
                <input
                  required
                  maxLength={200}
                  value={column.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      columns: form.columns.map((item, index) =>
                        index === columnIndex ? { ...item, title: event.target.value } : item,
                      ),
                    })
                  }
                />
              </label>
              <label className="field">
                <span>Heading · বাংলা</span>
                <input
                  maxLength={200}
                  value={column.titleBn}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      columns: form.columns.map((item, index) =>
                        index === columnIndex ? { ...item, titleBn: event.target.value } : item,
                      ),
                    })
                  }
                />
              </label>
              {column.links.map((link, linkIndex) => (
                <div className="cms-footer-link" key={link.id}>
                  {(['label', 'labelBn', 'href'] as const).map((key) => (
                    <label className="field" key={key}>
                      <span>
                        {key === 'label'
                          ? 'Link label'
                          : key === 'labelBn'
                            ? 'লিংকের নাম'
                            : 'Destination'}
                      </span>
                      <input
                        required={key !== 'labelBn'}
                        maxLength={2048}
                        value={link[key]}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            columns: form.columns.map((item, index) =>
                              index === columnIndex
                                ? {
                                    ...item,
                                    links: item.links.map((value, position) =>
                                      position === linkIndex
                                        ? { ...value, [key]: event.target.value }
                                        : value,
                                    ),
                                  }
                                : item,
                            ),
                          })
                        }
                      />
                    </label>
                  ))}
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={'Remove ' + link.label}
                    onClick={() => setRemoving({ id: link.id, label: link.label || 'Footer link' })}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                className="button button-outline button-small"
                type="button"
                disabled={column.links.length >= 20}
                onClick={() =>
                  setForm({
                    ...form,
                    columns: form.columns.map((item, index) =>
                      index === columnIndex
                        ? {
                            ...item,
                            links: [
                              ...item.links,
                              { id: crypto.randomUUID(), label: '', labelBn: '', href: '/' },
                            ],
                          }
                        : item,
                    ),
                  })
                }
              >
                <Plus size={15} />
                Add link
              </button>
            </section>
          ))}
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </fieldset>
      {removing && (
        <ConfirmDeleteDialog
          name={removing.label}
          description="This link will be permanently removed from the website footer."
          onClose={() => !saving && setRemoving(null)}
          onConfirm={async () => {
            const id = removing.id;
            const exists = data.settings.footer.columns.some((column) =>
              column.links.some((link) => link.id === id),
            );
            if (
              exists &&
              !(await update((previous) => ({
                ...previous,
                settings: {
                  ...previous.settings,
                  footer: {
                    ...previous.settings.footer,
                    columns: previous.settings.footer.columns.map((column) => ({
                      ...column,
                      links: column.links.filter((link) => link.id !== id),
                    })),
                  },
                },
              })))
            )
              throw new Error('The footer link could not be deleted. Please try again.');
            setForm((previous) => ({
              ...previous,
              columns: previous.columns.map((column) => ({
                ...column,
                links: column.links.filter((link) => link.id !== id),
              })),
            }));
            notify('Footer link removed.');
          }}
        />
      )}
    </form>
  );
}
