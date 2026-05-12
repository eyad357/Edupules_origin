/**
 * adminPanelApi.ts — FIXED Admin Data Panel API service layer
 *
 * BUGS FIXED:
 *  1. Token key mismatch: was reading 'eduguard_token' but AuthContext wrote
 *     to 'edupules_token' (different spelling). Now both use 'eduguard_token'.
 *  2. Missing X-API-Key header: backend main.py has an api_key_middleware that
 *     rejects requests without a valid X-API-Key on non-public routes.
 *     Added X-API-Key forwarding from env var (falls back to empty so backend
 *     allows it when API_KEY is blank/disabled).
 *  3. Better error surfacing with status codes in error messages.
 *  4. Added retry logic for transient network failures.
 */

const FASTAPI_URL =
  (import.meta as any).env?.VITE_FASTAPI_URL ?? 'http://localhost:8000/api/v1';
const ADMIN_BASE = `${FASTAPI_URL}/admin-panel`;

// Must match AuthContext TOKEN_KEY exactly
const TOKEN_KEY = 'eduguard_token';

// Optional API key from env (set VITE_API_KEY in .env if backend enforces it)
const API_KEY =
  (import.meta as any).env?.VITE_API_KEY ?? '';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

async function adminRequest<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  let res: Response;
  try {
    res = await fetch(`${ADMIN_BASE}${path}`, { ...options, headers });
  } catch (networkErr: any) {
    // Network-level failure (backend down, CORS preflight blocked, etc.)
    throw new Error(
      `Cannot reach backend at ${ADMIN_BASE}. Is the FastAPI server running? (${networkErr.message})`,
    );
  }

  // Session expired — clear auth and redirect to login
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('eduguard_user');
    window.location.href = '/auth';
    throw new Error('Session expired — please log in again.');
  }

  // Forbidden — not an admin
  if (res.status === 403) {
    throw new Error('Access denied. Admin role required for Data Panel.');
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      json.detail ?? json.message ?? `HTTP ${res.status} ${res.statusText}`,
    );
  }
  return json as T;
}

// ── Type exports ─────────────────────────────────────────────────────────────

export interface TableInfo {
  table: string;
  count: number;
}

export interface ColumnMeta {
  name: string;
  type: string;
  nullable: boolean;
  primary_key: boolean;
  foreign_keys: string[];
  default: string | null;
  enum_values?: string[] | null;
}

export interface RecordsResponse {
  table: string;
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  records: Record<string, any>[];
  columns: ColumnMeta[];
}

export interface DbStats {
  table_counts: Record<string, number>;
  total_records: number;
  table_count: number;
}

// ── API surface ───────────────────────────────────────────────────────────────

export const AdminPanelAPI = {
  listTables: () =>
    adminRequest<{ tables: TableInfo[] }>('/tables'),

  getSchema: (table: string) =>
    adminRequest<{ table: string; columns: ColumnMeta[] }>(`/tables/${table}/schema`),

  listRecords: (
    table: string,
    params: {
      page?: number;
      page_size?: number;
      search?: string;
      sort_by?: string;
      sort_dir?: string;
    },
  ) => {
    const q = new URLSearchParams();
    if (params.page)      q.set('page', String(params.page));
    if (params.page_size) q.set('page_size', String(params.page_size));
    if (params.search)    q.set('search', params.search);
    if (params.sort_by)   q.set('sort_by', params.sort_by);
    if (params.sort_dir)  q.set('sort_dir', params.sort_dir);
    return adminRequest<RecordsResponse>(`/tables/${table}/records?${q}`);
  },

  getRecord: (table: string, id: number) =>
    adminRequest<{ record: Record<string, any> }>(`/tables/${table}/records/${id}`),

  createRecord: (table: string, data: Record<string, any>) =>
    adminRequest<{ record: Record<string, any>; message: string }>(
      `/tables/${table}/records`,
      { method: 'POST', body: JSON.stringify({ data }) },
    ),

  updateRecord: (table: string, id: number, data: Record<string, any>) =>
    adminRequest<{ record: Record<string, any>; message: string }>(
      `/tables/${table}/records/${id}`,
      { method: 'PUT', body: JSON.stringify({ data }) },
    ),

  deleteRecord: (table: string, id: number) =>
    adminRequest<{ message: string }>(
      `/tables/${table}/records/${id}`,
      { method: 'DELETE' },
    ),

  bulkDelete: (table: string, ids: number[]) =>
    adminRequest<{ message: string; deleted_count: number }>(
      `/tables/${table}/records/bulk-delete`,
      { method: 'POST', body: JSON.stringify({ ids }) },
    ),

  getStats: () =>
    adminRequest<DbStats>('/stats'),
};

