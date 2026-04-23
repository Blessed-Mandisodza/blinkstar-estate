import { buildApiUrl, resolveMediaUrl } from "./utils/authFetch";

test("builds API URLs with normalized paths", () => {
  expect(buildApiUrl("/api/property")).toMatch(/\/api\/property$/);
  expect(buildApiUrl("api/property")).toMatch(/\/api\/property$/);
});

test("leaves absolute and inline media URLs untouched", () => {
  expect(resolveMediaUrl("https://example.com/photo.jpg")).toBe(
    "https://example.com/photo.jpg"
  );
  expect(resolveMediaUrl("data:image/png;base64,abc")).toBe(
    "data:image/png;base64,abc"
  );
});
