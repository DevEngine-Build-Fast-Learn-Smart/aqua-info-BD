import { useState, type ReactNode } from 'react';
import { Trash2, LoaderCircle } from 'lucide-react';
import { Modal } from './Modal';
export function ConfirmDeleteDialog({
  name,
  note,
  onConfirm,
  onClose,
  permanent = true,
  description,
}: {
  name: string;
  note?: ReactNode;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
  permanent?: boolean;
  description?: string;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function confirm() {
    setBusy(true);
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Deletion could not be completed. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={permanent ? 'Permanently delete this item?' : 'Remove this image?'}
      onClose={() => !busy && onClose()}
    >
      <div className="delete-confirm-icon">
        <Trash2 size={37} strokeWidth={1.4} />
      </div>
      <p className="delete-confirm-name">{name}</p>
      <p className="delete-confirm-description">
        {description ||
          (permanent
            ? 'This will permanently remove the selected record from the database. This action cannot be undone.'
            : 'This image will be removed from the content gallery when you save your changes.')}
      </p>
      {note && <div className="delete-confirm-note">{note}</div>}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="modal-actions">
        <button
          type="button"
          className="button button-outline"
          disabled={busy}
          autoFocus
          onClick={onClose}
        >
          Cancel
        </button>
        <button type="button" className="button button-danger" disabled={busy} onClick={confirm}>
          {busy ? <LoaderCircle size={17} className="spin" /> : <Trash2 size={17} />}
          {busy ? 'Deleting…' : permanent ? 'Yes, delete permanently' : 'Remove image'}
        </button>
      </div>
    </Modal>
  );
}
