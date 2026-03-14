# Fix-It-Forward API — Backend README

This document describes how to run and migrate the minimal Express + SQLite backend used in this workspace.

Requirements
- Node.js 18.x (recommended) — `better-sqlite3` native modules are built for Node 18 in development.
- npm
- (Optional) Docker

Environment
Copy and edit the example file:

```bash
cp .env.example .env
# Edit .env to set JWT_SECRET and DB_* if needed
```

Key env vars
- `PORT` — HTTP port (default 3000)
- `JWT_SECRET` — secret for signing auth tokens (change in production)
- `DB_PATH` — directory for the SQLite DB (defaults to project `api/`)
- `DB_FILE` — filename for the DB (defaults to `fif.db`)

Install dependencies

```bash
cd api
# use Node 18 (nvm install 18; nvm use 18)
npm install
```

Apply migrations

```bash
cd api
npm run migrate
# or
node migrate.js
```

Start server

```bash
cd api
# Run with environment variables set, e.g.:
export JWT_SECRET=your_secret_here
export PORT=3000
node index.js
# or use npm start
npm start
```

Health check

- GET `/api/health` — returns `{ "ok": true }` when server is running.

Notes about SQLite & native modules

- `better-sqlite3` is a native addon and must be built for the Node version you use. Use Node 18 for local development and CI images.
- If you switch Node versions, remove `node_modules` and reinstall (`rm -rf node_modules package-lock.json && npm install`).

Docker (simple)

```bash
# Build image
docker build -t fif-api ./api

# Run (bind mount for local DB persistence)
docker run --rm -p 3000:3000 -v "$(pwd)/api:/srv/app" -e JWT_SECRET=secret123 fif-api
```

Development tips

- Migrations are recorded in the `migrations` table inside the SQLite DB.
- The migrate script reads `api/migrations/*.sql` in lexicographic order and applies any not yet recorded.
- DB file defaults: `api/fif.db`.

Troubleshooting

- `Error: module compiled against a different Node.js version` — switch to Node 18 and reinstall native deps.
- If migrations don't appear applied, inspect the `migrations` table inside the DB:

```bash
node -e "const Database=require('better-sqlite3'); const db=new Database('api/fif.db'); console.log(db.prepare('SELECT * FROM migrations').all());"
```

Contact
- For follow-ups, ask here and I can add CI scripts, Docker Compose, or a richer README with deploy notes.
