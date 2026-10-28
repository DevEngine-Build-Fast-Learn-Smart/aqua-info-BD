import { Link } from 'react-router-dom';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
export function MarketStrip() {
  const { data, t } = useSite();
  return (
    <div className="market-strip">
      <div className="container market-inner">
        <Link className="market-badge" to="/market">
          {t('AQUA MARKET', 'মৎস্য বাজার')}
        </Link>
        <span className="market-region">{t('Farm-gate benchmark', 'খামার পর্যায়ের দর')}</span>
        <div className="market-rates">
          {data.market.map((rate) => (
            <Link to="/market" key={rate.id}>
              <strong>{t(rate.species, rate.speciesBn)}</strong>
              <span>
                ৳{rate.price.toLocaleString('en-IN')}
                <small>/kg</small>
              </span>
              <span className={`rate-change ${rate.change < 0 ? 'negative' : ''}`}>
                {rate.change > 0 ? (
                  <TrendingUp size={13} />
                ) : rate.change < 0 ? (
                  <TrendingDown size={13} />
                ) : (
                  '—'
                )}
                {rate.change ? `${Math.abs(rate.change)}%` : ''}
              </span>
            </Link>
          ))}
        </div>
        <span className="market-demo">
          <span className="status-dot" />
          {t('Sample prices', 'নমুনা দর')}
        </span>
      </div>
    </div>
  );
}
