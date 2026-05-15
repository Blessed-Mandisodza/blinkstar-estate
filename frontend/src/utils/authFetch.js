function normalizeApiBase(value = "") {
  const trimmed = String(value).trim().replace(/\/+$/, "");

  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(trimmed)) {
    return `http://${trimmed}`;
  }

  if (/^[\w.-]+\.[a-z]{2,}(:\d+)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

const API_BASE = normalizeApiBase(process.env.REACT_APP_API_URL || "");
const LOCAL_API_FALLBACK =
  typeof window !== "undefined" &&
  /^https?:\/\/(localhost|127\.0\.0\.1):3000$/.test(window.location.origin)
    ? window.location.origin.replace(/:3000$/, ":5000")
    : "";

function isDirectUrl(path = "") {
  return (
    path.startsWith("http") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  );
}

async function ensureApiDidNotReturnHtml(response, path) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("text/html")) {
    const preview = (await response.clone().text()).slice(0, 80).trim();
    throw new Error(
      `API returned HTML instead of JSON for ${path}. Check REACT_APP_API_URL, frontend rewrites, and whether the backend deployment includes this route. Preview: ${preview}`
    );
  }

  return response;
}

export function buildApiUrl(path = "") {
  if (!path) {
    return API_BASE;
  }

  if (isDirectUrl(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${normalizedPath}` : normalizedPath;
}

export function buildApiRedirectUrl(path = "") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (API_BASE) {
    return `${API_BASE}${normalizedPath}`;
  }

  if (LOCAL_API_FALLBACK) {
    return `${LOCAL_API_FALLBACK}${normalizedPath}`;
  }

  return normalizedPath;
}

export function resolveMediaUrl(path) {
  if (!path) {
    return "";
  }

  if (isDirectUrl(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return buildApiUrl(normalizedPath);
}

export async function apiFetch(path, init = {}) {
  const response = await fetch(buildApiUrl(path), init);
  return ensureApiDidNotReturnHtml(response, path);
}

export async function authFetch(path, init = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...(init.headers || {}) };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(buildApiUrl(path), {
    ...init,
    headers,
    credentials: init.credentials || "include",
  });

  await ensureApiDidNotReturnHtml(res, path);

  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (typeof window !== "undefined") {
      window.location.href = "/signin";
    }

    throw new Error("Session expired. Please sign in again.");
  }

  return res;
}

export default authFetch;
