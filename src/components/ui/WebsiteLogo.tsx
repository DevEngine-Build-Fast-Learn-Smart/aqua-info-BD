import type { ImgHTMLAttributes } from 'react';
import { useSite } from '../../app/SiteProvider';

export const DEFAULT_LOGO = '/assets/logo.png';

/** One logo source for the publication, editorial desk, and splash screen. */
export function WebsiteLogo({ src, alt = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const { data } = useSite();
  return (
    <img
      {...props}
      src={src || data.settings.logoUrl || DEFAULT_LOGO}
      alt={alt}
      onError={(event) => {
        if (event.currentTarget.getAttribute('src') !== DEFAULT_LOGO) {
          event.currentTarget.src = DEFAULT_LOGO;
        }
        props.onError?.(event);
      }}
    />
  );
}
