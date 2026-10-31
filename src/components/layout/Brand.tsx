import { Link } from 'react-router-dom';
import { useSite } from '../../app/SiteProvider';
import { WebsiteLogo } from '../ui/WebsiteLogo';
export function Brand({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  const { data, t, siteName } = useSite();
  return (
    <Link
      className={`brand ${compact ? 'brand-compact' : ''} ${light ? 'brand-light' : ''}`}
      to="/"
      aria-label={`${siteName} home`}
    >
      <WebsiteLogo />
      <span className="brand-wordmark">
        <strong>{siteName}</strong>
        <small>{t(data.settings.tagline, data.settings.taglineBn)}</small>
      </span>
    </Link>
  );
}
