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
  saved: string[];
  toggleSaved: (id: string) => void;
  remember: (collection: 'articles' | 'videos' | 'resources', item: { id: string }) => void;
}
const SiteContext = createContext<SiteContextValue | null>(null);
export function SiteProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData>(() => structuredClone(emptySiteData));
  const dataRef = useRef(data);
  const privateRef = useRef(false);
  const requestVersion = useRef(0);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [revision, setRevision] = useState(0);
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
      return Array.isArray(value)
        ? value.filter(
            (item) =>
              typeof item === 'string' &&
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item),
          )
        : [];
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState('');
  const t = useCallback((en: string, bn?: string) => localized(language, en, bn), [language]);
  const notify = useCallback((message: string) => setToast(message), []);
  const load = useCallback(async (visible: boolean) => {
    const version = ++requestVersion.current;
    if (visible) setLoading(true);
    setLoadError('');
    try {
      const next = await api<SiteData>(privateRef.current ? '/workspace/' : '/site/');
      if (version !== requestVersion.current) return;
      dataRef.current = next;
      setData(next);
    } catch (reason) {
      if (version === requestVersion.current)
        setLoadError(
          reason instanceof Error ? reason.message : 'The publication could not be loaded.',
        );
      throw reason;
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, []);
  const refresh = useCallback(async () => {
    try {
      await load(true);
      setRevision((value) => value + 1);
    } catch {
      /* Boundary provides retry. */
    }
  }, [load]);
  useEffect(() => {
    void refresh();
    const auth = (event: Event) => {
      privateRef.current = !!(event as CustomEvent<boolean>).detail;
      if (!privateRef.current) {
        dataRef.current = structuredClone(emptySiteData);
        setData(dataRef.current);
      }
      void refresh();
    };
    window.addEventListener('aqua:auth-changed', auth);
    return () => window.removeEventListener('aqua:auth-changed', auth);
  }, [refresh]);
  const update = useCallback(
    (change: (previous: SiteData) => SiteData): Promise<boolean> => {
      const operation = queue.current.then(async () => {
        setSaving(true);
        try {
          const next = await persistSiteChanges(dataRef.current, change(dataRef.current));
          dataRef.current = next;
          setData(next);
          setRevision((value) => value + 1);
          try {
            await load(false);
          } catch {
            setLoadError('');
            notify('Saved successfully. Refresh the page to load the latest server content.');
          }
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
  const remember = useCallback(
    (collection: 'articles' | 'videos' | 'resources', item: { id: string }) => {
      const current = dataRef.current;
      const list = current[collection] as { id: string }[];
      const next = {
        ...current,
        [collection]: list.some((value) => value.id === item.id)
          ? list.map((value) => (value.id === item.id ? item : value))
          : [...list, item],
      } as SiteData;
      dataRef.current = next;
      setData(next);
    },
    [],
  );
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 6000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem('aqua:language', language);
    } catch {
      /* Preference is optional. */
    }
  }, [language]);
  useEffect(() => {
    try {
      localStorage.setItem('aqua:saved', JSON.stringify(saved));
    } catch {
      /* Bookmarks remain in this session. */
    }
  }, [saved]);
  useEffect(() => {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href = assetUrl(data.settings.logoUrl || '/assets/logo.png');
      favicon.removeAttribute('type');
    }
  }, [data.settings.logoUrl]);
  return (
    <SiteContext.Provider
      value={{
        data,
        update,
        refresh,
        loading,
        loadError,
        saving,
        revision,
        remember,
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
