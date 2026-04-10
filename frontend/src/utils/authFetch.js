const API_BASE = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");

export function buildApiUrl(path = "") {
  if (!path) {
    return API_BASE;
  }

  if (path.startsWith("http")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${normalizedPath}` : normalizedPath;
}

export function resolveMediaUrl(path) {
  if (!path) {
    return "";
  }

  if (path.startsWith("http")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return buildApiUrl(normalizedPath);
}

export async function apiFetch(path, init = {}) {
  return fetch(buildApiUrl(path), init);
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
