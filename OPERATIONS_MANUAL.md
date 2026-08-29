# Bapat Optics operations and installation manual

## Local installation

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
python -m app.seed
python run.py
```

Backend API: `http://127.0.0.1:8000`, documentation: `/docs`.

### Store and admin

```powershell
cd store
npm install
npm run dev

cd ..\admin
npm install
npm run dev
```

Landing uses its own `npm install` and dev command in `bapat-optics-landing`.

## Environment files

Each app has its own `.env` and `.env.example`. Frontends use `VITE_API_URL` and cross-app URL variables. Backend secrets belong only in `backend/.env`; never commit it.

## Production deployment sequence

1. Provision Neon, object storage, email, Razorpay, and hosting.
2. Set production environment variables and rotate all staging secrets.
3. Run additive migrations and seed taxonomy (never seed demo credentials in production).
4. Build each frontend with `npm run build` in CI.
5. Deploy backend behind HTTPS and a reverse proxy; set an explicit CORS allow-list.
6. Configure Razorpay webhooks, health checks, logs, alerts, backups, and restore drills.
7. Run checkout, payment, refund, stock-concurrency, upload, camera, and accessibility QA.
8. Promote from staging to production only after sign-off.

## Try-on assets

The MediaPipe model and WASM runtime are self-hosted under `store/public/models` and `store/public/mediapipe-wasm`. Replace `bapat-frame.glb` with calibrated frame-specific GLB files and tune scale/anchor metadata per SKU for optical-grade fitting.
