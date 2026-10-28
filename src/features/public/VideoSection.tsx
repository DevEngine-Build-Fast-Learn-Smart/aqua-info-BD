import { useState } from 'react';
import { MapPin, Play, Video as VideoIcon } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { Modal } from '../../components/ui/Modal';
import { SectionHeading } from './SectionHeading';
import type { Video } from '../../data/types';

export function VideoSection({ standalone = false }: { standalone?: boolean }) {
  const { data, t } = useSite();
  const [active, setActive] = useState<Video | null>(null);
  const videos = data.videos.filter((video) => video.status === 'published');
  return (
    <section className={`video-section section-space ${standalone ? 'standalone-section' : ''}`}>
      <div className="container">
        <SectionHeading
          eyebrow={t('DOCUMENTARY JOURNALISM · দৃশ্যমান গল্প', 'ডকুমেন্টারি · দৃশ্যমান গল্প')}
          title={t('Video & Field Reports', 'ভিডিও ও মাঠ প্রতিবেদন')}
          subtitle={t(
            'Visual stories from Bangladesh’s waterways, hatcheries, and coastal ghers.',
            'বাংলাদেশের নদী, হ্যাচারি ও উপকূলীয় ঘের থেকে দৃশ্যমান গল্প।',
          )}
          to={standalone ? undefined : '/videos'}
          action={t('View all videos', 'সব ভিডিও')}
        />
        <div className="video-grid">
          {videos.map((video, index) => (
            <article className={`video-card ${index === 0 ? 'video-featured' : ''}`} key={video.id}>
              <button
                className="video-cover"
                onClick={() => setActive(video)}
                aria-label={`${t('Preview', 'প্রিভিউ')} ${t(video.title, video.titleBn)}`}
              >
                <img src={video.image} alt={video.location} loading="lazy" />
                <span className="video-duration">
                  {index === 0 ? 'DOCUMENTARY · ' : ''}
                  {video.duration}
                </span>
                <span className="play-button">
                  <Play size={23} fill="currentColor" />
                </span>
                <span className="video-location">
                  <MapPin size={12} />
                  {video.location}
                </span>
              </button>
              <div className="video-content">
                <span className="eyebrow">{t('FIELD NOTES IN MOTION', 'মাঠের গল্প ভিডিওতে')}</span>
                <h3>
                  <button onClick={() => setActive(video)}>{t(video.title, video.titleBn)}</button>
                </h3>
                <p>{video.description}</p>
                <button className="text-link" onClick={() => setActive(video)}>
                  {t('Preview field report', 'প্রতিবেদন প্রিভিউ')}
                  <ArrowIcon />
                </button>
              </div>
            </article>
          ))}
        </div>
        {!videos.length && (
          <p className="muted">
            {t('Field reports are being prepared.', 'মাঠ প্রতিবেদন প্রস্তুত হচ্ছে।')}
          </p>
        )}
        {active && (
          <Modal
            title={t('Field report preview', 'মাঠ প্রতিবেদন প্রিভিউ')}
            onClose={() => setActive(null)}
            wide
          >
            <div className="video-preview">
              <img src={active.image} alt={active.location} />
              <span>
                <VideoIcon size={32} />
              </span>
            </div>
            <span className="eyebrow">
              {active.location} · {active.duration}
            </span>
            <h3 className="modal-story-title">{t(active.title, active.titleBn)}</h3>
            <p>{active.description}</p>
            <div className="info-note">
              {t(
                'This is a video interface preview. Documentary footage will be connected when the content is ready.',
                'এটি ভিডিও ইন্টারফেসের প্রিভিউ। বিষয়বস্তু প্রস্তুত হলে ডকুমেন্টারি ফুটেজ যুক্ত করা হবে।',
              )}
            </div>
          </Modal>
        )}
      </div>
    </section>
  );
}
function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}
