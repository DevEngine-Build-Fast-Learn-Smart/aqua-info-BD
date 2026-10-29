import { useEffect, useState } from 'react';
import { api, type PageResult } from './api';
import type { Article } from '../data/types';
import { useSite } from '../app/SiteProvider';

export function useSavedArticles(ids: string[], enabled: boolean) {
  const { revision } = useSite();
  const signature = ids.join(',');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const values = signature ? signature.split(',') : [];
    const groups: string[][] = [];
    for (let index = 0; index < values.length; index += 40)
      groups.push(values.slice(index, index + 40));
    Promise.all(
      groups.map((group) =>
        api<PageResult<Article>>(`/articles/?ids=${group.join(',')}&page_size=100`, {
          signal: controller.signal,
        }),
      ),
    )
      .then((results) => {
        if (!controller.signal.aborted) setArticles(results.flatMap((result) => result.results));
      })
      .catch((reason) => {
        if (!controller.signal.aborted)
          setError(
            reason instanceof Error ? reason.message : 'The saved stories could not be loaded.',
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [signature, enabled, revision, attempt]);
  return { articles, loading, error, retry: () => setAttempt((value) => value + 1) };
}
