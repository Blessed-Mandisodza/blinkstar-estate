import { resolveMediaUrl } from "../services/api";

export function formatPrice(price) {
  const amount = Number(price);

  if (!Number.isFinite(amount)) {
    return "Price on request";
  }

  return `$${amount.toLocaleString()}`;
}

export function formatLabel(value) {
  if (!value) return "N/A";

  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDate(date) {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function resolveImageUrl(path) {
  return resolveMediaUrl(path);
}

export function getPropertyImage(property) {
  const image =
    property?.images?.[0] || property?.imageUrl || "https://placehold.co/900x700/e2e8f0/64748b?text=BlinkStar";

  return resolveImageUrl(image);
}

export function normalizeWhatsAppPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (!digits) {
    return "263782931905";
  }

  if (digits.startsWith("0")) {
    return `263${digits.slice(1)}`;
  }

  return digits;
}
