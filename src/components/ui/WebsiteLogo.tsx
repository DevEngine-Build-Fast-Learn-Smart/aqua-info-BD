import type { ImgHTMLAttributes } from 'react';
import { useSite } from '../../app/SiteProvider';
import { assetUrl } from '../../lib/utils';

export const DEFAULT_LOGO = '/assets/logo.png';

/** One logo source for the publication, editorial desk, and splash screen. */
export function WebsiteLogo({ src, alt = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const { data } = useSite();
  const effectiveSrc = assetUrl(src || data.settings.logoUrl || DEFAULT_LOGO);
  const fallbackSrc = assetUrl(DEFAULT_LOGO);
  return (
    <img
      {...props}
      src={effectiveSrc}
      alt={alt}
      onError={(event) => {
        if (event.currentTarget.getAttribute('src') !== fallbackSrc) {
          event.currentTarget.src = fallbackSrc;
        }
        props.onError?.(event);
      }}
    />
  );
}
