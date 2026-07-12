# WebPulse – Website & API Health Monitor

A full-stack uptime monitoring system. Add any website or API URL and WebPulse
will check it on a configurable interval, track response times, and alert you
via browser notifications when something goes down (or comes back up).

**Stack:** Go (Gin) · PostgreSQL · React (Vite)

---

## Project structure

```
webpulse/
├── backend/              Go + Gin API server
│   ├── config/           Environment config loader
│   ├── database/         PostgreSQL connection
│   ├── models/           Data models & request types
│   ├── controllers/      HTTP handlers
│   ├── routes/           Route registration
│   ├── services/         Background monitoring engine
│   └── middleware/       Request logger
├── frontend/             React + Vite SPA
│   └── src/
│       ├── components/   StatsBar, WebsiteCard, AddWebsiteForm, HistoryModal
│       ├── pages/        Dashboard
│       └── services/     API client, browser notifications
├── database/
│   └── schema.sql        Table definitions
└── .env.example
```

---

## Quick start

### 1. Database

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE webpulse;"

# Run the schema
psql -U postgres -d webpulse -f database/schema.sql
```

### 2. Backend

```bash
# Copy and fill in your env
cp .env.example .env

cd backend
go mod tidy
go run main.go
# → running on http://localhost:8080
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

The Vite dev server proxies `/api` to `localhost:8080` so no CORS issues locally.

---

## REST API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/websites` | Add a website |
| GET | `/api/websites` | List all websites with latest status |
| DELETE | `/api/websites/:id` | Remove a website |
| GET | `/api/status` | Dashboard summary counts |
| GET | `/api/history?website_id=1` | Check history for one site |

---

## How monitoring works

`services/monitor.go` runs a background goroutine that:
1. Fires once immediately on startup.
2. Then ticks on every `CHECK_INTERVAL_SECONDS` (default 30 s).
3. For each stored website it spawns a goroutine that makes an HTTP GET with a 10-second timeout.
4. Records `UP` / `DOWN`, HTTP status code, and response time in both `websites` (latest) and `health_logs` (full history).

The React dashboard polls `/api/websites` every 15 seconds and fires browser notifications on UP ↔ DOWN transitions.

---

