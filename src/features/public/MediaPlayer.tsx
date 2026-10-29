import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

function embedUrl(source: string) {
  try {
    const url = new URL(source);
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(url.hostname)) {
      const id =
        url.hostname === 'youtu.be'
          ? url.pathname.slice(1).split('/')[0]
          : url.searchParams.get('v') || url.pathname.match(/\/(?:embed|shorts)\/([^/]+)/)?.[1];
      if (id && /^[\w-]{11}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(url.hostname)) {
      const id = url.pathname.match(/\/(?:video\/)?(\d+)/)?.[1];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    /* A missing source is handled below. */
  }
  return null;
}
export function MediaPlayer({
  source,
  poster,
  title,
}: {
  source: string;
  poster: string;
  title: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!source) return <div className="info-note">This report’s footage is not available yet.</div>;
  const embedded = embedUrl(source);
  return (
    <>
      <div className="media-player">
        {embedded ? (
          <iframe
            src={embedded}
            title={title}
            allow="fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <video
            controls
            playsInline
            preload="metadata"
            poster={poster}
            src={source}
            onError={() => setFailed(true)}
          >
            Your browser does not support this video.
          </video>
        )}
      </div>
      {failed && (
        <div className="info-note">
          The browser could not play this source. Check the video URL or use a compatible MP4/WebM
          file.
        </div>
      )}
      <a
        className="text-link media-source-link"
        href={source}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open video source
        <ExternalLink size={14} />
      </a>
    </>
  );
}
