# SahiRate architecture

## Product surfaces

- Collector PWA: scan, compose a lot, indicative price discovery, verified recycler discovery, signed handover, payment and earnings ledger.
- Recycler UI: review incoming lots, verify physical weight, make an offer, issue a short-lived signed QR payload, and record payment.
- Admin UI: recycler verification, price observations, sync/audit review, anomaly review, and analytics.

## Offline-first client

The React/Vite client runs the YOLO11 segmentation model with ONNX Runtime Web (WebGPU first, WASM fallback). The model is kept at `public/models/best.onnx`. The production implementation should add Dexie/IndexedDB for lots, photo references, cached prices/recyclers, handovers, payments, an outbox, sync logs, and model metadata. A service worker makes the app shell, model, and bundled audio available after first load.

## Server boundary

FastAPI exposes versioned endpoints for lots, price observations, matching, handovers, payments and idempotent outbox sync. PostgreSQL stores canonical operational records; PostGIS supports location-based recycler matching. The server performs authoritative validation when devices reconnect.

## Trust and traceability

The client preserves AI estimate, collector-entered weight, recycler verified weight, rate, payment and timestamps as separate facts. A SHA-256 chained audit event is written for each important state transition. Rule checks and an anomaly model flag unusual transactions for review; neither replaces human review.

## Current prototype status

The collector UI and on-device scan are implemented. Price ranges, recycler offers, QR and ledger content are explicitly demonstration data until connected to FastAPI, PostgreSQL, field-collected price observations, verified recycler records and signed QR keys.
