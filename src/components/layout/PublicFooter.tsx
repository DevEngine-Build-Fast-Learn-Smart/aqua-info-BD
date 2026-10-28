import { ArrowUp, ArrowUpRight, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSite } from '../../app/SiteProvider';
import { NewsletterForm } from '../../features/public/NewsletterForm';
import { defaultFooter, validFooterHref } from '../../data/footer';
import { Brand } from './Brand';

export function PublicFooter() {
  const { data, t } = useSite();
  const footer = data.settings.footer ?? defaultFooter;
  const email = footer.email || data.settings.email;
  return (
    <footer className="public-footer" id="site-footer">
      <div className="footer-waterlines" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="container">
        <div className="footer-folio">
          <span>
            <Waves size={21} />
            {t(footer.folio, footer.folioBn)}
          </span>
          <span>{t(footer.edition, footer.editionBn)}</span>
        </div>
        {footer.showNewsletter && (
          <div className="footer-dispatch">
            <div>
              <span className="eyebrow">THE FRIDAY DISPATCH · সাপ্তাহিক বুলেটিন</span>
              <h2>
                {t(footer.headline, footer.headlineBn)}
                <br />
                <em>{t(footer.subheadline, footer.subheadlineBn)}</em>
              </h2>
              <p>{t(footer.description, footer.descriptionBn)}</p>
            </div>
            <div className="footer-signup">
              <span className="footer-signup-index">
                01 / {t('A LETTER FROM THE DESK', 'সম্পাদকীয় ডেস্কের চিঠি')}
              </span>
              <h3>{t(footer.signupTitle, footer.signupTitleBn)}</h3>
              <NewsletterForm dark />
            </div>
          </div>
        )}
        <div className="footer-grid">
          <div className="footer-about">
            <Brand light compact />
            <p>{t(footer.aboutText || data.settings.description, footer.aboutTextBn)}</p>
            <a className="footer-contact" href={`mailto:${email}`}>
              {email}
              <ArrowUpRight size={17} />
            </a>
          </div>
          {footer.columns.map((column, index) => (
            <div key={column.id}>
              <span className="eyebrow">
                {String(index + 1).padStart(2, '0')} / {t(column.title, column.titleBn)}
              </span>
              {column.links
                .filter((link) => validFooterHref(link.href))
                .map((link) =>
                  link.href.startsWith('/') ? (
                    <Link key={link.id} to={link.href}>
                      {t(link.label, link.labelBn)}
                      {link.href.startsWith('/admin') && <ArrowUpRight size={15} />}
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
                      {/^https?:/.test(link.href) && <ArrowUpRight size={15} />}
                    </a>
                  ),
                )}
            </div>
          ))}
        </div>
        {footer.showSignature && (
          <div className="footer-signature" aria-hidden="true">
            <span>
              Aqua Info BD<span>↗</span>
            </span>
            <Waves strokeWidth={0.6} />
          </div>
        )}
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Aqua Info BD. {t(footer.copyright, footer.copyrightBn)}
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
              {t('Back to the surface', 'উপরে ফিরে যান')}
              <span>
                <ArrowUp size={19} />
              </span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
