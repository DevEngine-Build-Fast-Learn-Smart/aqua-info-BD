import { useState } from 'react';
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  ArrowUpRight,
} from 'lucide-react';
import { useWeather } from '../../lib/useWeather';
import { useSite } from '../../app/SiteProvider';
import { WeatherModal } from './WeatherModal';

const BANGLA_CITIES: Record<string, string> = {
  dhaka: 'ঢাকা',
  chattogram: 'চট্টগ্রাম',
  chittagong: 'চট্টগ্রাম',
  sylhet: 'সিলেট',
  rajshahi: 'রাজশাহী',
  khulna: 'খুলনা',
  barishal: 'বরিশাল',
  barisal: 'বরিশাল',
  rangpur: 'রংপুর',
  mymensingh: 'ময়মনসিংহ',
  comilla: 'কুমিল্লা',
  cumilla: 'কুমিল্লা',
  satkhira: 'সাতক্ষীরা',
  coxsbazar: 'কক্সবাজার',
  bogra: 'বগুড়া',
  bogura: 'বগুড়া',
  jashore: 'যশোর',
  jessore: 'যশোর',
  gazipur: 'গাজীপুর',
  narayanganj: 'নারায়ণগঞ্জ',
  tangail: 'টাঙ্গাইল',
  feni: 'ফেনী',
  noakhali: 'নোয়াখালী',
  chandpur: 'চাঁদপুর',
  pabna: 'পাবনা',
  sirajganj: 'সিরাজগঞ্জ',
  dinajpur: 'দিনাজপুর',
  kushtia: 'কুষ্টিয়া',
  faridpur: 'ফরিদপুর',
  patuakhali: 'পটুয়াখালী',
  bhola: 'ভোলা',
};

function WeatherIcon({
  code = 0,
  isDay = true,
  size = 22,
}: {
  code?: number;
  isDay?: boolean;
  size?: number;
}) {
  if (code === 0) {
    return isDay ? (
      <Sun size={size} className="masthead-weather-icon sun" />
    ) : (
      <Moon size={size} className="masthead-weather-icon moon" />
    );
  }
  if (code >= 1 && code <= 3) {
    return isDay ? (
      <CloudSun size={size} className="masthead-weather-icon" />
    ) : (
      <CloudMoon size={size} className="masthead-weather-icon" />
    );
  }
  if (code === 45 || code === 48) {
    return <CloudFog size={size} className="masthead-weather-icon" />;
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return <CloudRain size={size} className="masthead-weather-icon rain" />;
  }
  if (code >= 71 && code <= 77) {
    return <CloudSnow size={size} className="masthead-weather-icon" />;
  }
  if (code >= 95) {
    return <CloudLightning size={size} className="masthead-weather-icon thunder" />;
  }
  return <Cloud size={size} className="masthead-weather-icon" />;
}

export function WeatherWidget() {
  const { weather, loading, isEnabled } = useWeather();
  const { language } = useSite();
  const [modalOpen, setModalOpen] = useState(false);

  if (!isEnabled) return null;

  if (loading && !weather) {
    return (
      <div className="masthead-weather is-loading" aria-live="polite">
        <div className="masthead-weather-icon-box">
          <span className="weather-pulse" />
        </div>
        <div className="masthead-weather-info">
          <span className="masthead-weather-temp skeleton-text">…°C</span>
          <span className="masthead-weather-condition skeleton-text">
            {language === 'bn' ? 'আবহাওয়া লোড হচ্ছে…' : 'Loading weather…'}
          </span>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const cityName = weather.city || 'Dhaka';
  const normalizedKey = cityName.toLowerCase().replace(/[^a-z]/g, '');
  const displayCity =
    language === 'bn'
      ? weather.cityBn || BANGLA_CITIES[normalizedKey] || cityName
      : cityName;

  const tempVal = typeof weather.temperature === 'number' ? Math.round(weather.temperature) : null;
  const displayTemp =
    tempVal !== null
      ? language === 'bn'
        ? `${new Intl.NumberFormat('bn-BD').format(tempVal)}°`
        : `${tempVal}°C`
      : '—';

  const displayCondition =
    language === 'bn' && weather.conditionBn ? weather.conditionBn : weather.condition || 'Fair';

  return (
    <>
      <button
        type="button"
        className="masthead-weather"
        onClick={() => setModalOpen(true)}
        title={
          language === 'bn'
            ? `${displayCity} আবহাওয়া: ${displayTemp}, ${displayCondition} · বিস্তারিত পূর্বাভাস দেখতে ক্লিক করুন`
            : `${displayCity} Weather: ${displayTemp}, ${displayCondition} · Click for full live forecast`
        }
        aria-label={
          language === 'bn'
            ? `${displayCity} আবহাওয়া বিস্তারিত দেখুন`
            : `Open weather forecast for ${displayCity}`
        }
      >
        <div className="masthead-weather-icon-box">
          <WeatherIcon code={weather.code} isDay={weather.isDay} size={24} />
        </div>
        <div className="masthead-weather-info">
          <div className="masthead-weather-top">
            <strong className="masthead-weather-temp">{displayTemp}</strong>
            <span className="masthead-weather-dot">·</span>
            <span className="masthead-weather-city">{displayCity}</span>
          </div>
          <div className="masthead-weather-bottom">
            <span className="masthead-weather-condition">{displayCondition}</span>
            <ArrowUpRight size={13} className="masthead-weather-arrow" />
          </div>
        </div>
      </button>

      {modalOpen && (
        <WeatherModal
          weather={weather}
          onClose={() => setModalOpen(false)}
          language={language}
        />
      )}
    </>
  );
}
