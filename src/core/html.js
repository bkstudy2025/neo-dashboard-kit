// Neo Dashboard Kit — small HTML escaping helpers

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeAttr(value) {
  return escapeHtml(value);
}

export function safeUrl(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  // Relative HA/local paths are allowed; protocol-relative and malformed values
  // are intentionally not allowed for card/store-rendered links and images.
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;

  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch (_err) {
    return "";
  }
}
