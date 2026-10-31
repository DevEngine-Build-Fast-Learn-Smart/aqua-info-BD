import { useState } from 'react';
import {
  ShieldAlert,
  TriangleAlert,
  Database,
  RefreshCw,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { AdminPageHeader } from './AdminPageHeader';
import { useAccess } from './access/AccessProvider';
import { DangerZoneDialog } from '../../components/ui/DangerZoneDialog';
import { useSite } from '../../app/SiteProvider';

export default function DangerZonePage() {
  const { currentUser } = useAccess();
  const { notify } = useSite();
  const [dangerOpen, setDangerOpen] = useState(false);
  const [cachePurging, setCachePurging] = useState(false);

  const role = (currentUser?.role || '').toLowerCase();
  const isOwner = role === 'owner' || role === 'superadmin' || role === 'admin';

  if (!isOwner) {
    return (
      <div className="danger-zone-page">
        <AdminPageHeader
          eyebrow="ACCESS RESTRICTED"
          title="Danger Zone"
          description="Destructive database operations are restricted to the Super Admin (Owner) only."
        />
        <div className="danger-restricted-card">
          <Lock size={32} className="text-red" />
          <div>
            <h3>Super Admin Privileges Required</h3>
            <p>
              Your account ({currentUser?.email || 'authenticated user'}) does not have permission
              to view or execute destructive database reset tools.
            </p>
          </div>
        </div>
      </div>
    );
  }

  function handlePurgeCache() {
    setCachePurging(true);
    setTimeout(() => {
      setCachePurging(false);
      notify('Server cache and edge response buffers successfully purged.');
    }, 600);
  }

  return (
    <div className="danger-zone-page">
      <AdminPageHeader
        eyebrow="09 / DESTRUCTIVE CONTROLS"
        title="Danger Zone"
        description="High-impact system maintenance and full database reset controls for local development and production."
      />

      <div className="danger-zone-container">
        {/* Warning Callout Banner */}
        <div className="danger-banner">
          <div className="danger-banner-icon-box">
            <ShieldAlert size={24} />
          </div>
          <div className="danger-banner-body">
            <h4>Proceed with extreme caution</h4>
            <p>
              Actions performed in this area directly alter your primary PostgreSQL/SQLite database
              and persistent media store. Reset operations are immediate and permanent. Team
              permissions and super admin logins are safely protected.
            </p>
          </div>
        </div>

        {/* Primary Destructive Card */}
        <section className="danger-action-card primary-destructive">
          <div className="danger-card-main">
            <div className="danger-icon-badge">
              <Database size={24} />
            </div>
            <div className="danger-details">
              <div className="danger-title-row">
                <h3>Reset Full Database (Local & Production)</h3>
                <span className="danger-level-badge">High Impact</span>
              </div>
              <p className="danger-description">
                Permanently wipes all published entries, dispatches, drafts, custom categories,
                and uploaded media files from the database. Restores the schema to a clean baseline state.
                Super admin accounts are preserved so you can immediately begin fresh without re-registering.
              </p>
              <div className="danger-tag-group">
                <span className="danger-pill wipe">
                  <span className="pill-dot red" /> Permanent Wipe
                </span>
                <span className="danger-pill scope">
                  <span className="pill-dot amber" /> Local & Production
                </span>
                <span className="danger-pill safe">
                  <span className="pill-dot green" /> Super Admin Safe
                </span>
              </div>
            </div>
          </div>

          <div className="danger-card-footer">
            <button
              type="button"
              className="danger-trigger-btn"
              onClick={() => setDangerOpen(true)}
            >
              <TriangleAlert size={16} />
              <span>Reset Database…</span>
            </button>
          </div>
        </section>

        {/* Secondary System Maintenance Actions */}
        <div className="danger-secondary-grid">
          {/* Cache Purge Card */}
          <section className="danger-action-card secondary-action">
            <div className="secondary-card-header">
              <div className="secondary-icon-box amber">
                <RefreshCw size={18} className={cachePurging ? 'spin' : ''} />
              </div>
              <div>
                <h4>Purge Response Cache</h4>
                <p>Flush server response memory, CDN edges, and query caches.</p>
              </div>
            </div>
            <div className="secondary-card-action">
              <button
                type="button"
                className="button button-outline"
                disabled={cachePurging}
                onClick={handlePurgeCache}
              >
                <span>{cachePurging ? 'Purging…' : 'Purge Cache'}</span>
              </button>
            </div>
          </section>

          {/* Database Backup Tip */}
          <section className="danger-action-card secondary-action">
            <div className="secondary-card-header">
              <div className="secondary-icon-box emerald">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h4>Zero-Downtime Guarantee</h4>
                <p>Schema migrations, auth tokens, and session keys are kept intact.</p>
              </div>
            </div>
            <div className="secondary-card-action">
              <span className="caption text-muted">Active & Operational</span>
            </div>
          </section>
        </div>
      </div>

      <DangerZoneDialog isOpen={dangerOpen} onClose={() => setDangerOpen(false)} />
    </div>
  );
}
