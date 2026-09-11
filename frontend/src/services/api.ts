/**
 * API layer for ResQDrive. Phase 1/2 of the backend (see repo root README)
 * only ships `ai/inference/` as a local Python module — there is no FastAPI
 * service, database, or routing service running yet. This layer is written
 * against the API shape the project is heading toward (`GET /health`,
 * `POST /detect`, `GET /detections`, `POST /route`) so it can be pointed at
 * a real backend later purely via `VITE_API_BASE_URL`, with zero component
 * changes. Until that backend exists, every call fails fast and callers
 * fall back to the frontend-only simulation engine (see `state/`).
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export interface HealthResponse {
  status: string;
  version?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('No backend configured (VITE_API_BASE_URL unset) — using simulation mode');
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    throw new Error(`Request to ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>('/health');
}

export async function postDetect(payload: unknown): Promise<unknown> {
  return request('/detect', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getDetections(): Promise<unknown> {
  return request('/detections');
}

export async function postRoute(payload: unknown): Promise<unknown> {
  return request('/route', { method: 'POST', body: JSON.stringify(payload) });
}

export const isBackendConfigured = Boolean(API_BASE_URL);
