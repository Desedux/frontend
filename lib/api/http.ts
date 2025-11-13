export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

function getToken() {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem("desedux_user")
  if (!stored) return null

  try {
    const parsed = JSON.parse(stored) as {
      tokens?: { idToken?: string }
    }
    return parsed.tokens?.idToken ?? null
  } catch {
    return null
  }
}


type HttpOptions = {
  method?: 'GET'|'POST'|'PATCH'|'DELETE';
  headers?: Record<string,string>;
  body?: any;
  cache?: RequestCache;
};

export async function http<T>(url: string, opts: HttpOptions = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string,string> = {
    'Content-Type': 'application/json',
    ...(opts.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${url}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: opts.cache ?? 'no-store',
  });

  if (!res.ok) {
    let detail: any = undefined;
    try { detail = await res.json(); } catch {}
    throw new Error(detail?.message || `HTTP ${res.status} on ${url}`);
  }

  // 204 sem body
  if (res.status === 204) return undefined as unknown as T;

  return (await res.json()) as T;
}
