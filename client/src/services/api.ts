const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

function getCookie(name: string) {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()\[\]\\\/\+^]/g, '\\$&') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : undefined;
}

async function request(path: string, options: RequestInit = {}, isForm = false) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      'x-csrf-token': getCookie('csrfToken') || ''
    },
    ...options
  });
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) throw data;
  return { data };
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body: any, isForm = false) =>
    request(path, { method: 'POST', body: isForm ? body : JSON.stringify(body) }, isForm),
  put: (path: string, body: any) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path: string) => request(path, { method: 'DELETE' })
};


