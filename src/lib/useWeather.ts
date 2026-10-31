import { useEffect, useState } from 'react';
import { useSite } from '../app/SiteProvider';
import { fetchWeather } from './api';
import type { WeatherData } from '../data/types';

const CACHE_KEY = 'aqua_weather_cache_v1';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

interface CachedWeather {
  timestamp: number;
  data: WeatherData;
}

export function useWeather() {
  const { data } = useSite();
  const settings = data.settings;
  const isEnabled = settings.weatherEnabled !== false;

  const [weather, setWeather] = useState<WeatherData | null>(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedWeather = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL && parsed.data.enabled) {
          return parsed.data;
        }
      }
    } catch {
      // ignore storage error
    }
    return null;
  });

  const [loading, setLoading] = useState(!weather && isEnabled);

  useEffect(() => {
    if (!isEnabled) {
      setWeather(null);
      setLoading(false);
      return;
    }

    let active = true;

    async function resolveCityName(lat: number, lon: number): Promise<{ city: string; cityBn?: string }> {
      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
          { signal: AbortSignal.timeout(3000) },
        );
        if (res.ok) {
          const info = await res.json();
          const city = info.city || info.locality || info.principalSubdivision;
          if (city) return { city };
        }
      } catch {
        // ignore
      }
      return {
        city: settings.weatherDefaultCity || 'Dhaka',
        cityBn: settings.weatherDefaultCityBn || 'ঢাকা',
      };
    }

    async function loadWeather(coords?: { lat: number; lon: number }) {
      try {
        let cityInfo: { city: string; cityBn?: string } = {
          city: settings.weatherDefaultCity || 'Dhaka',
          cityBn: settings.weatherDefaultCityBn || 'ঢাকা',
        };

        if (coords) {
          cityInfo = await resolveCityName(coords.lat, coords.lon);
        }

        const result = await fetchWeather({
          lat: coords?.lat,
          lon: coords?.lon,
          city: cityInfo.city,
          cityBn: cityInfo.cityBn,
        });

        if (active && result && result.enabled) {
          setWeather(result);
          try {
            sessionStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ timestamp: Date.now(), data: result } as CachedWeather),
            );
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    }

    // Check if we already have a recent valid cached weather matching enabled status
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedWeather = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL && parsed.data.enabled) {
          setWeather(parsed.data);
          setLoading(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    // Try geolocation first with short timeout
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          void loadWeather({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        () => {
          // Denied or timed out: use default city
          void loadWeather();
        },
        { timeout: 4000, maximumAge: 600000 },
      );
    } else {
      void loadWeather();
    }

    return () => {
      active = false;
    };
  }, [isEnabled, settings.weatherDefaultCity, settings.weatherDefaultCityBn]);

  return { weather, loading, isEnabled };
}
