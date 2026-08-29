# Bapat Optics project status

## What we built

- Isolated landing, storefront, admin CRM, and FastAPI backend applications.
- Neon PostgreSQL catalog, taxonomy, users, inquiries, orders, appointments, and branch inventory.
- JWT authentication with mandatory customer sign-in at checkout and admin role enforcement.
- Server-side price validation, stock locking, payment verification, and replay protection.
- Razorpay test/mock checkout configuration.
- Admin drag-and-drop image uploads with validation.
- GST and shipping calculation, return/refund policy endpoint, and branch availability API.
- Rate limiting, security headers, request IDs, health checks, Docker backend image, and smoke tests.
- MediaPipe Face Landmarker running from self-hosted model/WASM assets; privacy-first selfie/camera analysis.
- Self-hosted GLB frame asset at `store/public/models/bapat-frame.glb`.

## Current validation

- Neon connection and schema initialization verified.
- Catalog seeded/verified: 8 categories, 65 brands, 15 products.
- Backend smoke tests pass.
- Store and admin TypeScript checks pass.

## Remaining before public launch

- Select hosting, domains, SSL, CDN, object storage, monitoring, and backup providers.
- Replace test Razorpay/mock mode with live keys and signed webhooks.
- Calibrate a GLB model per frame SKU; the included model is a development asset, not a complete catalog.
- Validate try-on on current iOS Safari, Android Chrome, and desktop browsers.
- Run complete staging checkout, refund, stock-race, and admin authorization tests.
- Confirm GST/returns policy with a CA and publish legal pages.
- Rotate credentials that were shared during development.
