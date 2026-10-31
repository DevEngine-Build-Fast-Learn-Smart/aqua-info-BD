import { useRef, useState } from 'react';
import { Upload, LoaderCircle, X, Image as ImageIcon, FileText } from 'lucide-react';
import { uploadMedia } from '../../lib/api';
import type { ContentSection } from '../../data/catalog';

export function MediaInput({
  label,
  value,
  onChange,
  kind = 'image',
  purpose,
  disabled = false,
  onBusyChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  kind?: 'image' | 'document';
  purpose: ContentSection | 'authors' | 'settings' | 'profile' | 'pages';
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    onBusyChange?.(true);
    setError('');
    try {
      onChange((await uploadMedia(file, kind, purpose)).url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Upload failed.');
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }

  return (
    <div className="media-input">
      <div className="media-input-header">
        <span className="media-input-label">{label}</span>
      </div>

      <div className="media-input-control-group">
        <div className="media-input-box">
          <span className="media-input-prefix-icon" aria-hidden="true">
            {kind === 'image' ? <ImageIcon size={16} /> : <FileText size={16} />}
          </span>
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={
              kind === 'image'
                ? 'Upload an image or paste direct URL…'
                : 'Upload a document or paste URL…'
            }
            disabled={disabled || busy}
          />
          {value && !disabled && !busy && (
            <button
              type="button"
              className="media-input-clear"
              onClick={() => onChange('')}
              title="Clear input"
              aria-label="Clear input"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <input
          ref={input}
          className="sr-only"
          type="file"
          accept={
            kind === 'image'
              ? 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml'
              : '.pdf,.txt,.csv'
          }
          onChange={(event) => {
            void upload(event.target.files?.[0]);
            event.target.value = '';
          }}
        />

        <button
          type="button"
          className="media-upload-btn"
          disabled={disabled || busy}
          onClick={() => input.current?.click()}
        >
          {busy ? <LoaderCircle size={15} className="spin" /> : <Upload size={15} />}
          <span>{busy ? 'Uploading…' : 'Choose file'}</span>
        </button>
      </div>

      <div className="media-upload-meta">
        <span className="caption media-upload-caption">
          {kind === 'image'
            ? 'PNG, JPG, WebP, GIF, safe SVG · up to 5 MB'
            : 'PDF, TXT, CSV · up to 10 MB'}
        </span>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
