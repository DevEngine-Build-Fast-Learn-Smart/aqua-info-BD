import { useState } from 'react';
import { TriangleAlert, LoaderCircle, X, CheckCircle2, AlertOctagon } from 'lucide-react';
import { api } from '../../lib/api';
import { useSite } from '../../app/SiteProvider';

interface DangerZoneDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONFIRM_KEYWORD = 'RESET DATABASE';

export function DangerZoneDialog({ isOpen, onClose }: DangerZoneDialogProps) {
  const { notify } = useSite();
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isConfirmed = confirmation.trim() === CONFIRM_KEYWORD;

  async function handleReset() {
    if (!isConfirmed || busy) return;
    setBusy(true);
    setError('');
    try {
      await api('/admin/danger-zone/reset-database/', {
        method: 'POST',
        body: { confirmation: CONFIRM_KEYWORD },
      });
      notify('Database has been completely reset to clean state.');
      onClose();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Database reset failed. Check server permissions.');
    } finally {
      setBusy(false);
    }
  }

  function handleQuickFill() {
    setConfirmation(CONFIRM_KEYWORD);
  }

  return (
    <div className="danger-dialog-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="danger-dialog-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="danger-dialog-header">
          <div className="danger-badge-icon">
            <AlertOctagon size={22} />
          </div>
          <div className="danger-dialog-title-group">
            <h3>Reset Entire Database</h3>
            <span className="danger-sub">DESTRUCTIVE ACTION · SUPER ADMIN ONLY</span>
          </div>
          <button
            type="button"
            className="danger-dialog-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="danger-dialog-body">
          <div className="danger-callout">
            <div className="danger-callout-content">
              <p className="danger-callout-lead">
                This operation permanently erases data across both local and production databases:
              </p>
              <ul className="danger-callout-list">
                <li>All published articles, stories, podcasts, and custom pages</li>
                <li>All draft revisions, editorial notes, and tags</li>
                <li>All uploaded images, media files, and thumbnails</li>
              </ul>
            </div>
          </div>

          <div className="danger-safe-notice">
            <CheckCircle2 size={16} className="text-emerald" />
            <span>
              <strong>Safe:</strong> Super admin accounts, roles, and access credentials remain protected.
            </span>
          </div>

          <div className="danger-input-section">
            <div className="danger-input-label-row">
              <label htmlFor="danger-confirm-input" className="danger-confirm-prompt">
                To confirm, type <code className="danger-keyword">{CONFIRM_KEYWORD}</code> below:
              </label>
              <button
                type="button"
                className="danger-quickfill-btn"
                onClick={handleQuickFill}
                title="Quick fill confirmation text"
              >
                Auto-fill
              </button>
            </div>

            <input
              id="danger-confirm-input"
              type="text"
              className={`danger-confirm-input ${isConfirmed ? 'is-valid' : ''}`}
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder={`Type "${CONFIRM_KEYWORD}"`}
              autoFocus
              disabled={busy}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {error && (
            <div className="danger-error-callout">
              <TriangleAlert size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="danger-dialog-actions">
          <button
            type="button"
            className="danger-btn-cancel"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`danger-btn-submit ${isConfirmed ? 'is-active' : 'is-disabled'}`}
            disabled={!isConfirmed || busy}
            onClick={() => void handleReset()}
          >
            {busy ? (
              <>
                <LoaderCircle size={16} className="spin" />
                <span>Erasing Database…</span>
              </>
            ) : (
              <>
                <TriangleAlert size={16} />
                <span>I Understand, Reset Database</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
