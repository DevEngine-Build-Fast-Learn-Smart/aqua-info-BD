import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ImagePlus, Link2, LoaderCircle, RotateCcw, Save, ShieldCheck, Upload } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { AdminPageHeader } from './AdminPageHeader';
import { DEFAULT_LOGO, WebsiteLogo } from '../../components/ui/WebsiteLogo';
import { normalizeLogoLink, readLogoFile, verifyLogo } from '../../lib/logo';
export default function SettingsPage() {
  const { data, update, notify } = useSite();
  const [settings, setSettings] = useState(() => ({ ...data.settings }));
  const [logoLink, setLogoLink] = useState(() =>
    /^https?:\/\//i.test(data.settings.logoUrl || '') ? data.settings.logoUrl! : '',
  );
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoError, setLogoError] = useState('');
  const uploadRef = useRef<HTMLInputElement>(null);
  async function uploadLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setLogoBusy(true);
    setLogoError('');
    try {
      const logoUrl = await readLogoFile(file);
      setSettings((previous) => ({ ...previous, logoUrl }));
      setLogoLink('');
    } catch (error) {
      setLogoError(error instanceof Error ? error.message : 'The logo could not be opened.');
    } finally {
      setLogoBusy(false);
    }
  }
  async function applyLogoLink() {
    if (!logoLink.trim()) {
      setLogoError('Paste a direct image link first.');
      return;
    }
    setLogoBusy(true);
    setLogoError('');
    try {
      const logoUrl = normalizeLogoLink(logoLink);
      await verifyLogo(logoUrl);
      setSettings((previous) => ({ ...previous, logoUrl }));
      setLogoLink(logoUrl);
    } catch (error) {
      setLogoError(error instanceof Error ? error.message : 'Use a valid direct image link.');
    } finally {
      setLogoBusy(false);
    }
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (logoBusy) return;
    let logoUrl = settings.logoUrl || DEFAULT_LOGO;
    if (logoLink.trim() && logoLink.trim() !== logoUrl) {
      setLogoBusy(true);
      setLogoError('');
      try {
        logoUrl = normalizeLogoLink(logoLink);
        await verifyLogo(logoUrl);
      } catch (error) {
        setLogoError(error instanceof Error ? error.message : 'Use a valid direct image link.');
        return;
      } finally {
        setLogoBusy(false);
      }
    }
    const saved = update((previous) => ({
      ...previous,
      settings: {
        ...previous.settings,
        tagline: settings.tagline,
        taglineBn: settings.taglineBn,
        email: settings.email,
        description: settings.description,
        logoUrl,
      },
    }));
    if (!saved) {
      setLogoError(
        'Settings could not be saved. Try a smaller logo or use an image link if browser storage is full.',
      );
      return;
    }
    setSettings((previous) => ({ ...previous, logoUrl }));
    notify('Publication settings saved to this browser.');
  }
  return (
    <form onSubmit={save}>
      <AdminPageHeader
        eyebrow="07 / PUBLICATION SETTINGS"
        title="The details behind the journal."
        description="Keep the publication’s identity clear, consistent, and considered."
      >
        <button className="button button-primary" type="submit" disabled={logoBusy}>
          {logoBusy ? <LoaderCircle className="spin" size={16} /> : <Save size={16} />}
          {logoBusy ? 'Preparing logo…' : 'Save settings'}
        </button>
      </AdminPageHeader>
      <div className="settings-grid">
        <section className="admin-panel panel-padding">
          <span className="eyebrow">PUBLICATION IDENTITY</span>
          <div className="settings-brand">
            <WebsiteLogo src={settings.logoUrl || DEFAULT_LOGO} alt="Website logo preview" />
            <div>
              <h2>Aqua Info BD</h2>
              <span>Your publication’s visual identity</span>
            </div>
          </div>
          <section className="logo-settings" aria-labelledby="logo-settings-title">
            <div className="logo-settings-heading">
              <ImagePlus size={21} />
              <div>
                <h3 id="logo-settings-title">Website logo</h3>
                <p>One logo for the header, footer, editorial desk, and splash screen.</p>
              </div>
            </div>
            <div className="logo-upload-row">
              <input
                ref={uploadRef}
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                onChange={uploadLogo}
                aria-label="Upload website logo"
                disabled={logoBusy}
              />
              <button
                className="button button-outline"
                type="button"
                onClick={() => uploadRef.current?.click()}
                disabled={logoBusy}
              >
                <Upload size={17} />
                Upload a logo
              </button>
              <span>PNG, JPG, WebP, SVG or GIF · up to 2 MB</span>
            </div>
            <label className="field">
              <span>OR USE A DIRECT IMAGE LINK</span>
              <div className="logo-link-field">
                <Link2 size={18} />
                <input
                  type="url"
                  value={logoLink}
                  onChange={(event) => {
                    setLogoLink(event.target.value);
                    setLogoError('');
                  }}
                  placeholder="https://example.com/your-logo.png"
                  aria-label="Website logo image link"
                  disabled={logoBusy}
                />
                <button
                  className="button button-outline"
                  type="button"
                  onClick={applyLogoLink}
                  disabled={logoBusy || !logoLink.trim()}
                >
                  Use link
                </button>
              </div>
            </label>
            {logoError && (
              <p className="form-error" role="alert">
                {logoError}
              </p>
            )}
            <div className="logo-settings-footer">
              <span>Save settings to apply your logo across the website.</span>
              <button
                className="text-link"
                type="button"
                disabled={logoBusy}
                onClick={() => {
                  setSettings((previous) => ({ ...previous, logoUrl: DEFAULT_LOGO }));
                  setLogoLink('');
                  setLogoError('');
                }}
              >
                <RotateCcw size={14} />
                Restore original
              </button>
            </div>
          </section>
          <div className="form-grid">
            <label className="field">
              <span>TAGLINE *</span>
              <input
                required
                maxLength={70}
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              />
            </label>
            <label className="field">
              <span>BANGLA TAGLINE</span>
              <input
                lang="bn"
                maxLength={70}
                value={settings.taglineBn}
                onChange={(e) => setSettings({ ...settings, taglineBn: e.target.value })}
              />
            </label>
          </div>
          <label className="field">
            <span>EDITORIAL CONTACT *</span>
            <input
              required
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            />
          </label>
          <label className="field">
            <span>PUBLICATION DESCRIPTION *</span>
            <textarea
              required
              rows={4}
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
            />
          </label>
        </section>
        <aside>
          <section className="admin-panel panel-padding">
            <ShieldCheck size={25} strokeWidth={1.3} />
            <h3>A thoughtful foundation.</h3>
            <dl className="workspace-details">
              <div>
                <dt>Current phase</dt>
                <dd>Frontend UI</dd>
              </div>
              <div>
                <dt>Content storage</dt>
                <dd>This browser</dd>
              </div>
              <div>
                <dt>Public entry</dt>
                <dd>/home</dd>
              </div>
              <div>
                <dt>Editorial desk</dt>
                <dd>/admin/</dd>
              </div>
              <div>
                <dt>Bangla typeface</dt>
                <dd>Kalpurush · Local</dd>
              </div>
            </dl>
            <p className="caption muted">
              Login, roles, and team permissions are local UI demonstrations. Backend
              authentication, shared accounts, permanent storage, and email delivery belong to the
              next phase.
            </p>
          </section>
        </aside>
      </div>
    </form>
  );
}
