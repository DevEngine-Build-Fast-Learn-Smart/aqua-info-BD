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
  kind: 'image' | 'video' | 'document',
  purpose: 'articles' | 'videos' | 'resources' | 'settings',
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
