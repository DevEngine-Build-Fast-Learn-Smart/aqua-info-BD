import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { readSiteData, STORAGE_KEY, writeSiteData } from '../data/storage';
import type { Language, SiteData } from '../data/types';
import { assetUrl, localized } from '../lib/utils';

interface SiteContextValue {
  data: SiteData;
  update: (change: (previous: SiteData) => SiteData) => boolean;
  language: Language;
  setLanguage: (value: Language) => void;
  t: (en: string, bn?: string) => string;
  notify: (message: string) => void;
  saved: string[];
  toggleSaved: (id: string) => void;
}
const SiteContext = createContext<SiteContextValue | null>(null);
export function SiteProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(readSiteData);
  const dataRef = useRef(data);
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return localStorage.getItem('aqua:language') === 'bn' ? 'bn' : 'en';
    } catch {
      return 'en';
    }
  });
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      const value = JSON.parse(localStorage.getItem('aqua:saved') || '[]');
      return Array.isArray(value) ? value.filter((v) => typeof v === 'string') : [];
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState('');
  const t = useCallback((en: string, bn?: string) => localized(language, en, bn), [language]);
  const notify = useCallback((message: string) => setToast(message), []);
  const update = useCallback((change: (previous: SiteData) => SiteData) => {
    const next = change(dataRef.current);
    try {
      writeSiteData(next);
    } catch {
      setToast('This change could not be saved. Browser storage may be full or unavailable.');
      return false;
    }
    dataRef.current = next;
    setData(next);
    return true;
  }, []);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem('aqua:language', language);
    } catch {
      /* Optional preference. */
    }
  }, [language]);
  useEffect(() => {
    try {
      localStorage.setItem('aqua:saved', JSON.stringify(saved));
    } catch {
      /* Session bookmarks still work. */
    }
  }, [saved]);
  useEffect(() => {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href = assetUrl(data.settings.logoUrl || '/assets/logo.png');
      favicon.removeAttribute('type');
    }
  }, [data.settings.logoUrl]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        const next = readSiteData();
        dataRef.current = next;
        setData(next);
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  return (
    <SiteContext.Provider
      value={{
        data,
        update,
        language,
        setLanguage,
        t,
        notify,
        saved,
        toggleSaved: (id) =>
          setSaved((previous) =>
            previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id],
          ),
      }}
    >
      {children}
      {toast && (
        <div className="toast" role="status">
          <span className="status-dot" />
          {toast}
          <button onClick={() => setToast('')} aria-label="Dismiss notification">
            ×
          </button>
        </div>
      )}
    </SiteContext.Provider>
  );
}
export function useSite() {
  const value = useContext(SiteContext);
  if (!value) throw new Error('useSite requires SiteProvider');
  return value;
}
