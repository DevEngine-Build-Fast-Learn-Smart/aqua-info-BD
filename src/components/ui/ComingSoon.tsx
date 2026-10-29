import { Link } from 'react-router-dom';
import { Waves } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
export function ComingSoon({ title, titleBn }: { title: string; titleBn?: string }) {
  const { t } = useSite();
  return (
    <section className="coming-soon container">
      <Waves size={38} strokeWidth={1.2} />
      <span className="eyebrow">AQUA INFO BD</span>
      <h1>{t(title, titleBn)}</h1>
      <h2>{t('Under development, coming soon.', 'উন্নয়নাধীন, শীঘ্রই আসছে।')}</h2>
      <p>
        {t(
          'We’re preparing this part of the publication. Explore the latest stories while it takes shape.',
          'প্রকাশনার এই অংশটি প্রস্তুত হচ্ছে। এর মধ্যে সর্বশেষ প্রতিবেদন পড়ুন।',
        )}
      </p>
      <Link className="button button-primary" to="/news">
        {t('Read the latest stories', 'সর্বশেষ প্রতিবেদন পড়ুন')}
      </Link>
    </section>
  );
}
