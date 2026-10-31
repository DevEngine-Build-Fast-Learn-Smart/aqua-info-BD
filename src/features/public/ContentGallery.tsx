import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Expand } from 'lucide-react';
import type { GalleryImage } from '../../data/types';
import { useSite } from '../../app/SiteProvider';
import { assetUrl } from '../../lib/utils';
import { Modal } from '../../components/ui/Modal';
export function ContentGallery({ images = [] }: { images?: GalleryImage[] }) {
  const { t } = useSite();
  const [active, setActive] = useState<number | null>(null);
  useEffect(() => {
    if (active === null || !images.length) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight')
        setActive((value) => (value === null ? null : (value + 1) % images.length));
      if (event.key === 'ArrowLeft')
        setActive((value) => (value === null ? null : (value - 1 + images.length) % images.length));
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [active, images.length]);
  if (!images.length) return null;
  const selected = active === null ? null : images[active];
  return (
    <section className="content-gallery" aria-label={t('Image gallery', 'ছবির গ্যালারি')}>
      <div className="content-gallery-grid">
        {images.map((image, index) => (
          <figure key={image.id}>
            <button
              onClick={() => setActive(index)}
              aria-label={t('Expand image: ', 'ছবি বড় করুন: ') + image.alt}
            >
              <img src={assetUrl(image.url)} alt={image.alt} loading="lazy" />
              <span>
                <Expand size={18} />
              </span>
            </button>
            {(image.caption || image.captionBn) && (
              <figcaption>{t(image.caption, image.captionBn)}</figcaption>
            )}
          </figure>
        ))}
      </div>
      {selected && active !== null && (
        <Modal
          wide
          title={t('Image gallery', 'ছবির গ্যালারি') + ` · ${active + 1}/${images.length}`}
          onClose={() => setActive(null)}
        >
          <figure className="gallery-lightbox">
            <img src={assetUrl(selected.url)} alt={selected.alt} />
            {(selected.caption || selected.captionBn) && (
              <figcaption>{t(selected.caption, selected.captionBn)}</figcaption>
            )}
          </figure>
          {images.length > 1 && (
            <div className="gallery-lightbox-controls">
              <button
                className="button button-outline"
                onClick={() => setActive((active - 1 + images.length) % images.length)}
              >
                <ArrowLeft size={17} />
                {t('Previous', 'আগের ছবি')}
              </button>
              <button
                className="button button-outline"
                onClick={() => setActive((active + 1) % images.length)}
              >
                {t('Next', 'পরের ছবি')}
                <ArrowRight size={17} />
              </button>
            </div>
          )}
        </Modal>
      )}
    </section>
  );
}
