import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Link2, LoaderCircle, Trash2, Upload } from 'lucide-react';
import type { GalleryImage } from '../../data/types';
import type { ContentSection } from '../../data/catalog';
import { uploadMedia } from '../../lib/api';
import { assetUrl } from '../../lib/utils';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
export function GalleryInput({
  value,
  onChange,
  purpose,
  disabled = false,
  onBusyChange,
  onRemove,
}: {
  value: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  purpose: ContentSection | 'pages';
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
  onRemove?: (id: string) => Promise<void>;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [removing, setRemoving] = useState<GalleryImage | null>(null);
  const maximum = 30;
  function image(source: string): GalleryImage {
    return { id: crypto.randomUUID(), url: source, alt: '', caption: '', captionBn: '' };
  }
  function addLink() {
    try {
      const parsed = new URL(url.trim());
      if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password)
        throw new Error();
      if (value.length >= maximum) {
        setError('A gallery supports up to 30 images.');
        return;
      }
      onChange([...value, image(parsed.href)]);
      setUrl('');
      setError('');
    } catch {
      setError('Use a direct HTTP or HTTPS image link.');
    }
  }
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const selected = Array.from(files);
    if (selected.length + value.length > maximum) {
      setError('A gallery supports up to 30 images. Select fewer files.');
      return;
    }
    setBusy(true);
    onBusyChange?.(true);
    setError('');
    const added: GalleryImage[] = [];
    try {
      for (const file of selected) {
        const result = await uploadMedia(file, 'image', purpose);
        added.push(image(result.url));
        onChange([...value, ...added]);
      }
    } catch (reason) {
      setError(
        (reason instanceof Error ? reason.message : 'Upload failed.') +
          (added.length ? ` ${added.length} image(s) were added successfully.` : ''),
      );
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }
  function change(id: string, key: 'alt' | 'caption' | 'captionBn', text: string) {
    onChange(value.map((item) => (item.id === id ? { ...item, [key]: text } : item)));
  }
  function move(index: number, direction: number) {
    const images = [...value];
    [images[index], images[index + direction]] = [images[index + direction], images[index]];
    onChange(images);
  }
  return (
    <section className="gallery-editor">
      <div className="gallery-editor-heading">
        <div>
          <h2>
            <ImagePlus size={23} />
            Content image gallery
          </h2>
          <p>
            Add several images by upload or link. Set their order, captions and descriptive alt
            text.
          </p>
        </div>
        <span className="caption">
          {value.length} / {maximum}
        </span>
      </div>
      <div className="gallery-add-tools">
        <input
          ref={fileInput}
          type="file"
          className="sr-only"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          multiple
          disabled={disabled || busy}
          onChange={(event) => {
            void upload(event.target.files);
            event.target.value = '';
          }}
        />
        <button
          className="button button-outline"
          type="button"
          disabled={disabled || busy || value.length >= maximum}
          onClick={() => fileInput.current?.click()}
        >
          {busy ? <LoaderCircle size={18} className="spin" /> : <Upload size={18} />}
          {busy ? 'Uploading images…' : 'Upload multiple images'}
        </button>
        <div className="gallery-link-input">
          <Link2 size={18} />
          <input
            type="url"
            value={url}
            disabled={disabled || busy}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/image.jpg"
            aria-label="Gallery image URL"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addLink();
              }
            }}
          />
          <button
            type="button"
            disabled={disabled || busy || !url.trim() || value.length >= maximum}
            onClick={addLink}
          >
            Add image
          </button>
        </div>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="gallery-editor-list">
        {value.map((item, index) => (
          <article key={item.id}>
            <div className="gallery-edit-preview">
              <img
                src={assetUrl(item.url)}
                alt={item.alt || 'Gallery image preview'}
                loading="lazy"
              />
              <span>{String(index + 1).padStart(2, '0')}</span>
            </div>
            <div>
              <label className="field">
                <span>Alt text · required before publishing</span>
                <input
                  maxLength={400}
                  value={item.alt}
                  disabled={disabled || busy}
                  onChange={(event) => change(item.id, 'alt', event.target.value)}
                  placeholder="Describe the image for screen readers"
                />
              </label>
              <div className="form-grid">
                <label className="field">
                  <span>Caption · English</span>
                  <textarea
                    rows={2}
                    maxLength={1500}
                    value={item.caption}
                    disabled={disabled || busy}
                    onChange={(event) => change(item.id, 'caption', event.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Caption · বাংলা</span>
                  <textarea
                    rows={2}
                    maxLength={2000}
                    value={item.captionBn}
                    disabled={disabled || busy}
                    onChange={(event) => change(item.id, 'captionBn', event.target.value)}
                  />
                </label>
              </div>
            </div>
            <div className="gallery-edit-actions">
              <button
                type="button"
                className="icon-button"
                disabled={disabled || busy || index === 0}
                aria-label={`Move image ${index + 1} up`}
                onClick={() => move(index, -1)}
              >
                <ArrowUp size={17} />
              </button>
              <button
                type="button"
                className="icon-button"
                disabled={disabled || busy || index === value.length - 1}
                aria-label={`Move image ${index + 1} down`}
                onClick={() => move(index, 1)}
              >
                <ArrowDown size={17} />
              </button>
              <button
                type="button"
                className="icon-button danger-text"
                disabled={disabled || busy}
                aria-label={`Remove image ${index + 1}`}
                onClick={() => setRemoving(item)}
              >
                <Trash2 size={17} />
              </button>
            </div>
          </article>
        ))}
      </div>
      {!value.length && (
        <div className="gallery-editor-empty">
          <ImagePlus size={32} strokeWidth={1.2} />
          <p>No gallery images added. Your cover image is managed separately.</p>
        </div>
      )}
      {removing && (
        <ConfirmDeleteDialog
          permanent={!!onRemove}
          description="This image will be removed from the gallery. This action cannot be undone."
          name={removing.caption || removing.alt || 'Gallery image'}
          onClose={() => setRemoving(null)}
          onConfirm={async () => {
            if (onRemove) await onRemove(removing.id);
            onChange(value.filter((item) => item.id !== removing.id));
          }}
        />
      )}
    </section>
  );
}
