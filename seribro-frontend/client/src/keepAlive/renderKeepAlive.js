// seribro-frontend/client/src/keepAlive/renderKeepAlive.js

/**
 * ⚠️ DEMO-ONLY KEEP ALIVE
 * Purpose:
 * - Prevent Render free backend from sleeping during live demo
 * - NOT for production use
 */

const RENDER_BACKEND_URL = "https://seribro-backend.onrender.com/";

// ping interval (12 minutes)
// const PING_INTERVAL = 12 * 60 * 1000;
const PING_INTERVAL = 5 * 1000;

export function startRenderKeepAlive() {
  // run immediately once
  pingBackend();

  // then keep pinging
  setInterval(pingBackend, PING_INTERVAL);
}

function pingBackend() {
  fetch(RENDER_BACKEND_URL, { method: "GET" })
    .then(() => {
      console.log("✅ Render backend keep-alive ping sent");
    })
    .catch((err) => {
      console.warn("⚠️ Render keep-alive failed:", err?.message);
    });
}
