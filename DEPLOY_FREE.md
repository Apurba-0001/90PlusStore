# 90PlusStore Free Hosting Playbook

Step-by-step, zero-cost deployment using common free tiers. Adjust names/URLs as needed.

## What You Need

- Backend (Node/Express) repo: this project’s `backend` folder
- Frontend (Vite/React) repo: this project’s `frontend` folder
- GitHub account (for connecting to hosts)
- MongoDB Atlas free cluster

## Environment Variables (Backend)

Create these in your hosting provider’s dashboard (never commit them):

- `PORT`: 10000 (or leave blank; host will inject one)
- `MONGO_URI`: from MongoDB Atlas connection string
- `JWT_SECRET`: any long random string
- `CORS_ORIGIN`: your frontend URL (e.g., `https://yourapp.netlify.app`)
- Optional: `NODE_ENV=production`

## MongoDB Atlas (Free Cluster)

1. Go to https://www.mongodb.com/atlas/database and create a free cluster.
2. Add a database user (username/password) and copy the SRV connection string.
3. Whitelist all IPs (0.0.0.0/0) for quick setup, or add your host’s IP.
4. Replace `<username>`, `<password>`, `<dbname>` in the string; set it as `MONGO_URI`.

## Backend on Render (Free Web Service)

1. Push your code to GitHub (monorepo is fine).
2. Visit https://render.com, create a “Web Service”.
3. Select the repo; choose the `backend` root.
4. Runtime: Node; Build Command: `npm install` ; Start Command: `npm start` (matches your `backend/package.json`).
5. Add Environment Variables from the list above.
6. Deploy. Note the Render URL (e.g., `https://your-api.onrender.com`).

## Backend on Railway (Alternative Free Tier)

1. Go to https://railway.app, create a project, “Deploy from Repo”.
2. Pick the repo; set root to `backend`.
3. Variables tab: add `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT` (use `$PORT` if Railway injects it).
4. Railway auto-installs and runs `npm start` by default; adjust if needed.
5. Deploy and grab the public URL.

## Frontend on Netlify (Free)

1. Build locally once to confirm: from `frontend`, run `npm install` then `npm run build`.
2. Commit/push changes.
3. Go to https://app.netlify.com, “New site from Git”, pick the repo, set Base directory: `frontend`.
4. Build Command: `npm run build`; Publish directory: `dist`.
5. Add Environment Variable `VITE_API_URL` pointing to your backend URL (Render/Railway).
6. Deploy. Netlify gives you a site URL; set this URL as `CORS_ORIGIN` on the backend.

## Frontend on Vercel (Alternative Free Tier)

1. Visit https://vercel.com, “Add New Project”, import the repo.
2. Framework: Vite; Root Directory: `frontend`.
3. Build Command: `npm run build`; Output: `dist`.
4. Environment Variable: `VITE_API_URL` = backend URL.
5. Deploy and note the Vercel domain; update backend `CORS_ORIGIN` with it.

## Verify End-to-End

1. Backend health: open `https://your-api.onrender.com/health` (or `/` if that’s your ping route) to confirm it responds.
2. Frontend: open the Netlify/Vercel URL and browse products.
3. Auth: register/login; ensure emails send/receive (if applicable) and JWT flow works.
4. Admin: log in as admin, confirm product CRUD and pagination.

## Useful Local Commands

- Backend dev: `cd backend && npm install && npm run dev`
- Backend prod build (if applicable): `cd backend && npm install`
- Frontend dev: `cd frontend && npm install && npm run dev`
- Frontend build check: `cd frontend && npm run build`

## If Something Breaks

- 404/500 from backend: check Render/Railway logs.
- CORS errors: ensure `CORS_ORIGIN` matches the frontend URL exactly.
- Mongo connect errors: recheck `MONGO_URI`, user/password, and IP whitelist.
- Env not picked up: redeploy after editing variables.

## Minimal Checklist

- [ ] Atlas cluster + `MONGO_URI`
- [ ] Backend deployed (Render/Railway) with env vars
- [ ] Frontend deployed (Netlify/Vercel) with `VITE_API_URL`
- [ ] CORS_ORIGIN set to frontend URL
- [ ] Smoke test auth, products, cart, checkout
