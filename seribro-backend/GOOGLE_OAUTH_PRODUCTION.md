Google OAuth — Production Deployment Checklist

✅ Purpose: Ensure Google OAuth works in production (deployed frontend + backend) and avoids localhost fallbacks.

Steps:

1) Google Cloud Console (OAuth 2.0 Client) settings
   - Authorized JavaScript origins:
     - Add your frontend origin (including protocol). Example: https://app.example.com
   - Authorized redirect URIs:
     - Add your backend callback URL exactly (no trailing slash):
       - https://api.example.com/auth/google/callback
     - If you use an alternative domain for staging, add it too.
   - Save changes and wait a minute for propagation.

2) Backend configuration (server / environment)
   - Set the following environment variables on your server (do NOT rely on code fallbacks in production):
     - BACKEND_URL=https://api.example.com
     - FRONTEND_URL=https://app.example.com
     - GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET (from GCP)
   - In production the server will abort the OAuth flow if BACKEND_URL or FRONTEND_URL are not set (see server logs).
   - Verify server logs for messages printed during OAuth flow: "Google OAuth redirectUri:" and "Google OAuth final redirect to frontend:" to confirm the values used.

3) Frontend build config
   - Ensure frontend build-time env contains the backend host so the login button points to the correct backend:
     - Vite: set VITE_API_URL or VITE_API_BASE_URL to your backend (e.g., https://api.example.com)
     - Or set REACT_APP_BACKEND_URL / REACT_APP_API_URL for compatibility
   - The frontend derives the OAuth entrypoint from axios API instance (API.defaults.baseURL), so the build must have correct API_URL.

4) Common pitfalls
   - Trailing slashes: ensure your callback URI in GCP matches the backend-generated redirect URI (server strips trailing slash automatically).
   - Protocol mismatch (http vs https): use https in production.
   - Missing env vars in production: server now logs a warning and will return 500 for misconfiguration.

5) Testing
   - After setting envs and saving GCP config, deploy backend and frontend and visit the frontend login page.
   - Click "Continue with Google" and observe the redirect to Google consent. After granting access, Google should redirect to
     https://api.example.com/auth/google/callback and then back to https://app.example.com/auth/google/success?token=...
   - Check server logs for the printed redirect URIs as a quick debug.

If issues persist, collect these logs and env outputs and open an issue with the exact values (mask secrets):
  - Server log lines around OAuth flow
  - The BACKEND_URL and FRONTEND_URL values (mask host if needed)
  - The exact redirect URI shown in the Google error page (if any)

---

Created to help deploy Google OAuth reliably in production. Keep sensitive values (client secret) out of source control and use your cloud provider's secret manager or environment configuration.