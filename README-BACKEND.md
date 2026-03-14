Backend — Quick start

1. Install dependencies

```bash
cd api
npm install
```

2. Start server (serves frontend + API)

```bash
cd api
npm start
# Open http://localhost:3000
```

Notes:
- The server uses SQLite file at `api/fif.db` and seeds products from `js/products.js` if available.
- Endpoints are under `/api/*` (products, auth, cart, orders, inventory, promotions, events).
- Authentication uses JWT in an HTTP-only cookie named `fif_token`.
