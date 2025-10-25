import { useEffect, useState } from "react";

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // Let same-tab listeners opt-in if they want a manual signal
    window.dispatchEvent(new CustomEvent("localstore:set", { detail: { key } }));
  } catch {}
}

export function remove(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent("localstore:remove", { detail: { key } }));
  } catch {}
}

export function updateJSON<T>(key: string, fallback: T, updater: (prev: T) => T): T {
  const next = updater(readJSON<T>(key, fallback));
  writeJSON<T>(key, next);
  return next;
}

// React hook with cross-tab sync

export function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => readJSON<T>(key, initial));

  useEffect(() => {
    writeJSON<T>(key, value);
  }, [key, value]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onStorage = (e: StorageEvent) => {
      if (e.key === key) setValue(readJSON<T>(key, initial));
    };
    const onCustom = (e: Event) => {
      const detailKey = (e as CustomEvent).detail?.key;
      if (detailKey === key) setValue(readJSON<T>(key, initial));
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("localstore:set", onCustom as EventListener);
    window.addEventListener("localstore:remove", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("localstore:set", onCustom as EventListener);
      window.removeEventListener("localstore:remove", onCustom as EventListener);
    };
  }, [key, initial]);

  return [value, setValue];
}

export function makeStore<T>(key: string, initial: T) {
  return {
    useValue: () => useLocalStorage<T>(key, initial),
    get: () => readJSON<T>(key, initial),
    set: (v: T) => writeJSON<T>(key, v),
    clear: () => remove(key),
    update: (fn: (prev: T) => T) => updateJSON<T>(key, initial, fn),
  };
}