import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, Waves } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { DispatchSection } from './DispatchSection';
import { VideoSection } from './VideoSection';
import { KnowledgeSection } from './KnowledgeSection';
import { ComingSoon } from '../../components/ui/ComingSoon';
import { EmptyState } from '../../components/ui/EmptyState';
export function VideosPage() {
  return <VideoSection standalone />;
}
export function KnowledgePage() {
  return <KnowledgeSection standalone />;
}
export function SubscriptionPage() {
  return (
    <div className="subscription-page">
      <DispatchSection />
    </div>
  );
}
export function MarketPage() {
  return <ComingSoon title="Market benchmark" titleBn="বাজারদর" />;
}
export function AboutPage() {
  const { data, t } = useSite();
  return (
    <div className="container simple-page about-page">
      <span className="eyebrow">THE AQUA INFO BD JOURNAL</span>
      <h1>{t('Rooted in Bangladesh. Connected by water.', 'বাংলাদেশের শিকড়ে। জলের সংযোগে।')}</h1>
      <p className="about-lead">{data.settings.description}</p>
      <div className="about-grid">
        <div>
          <Waves size={30} strokeWidth={1.2} />
          <h2>{t('Beyond the Water', 'জলের সীমানা ছাড়িয়ে')}</h2>
          <p>
            {t(
              'Aqua Info BD brings together perspectives on aquaculture, fisheries, aquatic science, and the blue economy. Our editorial approach starts with the people and places connected to Bangladesh’s waters.',
              'Aqua Info BD মৎস্য চাষ, মৎস্য খাত, জলজ বিজ্ঞান ও সুনীল অর্থনীতির নানা দৃষ্টিভঙ্গি একত্র করে। বাংলাদেশের জলের সঙ্গে যুক্ত মানুষ ও স্থান থেকেই আমাদের সম্পাদকীয় যাত্রা শুরু।',
            )}
          </p>
          <Link className="text-link" to="/news">
            {t('Explore the journal', 'জার্নাল পড়ুন')}
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <div>
          <Mail size={28} strokeWidth={1.2} />
          <h2>{t('A conversation starts here.', 'এখান থেকেই আলাপ শুরু।')}</h2>
          <p>
            {t(
              'For editorial ideas, research perspectives, or questions about the publication, reach the editorial team.',
              'প্রতিবেদনের ধারণা, গবেষণা বা জার্নাল সম্পর্কে জানতে সম্পাদকীয় দলের সঙ্গে যোগাযোগ করুন।',
            )}
          </p>
          <Link className="text-link" to="/contact">
            {t('Contact the editorial team', 'সম্পাদকীয় দলের সঙ্গে যোগাযোগ')}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
export function NotFoundPage() {
  const { t } = useSite();
  return (
    <EmptyState
      title={t('A little off course.', 'পথটি খুঁজে পাওয়া যায়নি।')}
      description={t(
        'This page couldn’t be found. Let’s get you back to the journal.',
        'জার্নালের হোম পেজে ফিরে যান।',
      )}
      to="/home"
      action={t('Return home', 'হোমে ফিরুন')}
    />
  );
}
