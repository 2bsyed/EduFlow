"use client";

import { useEffect } from "react";

// Throttle pings to avoid redundant network overhead
let isPinging = false;
let lastPingTime = 0;
const PING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Pings both the backend directly and via the Next.js API route to wake up
 * both the backend container and the database serverless compute / connection pool.
 */
export function warmupBackend(reason: string = "auto") {
  if (typeof window === "undefined") return;

  const now = Date.now();
  if (isPinging || now - lastPingTime < PING_INTERVAL_MS) {
    return;
  }

  try {
    const stored = sessionStorage.getItem("eduflow_last_backend_ping");
    if (stored && now - Number(stored) < PING_INTERVAL_MS) {
      lastPingTime = Number(stored);
      return;
    }
  } catch {
    // Ignore storage unavailability (e.g. strict privacy mode)
  }

  isPinging = true;
  lastPingTime = now;
  try {
    sessionStorage.setItem("eduflow_last_backend_ping", String(now));
  } catch {
    // Ignore storage write issues
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // 1. Direct browser fetch to backend /health
  // Tells Render's edge router immediately to spin up the sleeping container
  if (backendUrl) {
    fetch(`${backendUrl}/health`, {
      method: "GET",
      mode: "cors",
      cache: "no-store",
    })
      .then((res) => {
        if (process.env.NODE_ENV !== "production") {
          console.debug(`[BackendWarmup] Direct ping responded (${reason}):`, res.status);
        }
      })
      .catch(() => {
        // Fallback with no-cors in case of cross-origin or strict referrer policy
        fetch(`${backendUrl}/health`, {
          method: "GET",
          mode: "no-cors",
          cache: "no-store",
        }).catch(() => {});
      });
  }

  // 2. Next.js server proxy ping (/api/ping)
  // Ensures Vercel's server environment also initiates contact with the backend
  fetch("/api/ping", {
    method: "GET",
    cache: "no-store",
  })
    .then((res) => res.json())
    .then((data) => {
      if (process.env.NODE_ENV !== "production") {
        console.debug(`[BackendWarmup] Proxy ping completed (${reason}):`, data);
      }
    })
    .catch(() => {})
    .finally(() => {
      isPinging = false;
    });
}

/**
 * Headless component that mounts on client and triggers backend & DB warm-up.
 */
export function BackendWarmup() {
  useEffect(() => {
    warmupBackend("mount");
  }, []);

  return null;
}
