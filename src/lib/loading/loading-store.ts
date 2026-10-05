import { useSyncExternalStore } from "react";

/**
 * Global pending-work counter that drives the centered loading bar.
 *
 * Any code can call `beginLoading()` and the returned `end` function; network
 * requests are counted automatically by `installFetchTracking()`.
 */
let pending = 0;
let started = 0;
let completed = 0;
let generation = 0;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export function beginLoading(): () => void {
  if (pending === 0) {
    started = 0;
    completed = 0;
    generation += 1;
  }
  pending += 1;
  started += 1;
  emit();
  let isDone = false;
  return () => {
    if (isDone) return;
    isDone = true;
    pending = Math.max(0, pending - 1);
    completed += 1;
    emit();
  };
}

export async function trackLoading<T>(work: Promise<T>): Promise<T> {
  const end = beginLoading();
  try {
    return await work;
  } finally {
    end();
  }
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useLoadingSnapshot = () => useSyncExternalStore(
  subscribe,
  () => `${generation}:${pending}:${started}:${completed}`,
  () => "0:0:0:0",
);

const IGNORED_URL_PARTS = ["/_vercel/", "vitals.vercel", "/@vite/", "/__vite", "hot-update"];

/** Count every window.fetch so all API waits show the bar without per-call wiring. */
export function installFetchTracking(): void {
  if (typeof window === "undefined") return;
  const marked = window as Window & { __loadingTracked?: boolean };
  if (marked.__loadingTracked) return;
  marked.__loadingTracked = true;
  const original = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (IGNORED_URL_PARTS.some((part) => url.includes(part))) return original(input, init);
    return trackLoading(original(input, init));
  };
}
