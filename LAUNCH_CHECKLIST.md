# Bapat Optics launch checklist

The landing page remains a separate app. Its “Check Full Inventory” CTA now routes to `/store` (override with `VITE_STORE_URL`). Store and admin API URLs are configurable with `VITE_API_URL`.

## Backend setup

1. Copy `backend/.env.example` to `backend/.env` and add the Neon URL, a generated `SECRET_KEY`, and Razorpay test/live credentials.
2. Install `backend/requirements.txt`, then run `uvicorn app.main:app --reload` from `backend`.
3. Create the first admin through a controlled database migration/seed process; public registration is always `CUSTOMER`.

Images are uploaded by admins via `POST /api/v1/uploads/image` (JPEG/PNG/WebP/AVIF, 8MB limit) and served from `/uploads`. For production, replace local storage with an object store (S3/R2) and add malware scanning/CDN transforms.

## Before production

- Run Alembic migrations instead of `create_all`, enable HTTPS, and set an explicit production CORS allow-list.
- Add rate limiting, email/phone verification, password reset, audit logs, webhook-based Razorpay reconciliation, and automated stock reservation expiry.
- Move uploads to object storage, add image resizing/WebP derivatives, transactional email/SMS, backups, monitoring, and a privacy/returns workflow.
- Add end-to-end tests for auth, catalog filters, stock races, payment replay, admin authorization, and checkout failures.
