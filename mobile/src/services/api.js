const API_BASE = (process.env.EXPO_PUBLIC_API_URL || "https://estate-backend-chi.vercel.app").replace(
  /\/$/,
  ""
);

export const WEB_BASE_URL = (process.env.EXPO_PUBLIC_WEB_URL || "https://blinkstar-estate.vercel.app").replace(
  /\/$/,
  ""
);

const ensureApiDidNotReturnHtml = async (response, path) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("text/html")) {
    const preview = (await response.clone().text()).slice(0, 80).trim();
    throw new Error(`API returned HTML for ${path}: ${preview}`);
  }

  return response;
};

export function buildApiUrl(path = "") {
  if (!path) {
    return API_BASE;
  }

  if (path.startsWith("http")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
}

export function resolveMediaUrl(path) {
  if (!path) {
    return "";
  }

  if (
    path.startsWith("http") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return buildApiUrl(normalizedPath);
}

export async function apiFetch(path, init = {}) {
  const response = await fetch(buildApiUrl(path), init);
  return ensureApiDidNotReturnHtml(response, path);
}

export async function authFetch(path, token, init = {}) {
  const headers = { ...(init.headers || {}) };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers,
  });

  await ensureApiDidNotReturnHtml(response, path);

  if (response.status === 401) {
    throw new Error("Session expired. Please sign in again.");
  }

  return response;
}
