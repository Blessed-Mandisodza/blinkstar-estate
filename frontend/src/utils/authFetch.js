const API_BASE = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");

async function ensureApiDidNotReturnHtml(response, path) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("text/html")) {
    const preview = (await response.clone().text()).slice(0, 80).trim();
    throw new Error(
      `API returned HTML instead of JSON for ${path}. Check REACT_APP_API_URL and your Vercel project domains. Preview: ${preview}`
    );
  }

  return response;
}

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

  if (path.startsWith("data:") || path.startsWith("blob:")) {
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
