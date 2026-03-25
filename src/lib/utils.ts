import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 🛡️ Sentinel: Securely generate unique IDs.
 * Prefer `crypto.randomUUID()` for cryptographically secure UUIDs.
 * Fallback to `crypto.getRandomValues()` if `randomUUID` is unavailable.
 * Last resort: `Math.random()` to prevent crashes on non-secure (HTTP) networks where `crypto` is undefined.
 */
export function generateSecureId(): string {
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    if (typeof crypto.getRandomValues === "function") {
      // Fallback for environments where crypto exists but randomUUID doesn't
      // e.g. some older browsers or specific JS contexts
      return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16),
      );
    }
  }

  // Last resort fallback (e.g. localhost HTTP without crypto)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

/**
 * 🛡️ Sentinel: Generate a secure short ID, useful for suffixes.
 */
export function generateSecureShortId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0].toString(36).padStart(7, "0").slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 8);
}
