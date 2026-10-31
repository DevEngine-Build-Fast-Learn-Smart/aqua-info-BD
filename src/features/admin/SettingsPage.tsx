import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlus, Link2, LoaderCircle, RotateCcw, Save, ShieldCheck, Upload, CloudSun, Key, Eye, EyeOff, Server, Zap, Activity } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { AdminPageHeader } from './AdminPageHeader';
import { DEFAULT_LOGO, WebsiteLogo } from '../../components/ui/WebsiteLogo';
import { normalizeLogoLink, verifyLogo } from '../../lib/logo';
import { uploadMedia } from '../../lib/api';
export default function SettingsPage() {
  const { data, update, notify, saving, siteName } = useSite();
  const [settings, setSettings] = useState(() => ({ ...data.settings }));
  const [logoLink, setLogoLink] = useState(() =>
    /^https?:\/\//i.test(data.settings.logoUrl || '') ? data.settings.logoUrl! : '',
  );
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoError, setLogoError] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  async function uploadLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setLogoBusy(true);
    setLogoError('');
    try {
      const { url: logoUrl } = await uploadMedia(file, 'image', 'settings');
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
    const saved = await update((previous) => ({
      ...previous,
      settings: {
        ...previous.settings,
        siteTitle: (settings.siteTitle || '').trim(),
        siteTitleBn: (settings.siteTitleBn || '').trim(),
        tagline: settings.tagline,
        taglineBn: settings.taglineBn,
        email: settings.email,
        description: settings.description,
        logoUrl,
        weatherEnabled: settings.weatherEnabled !== false,
        weatherDefaultCity: (settings.weatherDefaultCity || 'Dhaka').trim(),
        weatherDefaultCityBn: (settings.weatherDefaultCityBn || 'ঢাকা').trim(),
        weatherUseDefaultApi: settings.weatherUseDefaultApi !== false,
        weatherApiProvider: settings.weatherApiProvider || 'open-meteo',
        weatherApiKey: (settings.weatherApiKey || '').trim(),
        weatherApiEndpoint: (settings.weatherApiEndpoint || '').trim(),
      },
    }));
    if (!saved) {
      setLogoError('Settings could not be saved. Please check the connection and try again.');
      return;
    }
    setSettings((previous) => ({ ...previous, logoUrl }));
    notify('Publication settings saved.');
  }
  return (
    <form onSubmit={save}>
      <AdminPageHeader
        eyebrow="07 / PUBLICATION SETTINGS"
        title="Website name & identity"
        description="Keep the publication’s identity clear, consistent, and considered."
      >
        <button className="button button-primary" type="submit" disabled={logoBusy || saving}>
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
              <h2>{settings.siteTitle || siteName}</h2>
              <span>Your publication’s visual identity</span>
            </div>
          </div>
          <div className="form-grid website-title-fields">
            <label className="field">
              <span>Website title · English</span>
              <input
                required
                maxLength={160}
                value={settings.siteTitle || ''}
                onChange={(event) => setSettings({ ...settings, siteTitle: event.target.value })}
                placeholder="Your website name"
              />
              <small className="caption">
                Updates the brand name, browser titles, header, footer and admin workspace.
              </small>
            </label>
            <label className="field">
              <span>Website title · বাংলা</span>
              <input
                maxLength={200}
                value={settings.siteTitleBn || ''}
                onChange={(event) => setSettings({ ...settings, siteTitleBn: event.target.value })}
                placeholder="ওয়েবসাইটের নাম"
              />
              <small className="caption">Optional. Used when Bangla is selected.</small>
            </label>
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
                disabled={logoBusy || saving}
              />
              <button
                className="button button-outline"
                type="button"
                onClick={() => uploadRef.current?.click()}
                disabled={logoBusy || saving}
              >
                <Upload size={17} />
                Upload a logo
              </button>
              <span>PNG, JPG, WebP, safe SVG or GIF · up to 5 MB</span>
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
                  disabled={logoBusy || saving}
                />
                <button
                  className="button button-outline"
                  type="button"
                  onClick={applyLogoLink}
                  disabled={logoBusy || saving || !logoLink.trim()}
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
                disabled={logoBusy || saving}
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
          <div className="settings-weather-card">
            <div className="settings-weather-header">
              <div className="settings-weather-title">
                <CloudSun size={20} className="settings-weather-icon" />
                <div>
                  <h4>Live Header Weather</h4>
                  <p className="caption">
                    Shows localized weather in the public website header based on visitor location, with fallback to default city.
                  </p>
                </div>
              </div>
              <label className="switch-toggle" aria-label="Toggle live header weather">
                <input
                  type="checkbox"
                  checked={settings.weatherEnabled !== false}
                  onChange={(e) =>
                    setSettings({ ...settings, weatherEnabled: e.target.checked })
                  }
                />
                <span className="slider" />
              </label>
            </div>
            {settings.weatherEnabled !== false && (
              <>
                <div className="form-grid" style={{ marginTop: '16px' }}>
                  <label className="field">
                    <span>DEFAULT CITY (ENGLISH)</span>
                    <input
                      value={settings.weatherDefaultCity ?? 'Dhaka'}
                      placeholder="Dhaka"
                      onChange={(e) =>
                        setSettings({ ...settings, weatherDefaultCity: e.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>DEFAULT CITY (BANGLA)</span>
                    <input
                      lang="bn"
                      value={settings.weatherDefaultCityBn ?? 'ঢাকা'}
                      placeholder="ঢাকা"
                      onChange={(e) =>
                        setSettings({ ...settings, weatherDefaultCityBn: e.target.value })
                      }
                    />
                  </label>
                </div>

                <div className="weather-api-config-box">
                  <div className="weather-api-config-header">
                    <div className="weather-api-header-info">
                      <div className="weather-api-header-title">
                        <Zap size={16} className="text-teal" />
                        <strong>Weather API Service Provider</strong>
                      </div>
                      <p className="caption">
                        {settings.weatherUseDefaultApi !== false
                          ? 'Using built-in free meteorological service (Open-Meteo). No subscription or API key required.'
                          : 'Connect a commercial or custom weather telemetry provider for specialized forecasting.'}
                      </p>
                    </div>

                    <div className="weather-api-toggle-group">
                      <span className="weather-toggle-label">
                        {settings.weatherUseDefaultApi !== false ? 'Default (Free)' : 'Custom API'}
                      </span>
                      <label className="switch-toggle" aria-label="Toggle default weather API">
                        <input
                          type="checkbox"
                          checked={settings.weatherUseDefaultApi !== false}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              weatherUseDefaultApi: e.target.checked,
                            })
                          }
                        />
                        <span className="slider" />
                      </label>
                    </div>
                  </div>

                  {settings.weatherUseDefaultApi !== false ? (
                    <div className="weather-default-status">
                      <span className="status-badge active">
                        <span className="badge-dot" /> Default Provider Active · Open-Meteo
                      </span>
                      <p className="caption">
                        Includes high-resolution temperature, hourly forecast, humidity, wind, and
                        atmospheric pressure across Bangladesh and worldwide at zero cost.
                      </p>
                    </div>
                  ) : (
                    <div className="weather-custom-fields">
                      <label className="field">
                        <span>SELECT WEATHER PROVIDER</span>
                        <select
                          value={settings.weatherApiProvider || 'openweathermap'}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              weatherApiProvider: e.target.value,
                            })
                          }
                        >
                          <option value="openweathermap">OpenWeatherMap (API 2.5 / 3.0)</option>
                          <option value="weatherapi">WeatherAPI.com (Realtime & Forecast)</option>
                          <option value="custom">Custom REST Endpoint URL</option>
                        </select>
                      </label>

                      <label className="field">
                        <span>API KEY / TOKEN</span>
                        <div className="api-key-input-wrap">
                          <Key size={15} className="api-key-prefix-icon" />
                          <input
                            type={showApiKey ? 'text' : 'password'}
                            value={settings.weatherApiKey || ''}
                            placeholder="Paste your weather provider API key here"
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                weatherApiKey: e.target.value,
                              })
                            }
                          />
                          <button
                            type="button"
                            className="api-key-toggle-btn"
                            onClick={() => setShowApiKey(!showApiKey)}
                            aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                            title={showApiKey ? 'Hide API key' : 'Show API key'}
                          >
                            {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                        <small className="caption">
                          Your key is safely stored and processed securely by the server.
                        </small>
                      </label>

                      {settings.weatherApiProvider === 'custom' && (
                        <label className="field">
                          <span>CUSTOM ENDPOINT URL TEMPLATE</span>
                          <div className="api-key-input-wrap">
                            <Server size={15} className="api-key-prefix-icon" />
                            <input
                              type="url"
                              value={settings.weatherApiEndpoint || ''}
                              placeholder="https://api.yourservice.com/weather?lat={lat}&lon={lon}&key={key}"
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  weatherApiEndpoint: e.target.value,
                                })
                              }
                            />
                          </div>
                          <small className="caption">
                            Supports <code>&#123;lat&#125;</code>, <code>&#123;lon&#125;</code>, and{' '}
                            <code>&#123;key&#125;</code> template placeholders.
                          </small>
                        </label>
                      )}

                      <div className="weather-fallback-note">
                        <span className="caption">
                          💡 <strong>Zero-downtime safety:</strong> If your custom API quota is
                          exceeded or the provider is temporarily unavailable, Aqua Info BD will
                          automatically fallback to the default provider so visitors always see live
                          weather.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
        <aside>
          <section className="admin-panel panel-padding">
            <ShieldCheck size={25} strokeWidth={1.3} />
            <h3>A thoughtful foundation.</h3>
            <dl className="workspace-details">
              <div>
                <dt>Current phase</dt>
                <dd>Connected publication</dd>
              </div>
              <div>
                <dt>Content storage</dt>
                <dd>Server database</dd>
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
              Content, media, and editorial access are saved on the server. Team permissions are
              enforced by the backend. Newsletter delivery and live market data are coming later.
            </p>
          </section>

          <section className="admin-panel panel-padding" style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Activity size={20} className="text-teal" />
              <h4 style={{ margin: 0, fontSize: '15px' }}>Health & Danger Zone</h4>
            </div>
            <p className="caption muted" style={{ marginBottom: '0.85rem' }}>
              Real-time database latency, media storage tracking, server diagnostics, and the Super Admin database reset tool.
            </p>
            <Link to="/admin/system" className="button button-outline" style={{ width: '100%', justifyContent: 'center' }}>
              Website Health & Usages →
            </Link>
          </section>
        </aside>
      </div>
    </form>
  );
}
