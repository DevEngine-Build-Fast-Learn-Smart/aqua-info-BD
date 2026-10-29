import { Link } from 'react-router-dom';
import { useSite } from '../../app/SiteProvider';
export function MarketStrip() {
  const { t } = useSite();
  return (
    <div className="market-strip">
      <div className="container market-inner">
        <Link className="market-badge" to="/market">
          {t('AQUA MARKET', 'মৎস্য বাজার')}
        </Link>
        <Link className="market-coming-soon" to="/market">
          {t(
            'Market benchmark · Under development, coming soon.',
            'বাজারদর · উন্নয়নাধীন, শীঘ্রই আসছে।',
          )}
        </Link>
      </div>
    </div>
  );
}
