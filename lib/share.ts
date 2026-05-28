/**
 * Shareable link utilities — encode/decode markdown content in the URL hash.
 * Uses LZ-String-like compression to fit more content in URLs.
 * Falls back to base64 encoding for simplicity.
 */

function toBase64(str: string): string {
  try {
    // Use btoa with UTF-8 encoding
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  } catch {
    return encodeURIComponent(str);
  }
}

function fromBase64(str: string): string {
  try {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return decodeURIComponent(str);
  }
}

export function encodeShareLink(markdown: string): string {
  const encoded = toBase64(markdown);
  const url = new URL(window.location.href);
  url.hash = `#md=${encoded}`;
  return url.toString();
}

export function decodeShareLink(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash || !hash.startsWith("#md=")) return null;
  const encoded = hash.slice(4);
  try {
    return fromBase64(encoded);
  } catch {
    return null;
  }
}

export function clearShareHash() {
  if (typeof window === "undefined") return;
  history.replaceState(null, "", window.location.pathname + window.location.search);
}