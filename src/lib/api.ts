const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
let csrfToken = '';
let csrfPending: Promise<string> | null = null;
let refreshPending: Promise<void> | null = null;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
  }
}
function errorMessage(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(errorMessage).join(' ');
  if (value && typeof value === 'object')
    return Object.entries(value)
      .map(
        ([key, item]) =>
          `${key === 'detail' || key === 'non_field_errors' ? '' : `${key}: `}${errorMessage(item)}`,
      )
      .join(' ');
  return 'The request could not be completed.';
}
async function readResponse(response: Response) {
  if (response.status === 204) return undefined;
  return response.headers.get('content-type')?.includes('application/json')
    ? response.json()
    : undefined;
}
async function csrf(force = false): Promise<string> {
  if (csrfToken && !force) return csrfToken;
  if (csrfPending) return csrfPending;
  csrfPending = fetch(`${API_BASE}/auth/csrf/`, {
    credentials: 'include',
    signal: AbortSignal.timeout(15000),
  })
    .then(async (response) => {
      const data = await readResponse(response);
      if (!response.ok || typeof data?.csrfToken !== 'string')
        throw new ApiError(
          'Could not establish a secure connection to the server.',
          response.status,
        );
      csrfToken = data.csrfToken;
      return csrfToken;
    })
    .finally(() => {
      csrfPending = null;
    });
  return csrfPending;
}
async function renewSession() {
  if (!refreshPending) {
    refreshPending = (async () => {
      const token = await csrf();
      const response = await fetch(`${API_BASE}/auth/refresh/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRFToken': token },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        if (response.status === 401) window.dispatchEvent(new Event('aqua:session-ended'));
        throw new ApiError('Your session has ended. Please sign in again.', response.status);
      }
    })().finally(() => {
      refreshPending = null;
    });
  }
  return refreshPending;
}
export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown; signal?: AbortSignal; retry?: boolean } = {},
): Promise<T> {
  const method = options.method || 'GET';
  const unsafe = !['GET', 'HEAD', 'OPTIONS'].includes(method);
  try {
    const headers: Record<string, string> = {};
    if (unsafe) headers['X-CSRFToken'] = await csrf();
    const multipart = options.body instanceof FormData;
    if (options.body !== undefined && !multipart) headers['Content-Type'] = 'application/json';
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      headers,
      body:
        options.body === undefined
          ? undefined
          : multipart
            ? (options.body as FormData)
            : JSON.stringify(options.body),
      signal: options.signal || AbortSignal.timeout(multipart ? 180000 : 20000),
    });
    if (
      response.status === 401 &&
      options.retry !== false &&
      !path.startsWith('/auth/login') &&
      !path.startsWith('/auth/logout') &&
      !path.startsWith('/auth/refresh')
    ) {
      await renewSession();
      return api<T>(path, { ...options, retry: false });
    }
    const data = await readResponse(response);
    if (
      response.status === 403 &&
      options.retry !== false &&
      unsafe &&
      data?.detail?.includes('CSRF')
    ) {
      await csrf(true);
      return api<T>(path, { ...options, retry: false });
    }
    if (!response.ok)
      throw new ApiError(
        data ? errorMessage(data) : `The server returned HTTP ${response.status}.`,
        response.status,
        data,
      );
    if (data === undefined && response.status !== 204)
      throw new ApiError(
        'The API did not return JSON. Check the backend URL and start the Django server.',
        response.status,
      );
    return data as T;
  } catch (error) {
    if (error instanceof ApiError || (error instanceof DOMException && error.name === 'AbortError'))
      throw error;
    throw new ApiError(
      'Cannot reach the server. Check your connection and make sure the backend is running.',
      0,
    );
  }
}
export interface PageResult<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
export async function allPages<T>(path: string): Promise<T[]> {
  const result: T[] = [];
  let page = 1;
  while (true) {
    const data = await api<PageResult<T>>(
      `${path}${path.includes('?') ? '&' : '?'}page_size=100&page=${page}`,
    );
    result.push(...data.results);
    if (!data.next) return result;
    page++;
  }
}
export async function uploadMedia(
  file: File,
  kind: 'image' | 'document',
  purpose: import('../data/catalog').ContentSection | 'authors' | 'settings' | 'profile' | 'pages',
) {
  const body = new FormData();
  body.append('file', file);
  body.append('kind', kind);
  body.append('purpose', purpose);
  return api<{ id: string; url: string; kind: string; size: number }>('/admin/uploads/', {
    method: 'POST',
    body,
  });
}

export async function fetchWeather(coords?: {
  lat?: number;
  lon?: number;
  city?: string;
  cityBn?: string;
}): Promise<import('../data/types').WeatherData | null> {
  const params = new URLSearchParams();
  if (coords?.lat != null && coords?.lon != null) {
    params.set('lat', String(coords.lat));
    params.set('lon', String(coords.lon));
  }
  if (coords?.city) params.set('city', coords.city);
  if (coords?.cityBn) params.set('cityBn', coords.cityBn);
  const query = params.toString() ? `?${params.toString()}` : '';

  try {
    return await api<import('../data/types').WeatherData>(`/weather/${query}`);
  } catch {
    try {
      const lat = coords?.lat ?? 23.8103;
      const lon = coords?.lon ?? 90.4125;
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,is_day&hourly=temperature_2m,weather_code,is_day&forecast_hours=24&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto`,
        { signal: AbortSignal.timeout(5000) },
      );
      if (!res.ok) return null;
      const data = await res.json();
      const current = data.current || {};
      const daily = data.daily || {};
      const hourly = data.hourly || {};
      const code = Number(current.weather_code) || 0;
      const WMO_MAP: Record<number, [string, string, string]> = {
        0: ['Clear sky', 'পরিষ্কার আকাশ', 'sun'],
        1: ['Mainly clear', 'স্বচ্ছ আকাশ', 'sun'],
        2: ['Partly cloudy', 'আংশিক মেঘলা', 'cloud-sun'],
        3: ['Overcast', 'মেঘলা', 'cloud'],
        45: ['Foggy', 'কুয়াশাচ্ছন্ন', 'cloud-fog'],
        48: ['Depositing rime fog', 'কুয়াশা', 'cloud-fog'],
        51: ['Light drizzle', 'হালকা ঝিরিঝিরি বৃষ্টি', 'cloud-drizzle'],
        53: ['Moderate drizzle', 'ঝিরিঝিরি বৃষ্টি', 'cloud-drizzle'],
        55: ['Dense drizzle', 'ঘন ঝিরিঝিরি বৃষ্টি', 'cloud-drizzle'],
        61: ['Slight rain', 'হালকা বৃষ্টি', 'cloud-rain'],
        63: ['Moderate rain', 'বৃষ্টি', 'cloud-rain'],
        65: ['Heavy rain', 'ভারী বৃষ্টি', 'cloud-rain'],
        71: ['Slight snow', 'হালকা তুষারপাত', 'snowflake'],
        73: ['Moderate snow', 'তুষারপাত', 'snowflake'],
        75: ['Heavy snow', 'ভারী তুষারপাত', 'snowflake'],
        80: ['Rain showers', 'বৃষ্টির সম্ভাবনা', 'cloud-rain'],
        81: ['Moderate showers', 'বৃষ্টির ধারা', 'cloud-rain'],
        82: ['Violent showers', 'ভারী বর্ষণ', 'cloud-rain'],
        95: ['Thunderstorm', 'বজ্রঝড়', 'cloud-lightning'],
        96: ['Thunderstorm with hail', 'শিলাবৃষ্টিসহ বজ্রঝড়', 'cloud-lightning'],
        99: ['Heavy thunderstorm', 'প্রবল বজ্রঝড়', 'cloud-lightning'],
      };
      const [condition, conditionBn, iconBase] = WMO_MAP[code] || ['Fair', 'অনুকূল', 'sun'];
      const isDay = Boolean(current.is_day ?? 1);
      const icon = !isDay && iconBase === 'sun' ? 'moon' : !isDay && iconBase === 'cloud-sun' ? 'cloud-moon' : iconBase;

      const hourlyItems = [];
      const times = hourly.time || [];
      const temps = hourly.temperature_2m || [];
      const codes = hourly.weather_code || [];
      const days = hourly.is_day || [];
      for (let i = 0; i < Math.min(16, times.length); i++) {
        const hCode = Number(codes[i]) || code;
        const [hCond, hCondBn, hIconBase] = WMO_MAP[hCode] || ['Fair', 'অনুকূল', 'sun'];
        const isHDay = Boolean(days[i] ?? 1);
        const hIcon = !isHDay && hIconBase === 'sun' ? 'moon' : !isHDay && hIconBase === 'cloud-sun' ? 'cloud-moon' : hIconBase;
        const tStr = String(times[i]).includes('T') ? String(times[i]).split('T')[1].slice(0, 5) : String(times[i]);
        hourlyItems.push({
          time: tStr,
          temperature: Math.round(Number(temps[i]) || 28),
          condition: hCond,
          conditionBn: hCondBn,
          icon: hIcon,
          code: hCode,
          isDay: isHDay,
        });
      }

      const sunriseList = daily.sunrise || [];
      const sunsetList = daily.sunset || [];
      const sunrise = sunriseList[0] && String(sunriseList[0]).includes('T') ? String(sunriseList[0]).split('T')[1].slice(0, 5) : '';
      const sunset = sunsetList[0] && String(sunsetList[0]).includes('T') ? String(sunsetList[0]).split('T')[1].slice(0, 5) : '';

      return {
        enabled: true,
        provider: 'open-meteo',
        city: coords?.city || 'Dhaka',
        cityBn: coords?.cityBn || 'ঢাকা',
        temperature: Math.round(Number(current.temperature_2m) || 28),
        apparentTemperature: Math.round(Number(current.apparent_temperature) || Number(current.temperature_2m) || 28),
        tempMax: daily.temperature_2m_max?.[0] ? Math.round(daily.temperature_2m_max[0]) : Math.round(Number(current.temperature_2m) || 28) + 3,
        tempMin: daily.temperature_2m_min?.[0] ? Math.round(daily.temperature_2m_min[0]) : Math.round(Number(current.temperature_2m) || 28) - 4,
        condition,
        conditionBn,
        icon,
        code,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(Number(current.wind_speed_10m) || 10),
        windDirection: current.wind_direction_10m,
        pressure: Math.round(Number(current.surface_pressure) || 1012),
        precipitation: current.precipitation,
        sunrise,
        sunset,
        isDay,
        hourly: hourlyItems,
      };
    } catch {
      return null;
    }
  }
}
