import { Link } from 'react-router-dom';
import { useSite } from '../../app/SiteProvider';
import { WebsiteLogo } from '../ui/WebsiteLogo';
export function Brand({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  const { data, t } = useSite();
  return (
    <Link
      className={`brand ${compact ? 'brand-compact' : ''} ${light ? 'brand-light' : ''}`}
      to="/home"
      aria-label="Aqua Info BD home"
    >
      <WebsiteLogo />
      <span className="brand-wordmark">
        <strong>Aqua Info BD</strong>
        <small>{t(data.settings.tagline, data.settings.taglineBn)}</small>
      </span>
    </Link>
  );
}
