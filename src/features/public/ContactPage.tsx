import { ArrowUpRight, Mail } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
export default function ContactPage() {
  const { data, t, siteName } = useSite();
  const email = data.settings.email;
  return (
    <section className="container contact-page client-contact">
      <div className="contact-grid">
        <aside>
          <Mail size={28} />
          <h2>{t('Contact the editorial team', 'সম্পাদকীয় দলের সঙ্গে যোগাযোগ')}</h2>
          <p>
            {t(
              `For story submissions, research contributions, questions or corrections, write to ${siteName}.`,
              `প্রতিবেদন, গবেষণালেখা, প্রশ্ন অথবা সংশোধনের অনুরোধের জন্য ${siteName}-কে লিখুন।`,
            )}
          </p>
          {email && (
            <a className="text-link" href={'mailto:' + email}>
              {email}
              <ArrowUpRight size={17} />
            </a>
          )}
        </aside>
        <div className="client-contact-options">
          <h3>{t('Submissions & corrections', 'লেখা জমা ও সংশোধন')}</h3>
          <p>
            {t(
              'Please include a clear subject, your contact details and the relevant article link or supporting references.',
              'স্পষ্ট বিষয়, আপনার যোগাযোগের তথ্য এবং সংশ্লিষ্ট প্রতিবেদনের লিংক বা তথ্যসূত্র দিন।',
            )}
          </p>
          {email && (
            <div className="client-story-links">
              <a
                className="button button-primary"
                href={`mailto:${email}?subject=${encodeURIComponent('Editorial submission — ' + siteName)}`}
              >
                {t('Submit a contribution', 'লেখা জমা দিন')}
                <ArrowUpRight size={16} />
              </a>
              <a
                className="button button-outline"
                href={`mailto:${email}?subject=${encodeURIComponent('Correction request — ' + siteName)}`}
              >
                {t('Request a correction', 'সংশোধনের অনুরোধ')}
                <ArrowUpRight size={16} />
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
