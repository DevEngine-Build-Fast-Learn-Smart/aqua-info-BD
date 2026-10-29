import { useState } from 'react';
import { MapPin, Play } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';
import { Modal } from '../../components/ui/Modal';
import { SectionHeading } from './SectionHeading';
import type { Video } from '../../data/types';
import { MediaPlayer } from './MediaPlayer';
import { useRemoteList } from '../../lib/useRemoteList';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingSkeleton, RequestError } from '../../components/ui/DataState';
import { assetUrl } from '../../lib/utils';

export function VideoSection({ standalone = false }: { standalone?: boolean }) {
  const { data, t } = useSite();
  const [active, setActive] = useState<Video | null>(null);
  const [page, setPage] = useState(1);
  const result = useRemoteList<Video>('/videos/', { page }, standalone);
  const videos = standalone
    ? result.results
    : data.videos.filter((video) => video.status === 'published');
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
        {standalone && result.loading && <LoadingSkeleton />}
        {standalone && result.error && <RequestError message={result.error} retry={result.retry} />}
        <div className="video-grid" hidden={standalone && result.loading}>
          {videos.map((video, index) => (
            <article className={`video-card ${index === 0 ? 'video-featured' : ''}`} key={video.id}>
              <button
                className="video-cover"
                onClick={() => setActive(video)}
                aria-label={`${t('Preview', 'প্রিভিউ')} ${t(video.title, video.titleBn)}`}
              >
                <img src={assetUrl(video.image)} alt={video.location} loading="lazy" />
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
                  {t('Watch field report', 'প্রতিবেদন দেখুন')}
                  <ArrowIcon />
                </button>
              </div>
            </article>
          ))}
        </div>
        {(!standalone || (!result.loading && !result.error)) && !videos.length && (
          <p className="muted">
            {t('Field reports are being prepared.', 'মাঠ প্রতিবেদন প্রস্তুত হচ্ছে।')}
          </p>
        )}
        {standalone && <Pagination page={page} count={result.count} onChange={setPage} />}
        {active && (
          <Modal
            title={t('Visual field report', 'ভিডিও প্রতিবেদন')}
            onClose={() => setActive(null)}
            wide
          >
            <MediaPlayer
              source={active.mediaUrl || ''}
              poster={assetUrl(active.image)}
              title={t(active.title, active.titleBn)}
            />
            <span className="eyebrow">
              {active.location} · {active.duration}
            </span>
            <h3 className="modal-story-title">{t(active.title, active.titleBn)}</h3>
            <p className="video-story-body">{t(active.description, active.descriptionBn)}</p>
          </Modal>
        )}
      </div>
    </section>
  );
}
function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}
