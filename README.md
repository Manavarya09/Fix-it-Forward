# Fix-It Forward Shop

![Store hero preview](img/hero-2026-03-15.png)

This repository contains the Fix-It Forward storefront prototype, combining a static front-end with a lightweight Express+SQLite backend. The focus is on clearly structured assets, documented setup steps, and a resilient API surface so future contributors can pick up the work and extend it confidently.

## Repository structure

| Area | Description |
| --- | --- |
| `index.html`, `intro.html`, `shop.html`, etc. | Static entrypoints covering the landing page, store, product, and account views. Each file pairs with `js/` for behavior and `css/` for surface styling. |
| `css/` | Collection of vendor and custom styles, including global layout rules, typography tokens, and component-specific `.scss` sources used to prototype the UI. |
| `js/` | Front-end controllers for product browsing, cart management, checkout flows, and UI helpers (modals, search, pagination). `app.js` is the main orchestrator, while smaller modules keep featured behavior isolated. |
| `fonts/`, `img/`, `frames/`, `video/` | Static assets that deliver the visual polish referenced by the templates. |
| `api/` | Express + SQLite backend that serves the front-end as static files while exposing `/api/*` endpoints (products, auth, cart, orders, inventory, promotions, events). See [`api/README-BACKEND.md`](api/README-BACKEND.md) for the service contract. |
| `scripts/` | Utilities that inject configuration at build time, such as generating `js/api-config.js` so clients can target a deployed API host. |
| `styles.css`, `vercel.json` | Root-level hooks for global styles and deployment rewrites when hosting on Vercel. |

## Project structure

- `js/`: front-end controllers live here. `app.js` ties product rendering, cart/cart persistence, and checkout state to the UI, while helper scripts (`search-pagination.js`, `product-details-populate.js`, `orders.js`, etc.) scope individual behaviors for clarity.
- `css/` & `sass/`: vendor styles are loaded from `css/` (Bootstrap, slicknav, icons), and our SCSS source files under `sass/` capture component-based rules that compile into `global.css`/`styles.css`. Assets rely on this cascade for responsive layouts, typography tokens, and utility classes.
- `img/`, `fonts/`, `video/`, `frames/`: visual flavor is centralized here—banner photography, product shots, icon fonts, and promo videos referenced by the HTML templates to keep markup clean.
- `api/`: lightweight backend with Express + SQLite. Routes under `/api/*` handle products, auth, carts, orders, inventory, promotions, and events while also serving the front-end build.
- `scripts/`: build-time helpers such as `generate-api-config.js` produce `js/api-config.js` so the client can target different API hosts without changing source code.
- `styles.css`, `vercel.json`: root-level style overrides and Vercel rewrites (e.g., `/api/:path*`) ensure the deployment environment can integrate with the backend smoothly.

## Setup & run

### Front-end only (static preview)

1. Open the repository root in your editor.  
2. Launch `index.html` (or any other entrypoint) in a browser directly or via your editor’s “Open in Browser”.  
3. Interactions (add to cart, search, checkout) will run entirely in the browser because the data is bootstrapped from the front-end assets.

### Full stack (front-end + backend)

1. Install backend dependencies:
   ```bash
   cd api
   npm install
   ```
2. Start the server (serves both API and static client assets):
   ```bash
   cd api
   npm start
   # opens http://localhost:3000
   ```
3. The Express app uses `better-sqlite3` to read/write `api/fif.db` and seeds products from `js/products.js` if those fixtures exist. Authentication is handled with JWT cookies (`fif_token`).
4. The server exposes `/api/*` endpoints for:
   - product listings and detail queries
   - cart persistence
   - user authentication and protected orders/inventory routes
   - promotions and event metadata used by the UI

### Deploying & API configuration

1. The front-end build step (`npm run build`) runs `scripts/generate-api-config.js`, which outputs `js/api-config.js` setting `window.__API_BASE` to the `API_BASE` environment variable.
2. When serving the static site, the client code loads `js/api-config.js` (if present) so every fetch call can be prefixed with `window.__API_BASE || ''` to target remote APIs.
3. On Vercel, deploy the root as a static project, set the `API_BASE` env var, and optionally add a `/api/:path*` rewrite if the backend sits elsewhere.

## Key fixes & enhancements

- Stabilized UX: the store supports browsing, cart updates, checkout, and status messages with consistent styling drawn from `css/` and `scss/` modules.
- Backend wiring: Express now boots SQLite persistence, seeds products, and asserts JWT-based auth so cart/orders persist across sessions instead of being purely front-end memory.  
- API surface: new endpoints cover products, cart, orders, inventory, promotions, and events, offering a foundation to add future features such as saved carts or order tracking.  
- Deployment clarity: `scripts/generate-api-config.js` and the `vercel.json` notes document how to switch between local, staging, and production APIs without changing source code.
- Maintainability: logical splits between UI scripts, static assets, and backend services make it easier to hand the project to the next engineer with clear boundaries.

## Technologies

- Front-end: Vanilla HTML/CSS/JavaScript plus structured asset directories; layout depends on `styles.css` plus numerous vendor CSS files for icons, carousels, and UI helpers.  
- Back-end: Node.js + Express, JWT-auth via `jsonwebtoken`, persistent storage with `better-sqlite3`, request logging with `morgan`, security helpers such as `cookie-parser`, and `bcrypt` for password hashing.  
- Tooling: `scripts/generate-api-config.js` bridges env vars to the browser, and `npm run build` simply ensures the config is emitted before shipping the site.

## Testing & validation

- Manual walkthroughs cover product browsing, cart arithmetic, checkout submissions, and promotions when the backend is running.  
- The API exposes health endpoints during development, and `migrate.js` can reset or seed the SQLite database (`npm run migrate`).

## Next steps

1. Add automated unit or integration tests for the API endpoints and cart logic.  
2. Expand the admin/inventory views with stock management and promotions authoring.  
3. Improve accessibility (keyboard flow, screen-reader announcements) and performance (image optimization, code splitting) as the asset graph grows.