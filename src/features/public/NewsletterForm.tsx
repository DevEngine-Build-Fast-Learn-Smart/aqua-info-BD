import { ArrowRight } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const { t, notify } = useSite();
  return (
    <div className={`newsletter-form ${dark ? 'on-dark' : ''}`}>
      <p className="newsletter-coming-soon">
        {t(
          'The Friday Dispatch is under development, coming soon.',
          'শুক্রবারের বার্তা উন্নয়নাধীন, শীঘ্রই আসছে।',
        )}
      </p>
      <button
        type="button"
        className="button button-teal"
        onClick={() => notify(t('Under development, coming soon.', 'উন্নয়নাধীন, শীঘ্রই আসছে।'))}
      >
        {t('Coming soon', 'শীঘ্রই আসছে')}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
