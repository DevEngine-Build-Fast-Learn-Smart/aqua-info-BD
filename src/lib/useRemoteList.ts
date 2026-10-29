import { useCallback, useEffect, useState } from 'react';
import { api, type PageResult } from './api';
import { useSite } from '../app/SiteProvider';

export function useRemoteList<T>(
  path: string,
  query: Record<string, string | number | undefined> = {},
  enabled = true,
) {
  const { revision } = useSite();
  const search = new URLSearchParams(
    Object.entries(query)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => [key, String(value)]),
  ).toString();
  const [data, setData] = useState<PageResult<T>>({
    count: 0,
    results: [],
    next: null,
    previous: null,
  });
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const timer = setTimeout(
      () => {
        api<PageResult<T>>(`${path}?${search}`, { signal: controller.signal })
          .then((value) => {
            if (!controller.signal.aborted) setData(value);
          })
          .catch((reason) => {
            if (!controller.signal.aborted)
              setError(
                reason instanceof Error ? reason.message : 'The content could not be loaded.',
              );
          })
          .finally(() => {
            if (!controller.signal.aborted) setLoading(false);
          });
      },
      query.search ? 250 : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [path, search, revision, reload, enabled]);
  return { ...data, loading, error, retry: useCallback(() => setReload((value) => value + 1), []) };
}
