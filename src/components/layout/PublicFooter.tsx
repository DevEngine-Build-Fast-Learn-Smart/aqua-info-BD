import { ArrowUp, ArrowUpRight, MapPin, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSite } from '../../app/SiteProvider';
import { defaultFooter, validFooterHref } from '../../data/footer';
import { Brand } from './Brand';
export function PublicFooter() {
  const { data, t, siteName } = useSite();
  const footer = data.settings.footer || defaultFooter;
  const email = footer.email || data.settings.email;
  return (
    <footer className="public-footer client-footer" id="site-footer">
      <div className="footer-waterlines" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="container">
        <div className="footer-folio">
          <span>
            <Waves size={21} />
            {siteName}
          </span>
          <span>{t('Knowledge. People. Our waters.', 'জ্ঞান। মানুষ। আমাদের জলজ জগৎ।')}</span>
        </div>
        <div className="footer-grid">
          <div className="footer-about">
            <Brand light compact />
            <p>{t(footer.description || data.settings.description, footer.descriptionBn)}</p>
            {email && (
              <a className="footer-contact" href={`mailto:${email}`}>
                {email}
                <ArrowUpRight size={17} />
              </a>
            )}
            {footer.location && (
              <div className="footer-location">
                <MapPin size={16} />
                <span>{t(footer.location, footer.locationBn)}</span>
              </div>
            )}
          </div>
          {footer.columns.map((column) => (
            <div key={column.id}>
              <span className="eyebrow">
                {column.id === 'about' ? siteName : t(column.title, column.titleBn)}
              </span>
              {column.links
                .filter((link) => validFooterHref(link.href))
                .map((link) =>
                  link.href.startsWith('/') ? (
                    <Link key={link.id} to={link.href}>
                      {t(link.label, link.labelBn)}
                    </Link>
                  ) : (
                    <a
                      key={link.id}
                      href={link.href}
                      {...(/^https?:/.test(link.href)
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      {t(link.label, link.labelBn)}
                    </a>
                  ),
                )}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {siteName}. {t(footer.copyright, footer.copyrightBn)}
          </span>
          <span>{t(footer.bottomText, footer.bottomTextBn)}</span>
          {footer.showBackToTop && (
            <button
              className="footer-back-top"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                    ? 'instant'
                    : 'smooth',
                })
              }
            >
              {t('Back to top', 'উপরে যান')}
              <span>
                <ArrowUp size={18} />
              </span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
