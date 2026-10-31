import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { useSite } from '../../app/SiteProvider';

export function HeaderTime() {
  const { language } = useSite();
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = new Intl.DateTimeFormat(
    language === 'bn' ? 'bn-BD' : 'en-US',
    {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    },
  ).format(time);

  const tzName =
    new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
      .formatToParts(time)
      .find((p) => p.type === 'timeZoneName')?.value || '';

  return (
    <div
      className="header-local-time"
      title={language === 'bn' ? 'আপনার বর্তমান স্থানীয় সময়' : 'Your current local time'}
      aria-label={`Current time: ${formattedTime}`}
    >
      <Clock size={12} className="time-clock-icon" />
      <span className="time-value">{formattedTime}</span>
      {tzName && <span className="time-tz">{tzName}</span>}
    </div>
  );
}

