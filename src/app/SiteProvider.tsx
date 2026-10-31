import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Language, SiteData } from '../data/types';
import { emptySiteData } from '../data/initial';
import { persistSiteChanges } from '../data/api-storage';
import { api } from '../lib/api';
import { assetUrl, localized } from '../lib/utils';
interface SiteContextValue {
  siteName: string;
  data: SiteData;
  update: (change: (previous: SiteData) => SiteData) => Promise<boolean>;
  refresh: () => Promise<void>;
  loading: boolean;
  loadError: string;
  saving: boolean;
  revision: number;
  language: Language;
  setLanguage: (value: Language) => void;
  t: (en: string, bn?: string) => string;
  notify: (message: string) => void;
}
const Context = createContext<SiteContextValue | null>(null);
export function SiteProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData>(() => structuredClone(emptySiteData));
  const dataRef = useRef(data),
    privateRef = useRef(false),
    requestVersion = useRef(0),
    queue = useRef<Promise<unknown>>(Promise.resolve());
  const [loading, setLoading] = useState(true),
    [loadError, setLoadError] = useState(''),
    [saving, setSaving] = useState(false),
    [revision, setRevision] = useState(0),
    [toast, setToast] = useState('');
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return localStorage.getItem('aqua:language') === 'bn' ? 'bn' : 'en';
    } catch {
      return 'en';
    }
  });
  const translate = useCallback(
    (en: string, bn?: string) => localized(language, en, bn),
    [language],
  );
  const notify = useCallback((message: string) => setToast(message), []);
  const load = useCallback(async (visible = false) => {
    const version = ++requestVersion.current;
    if (visible) setLoading(true);
    setLoadError('');
    try {
      const next = await api<SiteData>(privateRef.current ? '/workspace/' : '/site/');
      if (version !== requestVersion.current) return;
      dataRef.current = next;
      setData(next);
      setRevision((value) => value + 1);
    } catch (reason) {
      if (version === requestVersion.current)
        setLoadError(reason instanceof Error ? reason.message : 'The website could not be loaded.');
      throw reason;
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, []);
  const refresh = useCallback(async () => {
    try {
      await load();
    } catch {
      /* Retry is shown by the page boundary. */
    }
  }, [load]);
  useEffect(() => {
    void load(true).catch(() => undefined);
    const auth = (event: Event) => {
      privateRef.current = !!(event as CustomEvent<boolean>).detail;
      if (!privateRef.current) {
        dataRef.current = structuredClone(emptySiteData);
        setData(dataRef.current);
      }
      void load(true).catch(() => undefined);
    };
    window.addEventListener('aqua:auth-changed', auth);
    return () => window.removeEventListener('aqua:auth-changed', auth);
  }, [load]);
  const update = useCallback(
    (change: (previous: SiteData) => SiteData) => {
      const operation = queue.current.then(async () => {
        setSaving(true);
        try {
          const next = await persistSiteChanges(dataRef.current, change(dataRef.current));
          dataRef.current = next;
          setData(next);
          await load();
          return true;
        } catch (reason) {
          notify(reason instanceof Error ? reason.message : 'The change could not be saved.');
          return false;
        } finally {
          setSaving(false);
        }
      });
      queue.current = operation;
      return operation;
    },
    [load, notify],
  );
  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem('aqua:language', language);
    } catch {
      /* Optional preference. */
    }
  }, [language]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 6000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (icon) {
      icon.href = assetUrl(data.settings.logoUrl || '/assets/logo.png');
      icon.removeAttribute('type');
    }
  }, [data.settings.logoUrl]);
  return (
    <Context.Provider
      value={{
        siteName: localized(
          language,
          data.settings.siteTitle || 'Aqua Info BD',
          data.settings.siteTitleBn,
        ),
        data,
        update,
        refresh,
        loading,
        loadError,
        saving,
        revision,
        language,
        setLanguage,
        t: translate,
        notify,
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
    </Context.Provider>
  );
}
export function useSite() {
  const value = useContext(Context);
  if (!value) throw new Error('useSite requires SiteProvider');
  return value;
}
