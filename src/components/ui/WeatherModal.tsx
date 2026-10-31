import { useEffect } from 'react';
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Gauge,
  MapPin,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Wind,
  X,
  Compass,
} from 'lucide-react';
import type { WeatherData } from '../../data/types';

interface WeatherModalProps {
  weather: WeatherData;
  onClose: () => void;
  language: 'en' | 'bn';
}

function formatNum(num: number | undefined, lang: 'en' | 'bn'): string {
  if (num === undefined || num === null) return '—';
  return lang === 'bn' ? new Intl.NumberFormat('bn-BD').format(num) : String(num);
}

function RenderWeatherIcon({
  code = 0,
  isDay = true,
  size = 28,
}: {
  code?: number;
  isDay?: boolean;
  size?: number;
}) {
  if (code === 0) {
    return isDay ? (
      <Sun size={size} className="modal-weather-icon sun" />
    ) : (
      <Moon size={size} className="modal-weather-icon moon" />
    );
  }
  if (code >= 1 && code <= 3) {
    return isDay ? (
      <CloudSun size={size} className="modal-weather-icon" />
    ) : (
      <CloudMoon size={size} className="modal-weather-icon" />
    );
  }
  if (code === 45 || code === 48) {
    return <CloudFog size={size} className="modal-weather-icon" />;
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return <CloudRain size={size} className="modal-weather-icon rain" />;
  }
  if (code >= 71 && code <= 77) {
    return <CloudSnow size={size} className="modal-weather-icon" />;
  }
  if (code >= 95) {
    return <CloudLightning size={size} className="modal-weather-icon thunder" />;
  }
  return <Cloud size={size} className="modal-weather-icon" />;
}

export function WeatherModal({ weather, onClose, language }: WeatherModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const cityName =
    language === 'bn' && weather.cityBn ? weather.cityBn : weather.city || 'Dhaka';
  const condition =
    language === 'bn' && weather.conditionBn ? weather.conditionBn : weather.condition || 'Fair';

  const temp = weather.temperature != null ? Math.round(weather.temperature) : 28;
  const apparentTemp =
    weather.apparentTemperature != null ? Math.round(weather.apparentTemperature) : temp;
  const tempMax = weather.tempMax != null ? Math.round(weather.tempMax) : temp + 2;
  const tempMin = weather.tempMin != null ? Math.round(weather.tempMin) : temp - 3;

  return (
    <div
      className="weather-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="weather-modal-title"
    >
      <div className="weather-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="weather-modal-header">
          <div className="weather-location-wrap">
            <span className="weather-location-badge">
              <MapPin size={14} />
              <span id="weather-modal-title">{cityName}</span>
            </span>
            <span className="weather-country">
              {language === 'bn' ? 'বাংলাদেশ · সরাসরি আবহাওয়া' : 'Bangladesh · Live Weather'}
            </span>
          </div>
          <button
            type="button"
            className="weather-modal-close"
            onClick={onClose}
            aria-label="Close weather details"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Hero Section */}
        <div className="weather-hero">
          <div className="weather-hero-main">
            <div className="weather-hero-icon-wrap">
              <RenderWeatherIcon code={weather.code} isDay={weather.isDay} size={54} />
            </div>
            <div className="weather-hero-temps">
              <span className="weather-big-temp">
                {formatNum(temp, language)}
                <span className="weather-unit">°C</span>
              </span>
              <span className="weather-hero-condition">{condition}</span>
            </div>
          </div>

          <div className="weather-hero-sub">
            <div className="weather-sub-item">
              <span className="weather-sub-label">
                {language === 'bn' ? 'অনুভূত তাপমাত্রা' : 'Feels like'}
              </span>
              <strong>
                {formatNum(apparentTemp, language)}
                {language === 'bn' ? '°সে' : '°C'}
              </strong>
            </div>
            <div className="weather-sub-item">
              <span className="weather-sub-label">
                {language === 'bn' ? 'আজকের পরিসর' : "Today's range"}
              </span>
              <strong>
                H: {formatNum(tempMax, language)}° · L: {formatNum(tempMin, language)}°
              </strong>
            </div>
          </div>
        </div>

        {/* Hourly Forecast */}
        {weather.hourly && weather.hourly.length > 0 && (
          <div className="weather-hourly-section">
            <div className="weather-section-title">
              <span>{language === 'bn' ? 'ঘণ্টাভিত্তিক পূর্বাভাস' : 'Hourly Forecast'}</span>
              <span className="weather-section-badge">
                {language === 'bn' ? 'পরবর্তী কয়েক ঘণ্টা' : 'Next 12 hours'}
              </span>
            </div>
            <div className="weather-hourly-strip">
              {weather.hourly.slice(0, 12).map((item, index) => (
                <div className="weather-hour-card" key={index}>
                  <span className="weather-hour-time">
                    {index === 0 ? (language === 'bn' ? 'এখন' : 'Now') : item.time}
                  </span>
                  <div className="weather-hour-icon">
                    <RenderWeatherIcon code={item.code} isDay={item.isDay} size={22} />
                  </div>
                  <strong className="weather-hour-temp">
                    {formatNum(item.temperature, language)}°
                  </strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Metrics Grid */}
        <div className="weather-grid">
          {/* Humidity */}
          <div className="weather-grid-card">
            <div className="weather-card-icon-title">
              <Droplets size={16} className="metric-icon blue" />
              <span>{language === 'bn' ? 'আর্দ্রতা' : 'Humidity'}</span>
            </div>
            <div className="weather-card-value">
              {formatNum(weather.humidity ?? 60, language)}%
            </div>
            <p className="weather-card-caption">
              {weather.humidity && weather.humidity > 70
                ? language === 'bn'
                  ? 'উচ্চ আর্দ্রতা অনুভূত হচ্ছে'
                  : 'High humidity environment'
                : language === 'bn'
                  ? 'স্বাভাবিক ও আরামদায়ক মাত্রা'
                  : 'Comfortable dew conditions'}
            </p>
          </div>

          {/* Wind */}
          <div className="weather-grid-card">
            <div className="weather-card-icon-title">
              <Wind size={16} className="metric-icon teal" />
              <span>{language === 'bn' ? 'বাতাস' : 'Wind Speed'}</span>
            </div>
            <div className="weather-card-value">
              {formatNum(weather.windSpeed ?? 10, language)}{' '}
              <small>{language === 'bn' ? 'কিমি/ঘণ্টা' : 'km/h'}</small>
            </div>
            <p className="weather-card-caption">
              {weather.windDirection != null && (
                <span>
                  <Compass size={12} style={{ display: 'inline', marginRight: 4 }} />
                  {formatNum(weather.windDirection, language)}° ·{' '}
                </span>
              )}
              {language === 'bn' ? 'স্বাভাবিক মৃদুমন্দ বাতাস' : 'Gentle coastal breeze'}
            </p>
          </div>

          {/* Atmospheric Pressure */}
          <div className="weather-grid-card">
            <div className="weather-card-icon-title">
              <Gauge size={16} className="metric-icon purple" />
              <span>{language === 'bn' ? 'বায়ুচাপ' : 'Pressure'}</span>
            </div>
            <div className="weather-card-value">
              {formatNum(weather.pressure ?? 1012, language)}{' '}
              <small>{language === 'bn' ? 'হেক্টোপ্যাসকেল' : 'hPa'}</small>
            </div>
            <p className="weather-card-caption">
              {language === 'bn' ? 'স্থিতিশীল বায়ুমণ্ডলীয় চাপ' : 'Standard atmospheric pressure'}
            </p>
          </div>

          {/* Sun Cycle */}
          <div className="weather-grid-card">
            <div className="weather-card-icon-title">
              <Sun size={16} className="metric-icon amber" />
              <span>{language === 'bn' ? 'সূর্যোদয় ও সূর্যাস্ত' : 'Sun Cycle'}</span>
            </div>
            <div className="weather-card-sun-cycle">
              <div className="sun-cycle-item">
                <Sunrise size={15} />
                <span>
                  {language === 'bn' ? 'সূর্যোদয়' : 'Sunrise'}:{' '}
                  <strong>{weather.sunrise || '06:02'}</strong>
                </span>
              </div>
              <div className="sun-cycle-item">
                <Sunset size={15} />
                <span>
                  {language === 'bn' ? 'সূর্যাস্ত' : 'Sunset'}:{' '}
                  <strong>{weather.sunset || '17:20'}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="weather-modal-footer">
          <span>
            {language === 'bn'
              ? 'জলজ ও মৎস্য খাতের আবহাওয়া তথ্য · ওপেন-মেটিও এবং লাইভ স্যাটেলাইট রাডার'
              : 'Aquatic and climate data for aquaculture · Live radar & meteorological telemetry'}
          </span>
        </div>
      </div>
    </div>
  );
}

