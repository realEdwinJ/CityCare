# CityCare

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-%3E%3D18-green)](backend/package.json)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-black?logo=expo&logoColor=white)](mobile/app.json)
[![CI](https://github.com/realEdwinJ/CityCare/actions/workflows/ci.yml/badge.svg)](https://github.com/realEdwinJ/CityCare/actions/workflows/ci.yml)

A civic reporting & legislative engagement platform for Windhoek, Namibia. Built for the AWS User Group Windhoek **"For The People"** hackathon.

Citizens report municipal issues (potholes, water leaks, power outages, etc.) with a photo and GPS location; an **AI automatically triages each report as Critical / Medium / Light**; duplicate reports of the same problem **merge into one ticket** with a "N citizens reported this" counter; and citizens **track the government's progress** (Received → Reviewed → Resolved). The same app lets people **rate proposed laws**, **send suggestions to ministries**, and **reach emergency services**. City officials work incoming reports from a **web admin dashboard**, and anyone can watch the city on a **public live map**.

## Features

- 📱 **Mobile app** (Expo / React Native) — report issues with photo + GPS, live map, rate laws, send ministry suggestions, one-tap **SOS**
- 🤖 **AI triage** — every report is classified **Critical / Medium / Light** by a rule engine with an optional Google Gemini refinement layer (graceful fallback)
- 🔁 **Duplicate merging** — reports of the same problem cluster into one ticket with a "N citizens reported this" counter (haversine distance)
- 🏛️ **Civic engagement** — rate proposed laws, send suggestions to ministries
- 🖥️ **Admin dashboard** — severity-sorted triage queue with status workflow (Received → Reviewed → Resolved)
- 🗺️ **Public live map** — real Leaflet map, severity-colored pins, no login

## Project documentation

- [Design brief](DESIGN_BRIEF.md) — the concept and scope
- [Hackathon plan](HACKATHON_PLAN.md) — build plan and timeline
- [Demo script](DEMO_SCRIPT.md) — step-by-step demo walkthrough
- [Deployment runbook](deploy/DEPLOY.md) — full AWS EC2 setup

## Contents
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Tech stack](#tech-stack)
- [Quick start (local)](#quick-start-local)
- [Configuration](#configuration)
- [Running the mobile app](#running-the-mobile-app)
- [Web surfaces](#web-surfaces)
- [Deployment to AWS EC2](#deployment-to-aws-ec2)
- [API reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Architecture

```
┌────────────────────┐        ┌──────────────────────────────────────┐
│  Mobile app        │        │  Backend (Node/Express) on EC2        │
│  Expo / React      │  HTTPS │                                        │
│  Native (SDK 54)   │◄──────►│  REST API  /api/v1/*                   │
│  • Report/Map/     │        │  • AI severity classifier (rules +     │
│    Participate/     │        │    Gemini, graceful fallback)          │
│    Activity + SOS   │        │  • Duplicate clustering (haversine)    │
└────────────────────┘        │  • SQLite database                     │
                              │  • Static admin dashboard  /admin       │
┌────────────────────┐        │  • Static public map        /map        │
│  Web browsers      │◄──────►│                                        │
│  /admin  /map      │        └──────────────────────────────────────┘
└────────────────────┘
```

- **Backend** — Node.js + Express + SQLite (`better-sqlite3`). No external DB to provision. Serves the API and two static web pages.
- **AI classifier** — a keyword/category rule engine (fast, offline-safe) with an optional **Google Gemini** refinement layer that automatically falls back to the rules if the key is missing, the call times out, or the free-tier limit is hit.
- **Mobile app** — Expo / React Native (SDK 54, runs in **Expo Go**). Real interactive map via Leaflet in a WebView. Light/dark theming with a manual toggle.
- **Admin dashboard & public map** — plain HTML/JS served by the backend; the public map uses real Leaflet tiles.

---

## Project structure

```
CityCare/
├── backend/
│   ├── src/
│   │   ├── server.js            # Express app entry (serves API + static pages)
│   │   ├── db.js               # SQLite schema + connection
│   │   ├── classifier.js       # AI severity (rules + Gemini)
│   │   ├── cluster.js          # duplicate detection (haversine)
│   │   ├── reportService.js    # create-or-merge report logic (shared)
│   │   ├── seed.js             # demo data
│   │   └── routes/             # reports, laws, ministries, admin
│   ├── public/
│   │   ├── admin/index.html    # admin dashboard  →  /admin
│   │   └── map/index.html      # public live map  →  /map
│   ├── .env.example
│   └── package.json
├── mobile/
│   ├── App.js                  # theme provider + tab shell
│   ├── app.json                # Expo config (name: CityCare)
│   ├── src/
│   │   ├── theme.js            # light/dark tokens + ThemeProvider
│   │   ├── screens/            # Report, Map, Participate, Activity, ProfileSetup
│   │   ├── components/         # TabBar, MapSurface (Leaflet), EmergencySheet, ui
│   │   └── lib/                # api, storage, sync, profile, config
│   └── .env.example
├── deploy/
│   ├── DEPLOY.md               # full EC2 runbook
│   ├── nginx.conf             # reverse proxy config
│   └── ecosystem.config.js     # PM2 process config
└── README.md
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Mobile | Expo SDK 54, React Native, Leaflet (in WebView), AsyncStorage |
| Backend | Node.js 18+, Express, SQLite (`better-sqlite3`), Multer |
| AI | Keyword/rule engine + Google Gemini (optional, graceful fallback) |
| Web surfaces | Plain HTML/JS served by Express (`/admin`, `/map`) |
| Deployment | AWS EC2, nginx reverse proxy, PM2 |

---

## Quick start (local)

**Prerequisites:** Node.js 18+ and npm. (For the mobile app: the **Expo Go** app on your phone, or an iOS/Android simulator.)

### 1. Backend

```bash
cd backend
cp .env.example .env        # optional: add a Gemini key; defaults work without it
npm install
npm run seed                # load demo data (4 ministries, 3 laws, 6 reports)
npm start                   # → http://localhost:4000
```

You now have:
- API at `http://localhost:4000/api/v1/...`
- Admin dashboard at `http://localhost:4000/admin`  (login: `admin` / `changeme`)
- Public map at `http://localhost:4000/map`
- Health check at `http://localhost:4000/health`

### 2. Mobile app

```bash
cd mobile
cp .env.example .env         # set EXPO_PUBLIC_API_BASE_URL (see Configuration)
npm install
npx expo start               # scan the QR with Expo Go, or press w / i / a
```

---

## Configuration

### Backend — `backend/.env`
```ini
PORT=4000
DB_PATH=./data/onevoice.db
UPLOAD_DIR=./uploads
GEMINI_API_KEY=              # free tier: https://aistudio.google.com/apikey (optional)
GEMINI_MODEL=gemini-2.0-flash
ADMIN_USER=admin
ADMIN_PASSWORD=changeme      # CHANGE THIS before any real deployment
```

### Mobile — `mobile/.env`
The app reads `EXPO_PUBLIC_API_BASE_URL`. **This must point at a host the phone can actually reach:**

| Where you run the app | Set it to |
|---|---|
| Web preview (`expo start --web`) on the same PC as the backend | `http://localhost:4000` |
| **Physical phone via Expo Go** (same Wi-Fi as the PC) | `http://<your-PC-LAN-IP>:4000` (e.g. `http://192.168.1.23:4000`) |
| After deploying the backend to EC2 | `http://<EC2-PUBLIC-IP>` (or your domain) |

> ⚠️ `localhost` on a phone means the phone itself — it will **not** reach your PC. Use the LAN IP.
> Find your PC's LAN IP with `ipconfig` (Windows) / `ifconfig` (mac/Linux). After changing `.env`, restart `expo start`.

---

## Running the mobile app

CityCare targets **Expo SDK 54**, which runs in the current **Expo Go** app — no native build required for the demo.

1. Install **Expo Go** from the App Store / Play Store.
2. Put the phone on the **same Wi-Fi** as the dev machine and set `EXPO_PUBLIC_API_BASE_URL` to the PC's LAN IP (above).
3. `cd mobile && npx expo start` and scan the QR from Expo Go.
4. The map needs internet for its tiles (any Wi-Fi/data connection is fine).

The four tabs are **Report**, **Map**, **Participate** (Laws + Ministries), **Activity**, with an always-visible **SOS** button and a **light/dark toggle** in the header.

---

## Web surfaces

Both are served by the backend — **open them via the server URL, not as local files** (a `file://` page cannot reach the API):

- **Admin dashboard** — `http://<host>:4000/admin`
  - **Reports**: severity-sorted queue, severity filters, stat tiles, per-row status control (Received / Reviewed / Resolved), table ⇄ map toggle
  - **Laws**: publish a new law, view citizen ratings + comments
  - **Ministry Suggestions**: browse proposals sent to each ministry
  - Login uses `ADMIN_USER` / `ADMIN_PASSWORD` from `.env`
- **Public map** — `http://<host>:4000/map` — real Leaflet map, no login, markers colored by severity and marked by review status.

---

## Deployment to AWS EC2

The hackathon requires the project to be **publicly accessible through an EC2 instance**. The backend (API + admin dashboard + public map) is what you deploy; the mobile app is demoed via Expo Go pointed at the EC2 URL. Full runbook: [`deploy/DEPLOY.md`](deploy/DEPLOY.md). Condensed version:

### 1. Launch the instance
- EC2 → Launch instance → **Ubuntu Server 22.04 LTS**, type **t2.micro / t3.micro** (free-tier).
- Security group inbound rules: **SSH 22** (your IP), **HTTP 80** (0.0.0.0/0).
- Allocate an **Elastic IP** and associate it (so the address survives reboots).
- Note the **public IPv4 address**.

### 2. Install and run the backend
```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>

sudo apt update && sudo apt install -y nodejs npm nginx git build-essential
sudo npm install -g pm2

git clone <your-repo-url> citycare
cd citycare/backend
cp .env.example .env
nano .env                      # set ADMIN_PASSWORD (and GEMINI_API_KEY if you have one)

npm install
npm run seed                   # seed demo data
pm2 start ../deploy/ecosystem.config.js
pm2 save && pm2 startup        # run the command it prints so it restarts on reboot
```

### 3. Put nginx in front (port 80 → 4000)
```bash
sudo cp ../deploy/nginx.conf /etc/nginx/sites-available/citycare
sudo ln -s /etc/nginx/sites-available/citycare /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 4. Point the mobile app at EC2
In `mobile/.env` set `EXPO_PUBLIC_API_BASE_URL=http://<EC2_PUBLIC_IP>`, restart `expo start`, and rescan in Expo Go.

### 5. Verify (from a device NOT on your dev network — e.g. phone on mobile data)
- `http://<EC2_PUBLIC_IP>/health` → `{"ok":true}`
- `http://<EC2_PUBLIC_IP>/admin` loads and login works
- `http://<EC2_PUBLIC_IP>/map` shows pins
- The app submits a report and it appears in `/admin` within seconds

> Docker is optional — a `Dockerfile` is included in `backend/`; see `deploy/DEPLOY.md` for the container path.

---

## API reference

Base path: `/api/v1`

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/reports` | Submit a report (multipart: fields + optional `photo`); merges nearby duplicates |
| `GET` | `/reports/public` | Lightweight feed for the maps (id, category, title, lat/lng, severity, status, count) |
| `GET` | `/reports/:id` | Full report (for the pin-detail sheet) |
| `GET` | `/laws` | Published laws |
| `POST` | `/laws/:id/comments` | Submit a rating + comment |
| `GET` | `/ministries` | Active ministries |
| `POST` | `/suggestions` | Submit a suggestion to a ministry (multipart, optional attachment) |
| `GET` | `/admin/reports` | Triage queue (severity-sorted) — **auth** |
| `PATCH` | `/admin/reports/:id` | Update status (RECEIVED / IN_PROGRESS / RESOLVED / REJECTED) — **auth** |
| `POST` | `/admin/laws` | Publish a law — **auth** |
| `GET` | `/admin/laws/:id/comments` | Citizen feedback for a law — **auth** |
| `GET` | `/admin/suggestions` | Ministry suggestions — **auth** |

**Auth:** admin endpoints require headers `X-Admin-User` and `X-Admin-Password` matching `.env` (shared-secret; fine for the MVP — replace with real auth for production).

---

## Troubleshooting

- **App shows no data / map is empty** — `EXPO_PUBLIC_API_BASE_URL` is wrong for where the app runs. On a phone it must be the PC's **LAN IP** (or the EC2 IP), never `localhost`. Restart `expo start` after editing `.env`.
- **Expo Go says "project is incompatible, update"** — the project is SDK 54; make sure Expo Go is up to date. (Older/newer SDKs won't load.)
- **Admin login "does nothing"** — you opened the page as a **local file**. Open it at `http://<host>:4000/admin` so its API calls have a server to reach.
- **Map is blank on the phone** — the map needs internet for tiles; confirm the phone has a working connection.
- **Gemini not classifying** — without `GEMINI_API_KEY` the app uses the rule-based classifier (still fully functional); add a free key to enable AI refinement.

---

Built with Expo, Express, SQLite, Leaflet, and Google Gemini. Admin default credentials are `admin` / `changeme` — **change them before deploying.**

---

## Contributing

Bug reports, fixes, and ideas are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community guidelines. For security issues, see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © 2026 CityCare contributors
