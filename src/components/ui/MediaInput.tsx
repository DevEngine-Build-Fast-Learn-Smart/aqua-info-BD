import { useRef, useState } from 'react';
import { Link2, LoaderCircle, Upload } from 'lucide-react';
import { uploadMedia } from '../../lib/api';
import { assetUrl } from '../../lib/utils';

export function MediaInput({
  value,
  onChange,
  kind = 'image',
  purpose,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  kind?: 'image' | 'video' | 'document';
  purpose: 'articles' | 'videos' | 'resources' | 'settings';
  label: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const accepts = {
    image: 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml',
    video: 'video/mp4,video/webm,video/quicktime,.mov,.m4v',
    document: '.pdf,.txt,.csv',
  };
  return (
    <div className="media-input">
      <span className="eyebrow">{label}</span>
      {kind === 'image' && value && (
        <img className="media-input-preview" src={assetUrl(value)} alt="Selected image" />
      )}
      <label className="field">
        <span>DIRECT URL</span>
        <div className="search-field">
          <Link2 size={16} />
          <input
            type="url"
            value={value.startsWith('/') ? '' : value}
            onChange={(event) => {
              onChange(event.target.value);
              setError('');
            }}
            placeholder="https://…"
            aria-label={`${label} URL`}
            disabled={busy}
          />
        </div>
      </label>
      <input
        className="sr-only"
        ref={input}
        type="file"
        accept={accepts[kind]}
        aria-label={`Upload ${label}`}
        disabled={busy}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (!file) return;
          setBusy(true);
          setError('');
          try {
            const result = await uploadMedia(file, kind, purpose);
            onChange(result.url);
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : 'The upload failed.');
          } finally {
            setBusy(false);
          }
        }}
      />
      <div className="media-input-actions">
        <button
          type="button"
          className="button button-outline"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          {busy ? <LoaderCircle className="spin" size={16} /> : <Upload size={16} />}
          {busy ? 'Uploading…' : `Upload ${kind === 'document' ? 'document' : kind}`}
        </button>
        {value && (
          <button type="button" className="text-link" disabled={busy} onClick={() => onChange('')}>
            Remove
          </button>
        )}
      </div>
      <small>
        {kind === 'image'
          ? 'PNG, JPG, WebP, GIF or safe SVG · up to 5 MB'
          : kind === 'video'
            ? 'MP4, WebM or MOV · up to 100 MB. Hosted YouTube and Vimeo links are also supported.'
            : 'PDF, TXT or CSV · up to 10 MB'}
      </small>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
