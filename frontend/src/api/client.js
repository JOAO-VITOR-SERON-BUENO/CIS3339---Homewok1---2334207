/**
 * Small wrapper around fetch() for the Express REST API.
 * Throws an ApiError with a user-friendly message on any failure.
 */
export class ApiError extends Error {
  constructor(message, { status = 0, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const BASE_URL = '/api';

async function request(method, path, body) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check that the backend is running.');
  }

  let data = null;
  const isJson = response.headers.get('content-type')?.includes('application/json');
  if (isJson) {
    data = await response.json().catch(() => null);
  }

  if (!response.ok) {
    const message = data?.error || `Request failed (${response.status} ${response.statusText})`;
    throw new ApiError(message, { status: response.status, details: data?.details });
  }

  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  delete: (path) => request('DELETE', path),
};
