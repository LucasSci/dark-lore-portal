import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a secure random UUID with a fallback to Math.random()
 * for non-secure contexts (like local HTTP development).
 */
export function generateSecureId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // Fallback for non-secure contexts
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

/**
 * Generates a short, secure random ID, usually combining a timestamp
 * and random bytes to avoid collisions.
 */
export function generateSecureShortId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const array = new Uint8Array(4);
    crypto.getRandomValues(array);
    const hex = Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 6);
    return `${Date.now()}-${hex}`;
  }

  // Fallback for non-secure contexts
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
