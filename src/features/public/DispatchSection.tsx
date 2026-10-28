import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { NewsletterForm } from './NewsletterForm';

export function DispatchSection() {
  const { t } = useSite();
  return (
    <section className="dispatch-section section-space" id="subscription">
      <div className="container">
        <div className="dispatch-panel">
          <div>
            <span className="eyebrow">
              <span className="tiny-square" />
              THE FRIDAY DISPATCH · সাপ্তাহিক বার্তা
            </span>
            <h2>
              {t(
                'Fisheries intelligence. A more informed perspective.',
                'মৎস্য খাতের খবর। আরও সমৃদ্ধ দৃষ্টিভঙ্গি।',
              )}
            </h2>
            <p>
              {t(
                'A weekly reading list for people who care about aquaculture, aquatic science, and the communities connected by water.',
                'মৎস্য চাষ, জলজ বিজ্ঞান ও জলের সঙ্গে যুক্ত মানুষের জন্য সাপ্তাহিক পাঠের আয়োজন।',
              )}
            </p>
            <NewsletterForm />
          </div>
          <aside>
            <BookOpen size={28} strokeWidth={1.3} />
            <span className="eyebrow">THE AQUA INFO BD JOURNAL</span>
            <h3>{t('Made for a deeper read.', 'গভীরভাবে জানার জন্য।')}</h3>
            <p>
              {t(
                'Field reports, research perspectives, and practical knowledge, brought together with care.',
                'মাঠ প্রতিবেদন, গবেষণার দৃষ্টিভঙ্গি ও ব্যবহারিক জ্ঞানের যত্নশীল সমন্বয়।',
              )}
            </p>
            <Link className="text-link" to="/about">
              {t('Meet the publication', 'জার্নাল সম্পর্কে জানুন')}
              <ArrowUpRight size={16} />
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
