import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSecureId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function generateSecureShortId(prefix?: string) {
  let randomHex = "";
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const array = new Uint8Array(5);
    crypto.getRandomValues(array);
    randomHex = Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 8);
  } else {
    randomHex = Math.random().toString(36).slice(2, 10);
  }

  const timestamp = Date.now().toString(36);
  const core = `${timestamp}-${randomHex}`;

  return prefix ? `${prefix}-${core}` : core;
}
