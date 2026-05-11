/**
 * Cliente de la API. Mismo origen en producción (admin.noracx.com → noracx.com/api/*
 * vía CORS, OR usamos PUBLIC_API_URL para apuntar al worker explícitamente).
 * En dev local apunta al worker corriendo en localhost:8787.
 */

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8787';

export interface ApiError {
  ok: false;
  error: string;
}

export interface ApiOk<T = unknown> {
  ok: true;
  [key: string]: unknown;
  data?: T;
}

export async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; body: T | ApiError }> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const body = (await res.json().catch(() => ({ ok: false, error: 'invalid_json' }))) as
    | T
    | ApiError;
  return { ok: res.ok, status: res.status, body };
}

export interface MeResponse {
  ok: true;
  user: {
    id: string;
    email: string;
    role: 'owner' | 'editor' | 'viewer';
  };
}

export async function getMe(): Promise<MeResponse['user'] | null> {
  const res = await apiFetch<MeResponse>('/api/admin/me');
  if (!res.ok || !('user' in (res.body as object))) return null;
  return (res.body as MeResponse).user;
}

export async function login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const res = await apiFetch<{ ok: boolean; error?: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (res.ok) return { ok: true };
  const body = res.body as ApiError;
  return { ok: false, error: body.error ?? 'login_failed' };
}

export async function logout(): Promise<void> {
  await apiFetch('/api/admin/logout', { method: 'POST' });
}

export interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  type: 'booking' | 'press' | 'general';
  message: string;
  language: 'es' | 'en';
  country: string | null;
  createdAt: number;
  readAt: number | null;
  repliedAt: number | null;
}

export interface ContactMessagesResponse {
  ok: true;
  data: ContactMessageRow[];
  unreadCount: number;
}

export async function listContactMessages(): Promise<ContactMessagesResponse | null> {
  const res = await apiFetch<ContactMessagesResponse>('/api/admin/contact-messages');
  if (!res.ok) return null;
  return res.body as ContactMessagesResponse;
}

export type ContactMessageAction =
  | 'mark-read'
  | 'mark-unread'
  | 'mark-replied'
  | 'mark-unreplied';

export async function patchContactMessage(
  id: string,
  action: ContactMessageAction,
): Promise<boolean> {
  const res = await apiFetch(`/api/admin/contact-messages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  });
  return res.ok;
}

export interface FanRow {
  id: string;
  email: string;
  name: string | null;
  country: string | null;
  city: string | null;
  source: string;
  language: 'es' | 'en';
  optedInAt: number;
  confirmedAt: number | null;
  unsubscribedAt: number | null;
  deletedAt: number | null;
}

export interface FansSummary {
  totalActive: number;
  totalUnsubscribed: number;
  byLanguage: Array<{ language: 'es' | 'en'; count: number }>;
}

export interface FansResponse {
  ok: true;
  data: FanRow[];
  summary: FansSummary;
}

export interface FansFilters {
  q?: string;
  lang?: 'es' | 'en';
  country?: string;
  includeUnsubscribed?: boolean;
}

export async function listFans(filters: FansFilters = {}): Promise<FansResponse | null> {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.lang) params.set('lang', filters.lang);
  if (filters.country) params.set('country', filters.country);
  if (filters.includeUnsubscribed) params.set('include_unsubscribed', '1');
  const qs = params.toString();
  const res = await apiFetch<FansResponse>(`/api/admin/fans${qs ? `?${qs}` : ''}`);
  if (!res.ok) return null;
  return res.body as FansResponse;
}
