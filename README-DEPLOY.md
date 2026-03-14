Deploying the frontend to Vercel

This repo contains a static frontend (root) and a small backend under `/api`.
The steps below deploy only the frontend to Vercel and optionally let you configure an API base URL so client fetches target your deployed backend.

Quick steps (fastest)
1. Push this repository to GitHub (or connect your Git provider to Vercel).
2. In the Vercel dashboard, import the repository as a new project.
   - Framework Preset: Other
   - Leave Build & Output settings as default; Vercel will run `npm run build` (see below).
3. In Vercel Project Settings → Environment Variables, add `API_BASE` with the value of your backend (e.g. `https://my-api.onrender.com`).
4. Deploy. The root of the repo will be served as a static site.

How it works
- At build time Vercel runs `npm run build` which executes `scripts/generate-api-config.js`.
- That script writes `js/api-config.js` with a line assigning `window.__API_BASE` to the value of the `API_BASE` env var.
- On the client, `js/app.js` loads `js/api-config.js` if present. Client code can then use `window.__API_BASE` as the base host for API calls.

Client usage notes
- Existing code uses `fetch('/api/..')`. To point those calls to a remote backend, update calls to `fetch((window.__API_BASE || '') + '/api/...')` or prepend `window.__API_BASE` where needed.
- As a pragmatic option, you can set up a rewrite from Vercel to your backend, but the easiest robust approach is to set `API_BASE` to your backend URL and update client fetches.

Optional: Rewrites
- If you host backend separately and want the frontend to proxy `/api/*` to it, add a `vercel.json` rewrite mapping `/api/:path*` to your backend. (Note: `vercel.json` cannot interpolate env vars in the destination.)

Caveats
- If you want the backend deployed on Vercel too, convert the Express app to serverless functions and replace SQLite with a managed DB.
- Vercel's static hosting serves the files exactly as in the repo root; ensure your build does not move files out of the root unless you change `vercel.json`.

If you want, I can:
- Add quick PR edits to change client fetch calls to use `window.__API_BASE` safely across the codebase.
- Provide a one-click guide to deploy the backend to Render and the frontend to Vercel with a working rewrite.

