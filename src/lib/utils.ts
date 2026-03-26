import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a secure random UUID (v4) using the Web Crypto API.
 * Falls back to a Math.random-based pseudo-UUID if crypto is unavailable (e.g., local non-HTTPS).
 */
export function generateSecureId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // Fallback for non-secure contexts (http://localhost)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

/**
 * Generates a secure short ID using the Web Crypto API.
 * Returns a 8-character string of hex digits.
 * Falls back to Math.random() if crypto is unavailable.
 */
export function generateSecureShortId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0].toString(16).padStart(8, "0").slice(0, 8);
  }

  // Fallback for non-secure contexts
  return Math.random().toString(36).substring(2, 10).padEnd(8, "0");
}
