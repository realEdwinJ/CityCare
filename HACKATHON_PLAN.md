# Civic Platform — Hackathon Plan ("For The People", AWS User Group Windhoek)

## Build status — MVP COMPLETE ✅

The full MVP is built and verified end-to-end locally. Only the API key and the AWS deployment remain, and both are yours to do (they need your accounts).

✅ **Built and verified working:**
- **Backend API** (`backend/`) — Express + SQLite. Endpoints for reports, laws, law comments, ministries, ministry suggestions, plus the full admin surface. CORS enabled, file uploads (photos/attachments) via multer.
- **AI severity classifier** — rule-based baseline (keyword + category + duplicate-count escalation) with a Gemini refinement layer that automatically falls back to rules if the key is missing, the call times out, or the free-tier limit is hit. Verified: "Sewage overflow" → CRITICAL, "Pothole" → MEDIUM, "Uncollected garbage" → LIGHT.
- **Duplicate/cluster detection** — haversine-based merge of nearby same-category reports, with a live "N citizens reported this" counter that also escalates severity.
- **Mobile app** (`mobile/`, Expo/React Native) — 5 screens, all wired to the live API and verified:
  - First-run **profile** (name + phone, stored locally per the spec) gating the app; editable via "Reporting as … · edit".
  - **Report an Issue** — title, description, category chips, photo picker, GPS fetch, offline-draft fallback, and an AI-severity result shown on submit.
  - **Emergency** — tap-to-call Police / Ambulance / Fire.
  - **Laws** — live legislation list → read → rate (stars) + comment.
  - **Ministries** — pick a ministry → send a direct suggestion.
  - **History** — local activity log with sync status **and live server-status tracking** (Received → In Progress → Resolved), plus a retry banner for offline drafts.
- **Admin dashboard** (`/admin`) — tabbed: **Reports** (severity-sorted queue, reporter names, photos, AI summary, dup counts, status updates), **Laws & Policies** (publish new + view citizen ratings/comments), **Ministry Suggestions** (filter by ministry).
- **Public transparency map** (`/map`) — Leaflet, pins colored/sized by severity and report count, no login.
- **The trust loop, verified live:** citizen submits → AI classifies → admin marks In Progress → the citizen's History screen reflects "In Progress" on refresh.
- **Offline-first retry** — pending drafts auto-retry on app foreground and on History pull-to-refresh.
- Seed script with realistic Windhoek demo data; EC2 runbook + nginx/PM2/Docker configs (`deploy/`).

⏭ **Yours to do (accounts required):**
1. Add a free `GEMINI_API_KEY` to `backend/.env` (2 min: https://aistudio.google.com/apikey). Without it the app still works on the rule-based classifier.
2. Push to a git repo (the EC2 runbook uses `git clone`).
3. Provision the EC2 instance and follow `deploy/DEPLOY.md` — Group-Leader-only per the rules.
4. Change the admin password in `backend/.env` before the live demo.

See [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) for the 4-minute presentation script.


Event day: **25 July 2026**. Working doc assembled 24 July 2026 from the group's Project Proposal, the hackathon brief, and the existing app screenshots.

---

## 1. Name suggestions

Your project folder is already called **OneVoice Na** — that's a legitimate option on its own (short, national, "one app" tagline writes itself). Alternatives if you want to compare:

| Name | Why it works |
|---|---|
| **OneVoice Na** | Already your working title. "One platform for every civic need." Strong tagline, easy to say in a 4-min pitch. |
| **CivicLink NA** | Literal — signals "link between citizens and government," sounds official/trustworthy, which matters for a reporting app. |
| **OneVoice Namibia** | Leans into the legislative-commentary pillar ("your voice on policy"), ties directly to "For The People." |
| **MyWindhoek** (→ **MyCity NA** later) | Local-first, personal framing; easy to explain scope (start with Windhoek, proposal already scopes there) but implies easy expansion. |
| **FixIt Namibia** | Punchy, action-oriented, good if you want to foreground the pothole/utility-reporting pillar as the headline demo. |

I avoided any local-language name since I can't verify translations accurately — if a teammate speaks Oshiwambo/Otjiherero/Damara and wants a local word woven in, that'd be a nice authenticity touch for "relevant to a Namibian community," worth 30 seconds of pitch time.

---

## 2. Full feature list, mapped to judging criteria

The judges score: Problem Definition, Solution Design, **Implementation**, Communication, **Deployment Strategy**, **Innovation & Creativity**, **Functionality**, **Proof of Concept**. Everything below is grouped by what it buys you.

### A. MVP core (must ship — this is the demoable golden path)
1. **Report an Issue** (already built) — title, description, category, photo, GPS.
2. **Emergency quick-dial** (already built) — Police/Ambulance/Fire tap-to-call. Zero backend needed, free "public safety" credit toward the theme.
3. **Legislative feedback** (already built) — read a policy, comment, star-rate.
4. **History w/ sync status** (already built) — pending/synced state per submission.
5. **Backend API + database** — reports, laws, comments (ministries/suggestions if time allows — see §3 in proposal for schema, it's solid, just trim for MVP).
6. **Admin/Municipal dashboard (web)** — the side judges haven't seen yet. A triage queue of incoming reports, filterable, status update button. This is what proves "Implementation" and "Proof of Concept" beyond just the citizen app — it shows the *other side* of the platform actually working.
7. **AI severity classifier — Critical / Medium / Light** (your idea) — this is your standout differentiator. See §3 below for how to build it fast.
8. **Public deployment on AWS EC2** — hard requirement, not optional.

### B. High-impact differentiators (do these if A is done with time to spare — big score-per-hour)
9. **Public transparency map** — pins colored by severity/status, no login required. Extremely demoable in 10 seconds on stage, and it's the single best visual proof of "For The People" (citizens can *see* government responsiveness, not just submit into a void).
10. **Duplicate/cluster detection** — reports within ~50m + same category get merged into one ticket with a counter ("14 people reported this"). Cheap to build (distance check + category match), reads as sophisticated, and directly strengthens your AI-priority signal (a pothole 14 people flagged is obviously more "critical" than one).
11. **Status-change notification loop** — closes the trust gap your own problem statement names ("erodes public trust in municipal responsiveness"). Even a simple in-app badge/SMS via AWS SNS sells this well.
12. **Auto-routing to the right ministry** — extends the "Direct Ministry Submissions" pillar with a rules-based router by category.

### C. AWS-specific "wow" (this is an AWS User Group event — leaning on more than EC2 hosting is a real differentiator)
13. **AWS Comprehend or Bedrock** for the severity classifier instead of (or layered on top of) keyword rules — turns your AI feature into a genuine AWS-native feature, which plays very well with this specific judging panel.
14. **AWS Rekognition** on uploaded photos — sanity-check that an image plausibly matches its category (or just flag empty/junk photos). Nice-to-have, not core.
15. **S3 for photo storage + RDS/DynamoDB for data + EC2 for compute** — a clean three-tier story you can put on one architecture slide for the "Deployment Strategy" and "Communication" criteria.

### D. Stretch / roadmap-only (say it in the pitch, don't build it)
16. USSD/SMS fallback reporting for feature-phone users — genuinely important for Namibia's non-smartphone population, strong "who does this affect" answer, but not buildable in 24h. Mention as Phase 2.
17. Municipality analytics (hotspot heatmaps, avg resolution time per department).
18. Gamification / civic engagement score.
19. Anonymous reporting mode, push notifications, robust offline conflict resolution.

### Judging-criteria cheat sheet
- **Problem Definition** — already strong in your proposal, keep as-is.
- **Solution Design** — consolidation (one app, many civic actions) + AI triage.
- **Implementation** — items in §A, especially the admin dashboard (proves it's a real two-sided system, not just a form that submits into nothing).
- **Innovation & Creativity** — AI severity classifier + duplicate clustering + AWS AI services (§C).
- **Functionality / Proof of Concept** — a scripted golden-path demo: citizen reports a burst pipe → AI flags it Critical → it appears prioritized on the admin dashboard and the public map → admin marks In Progress → citizen sees the status update in History. That loop, live, in under 4 minutes, is your whole pitch.
- **Deployment Strategy** — EC2 + S3 + RDS/DynamoDB now, roadmap mentions ECS/Amplify/managed DB for scale later.

---

## 3. AI classifier — fast path (decided: Gemini API free tier)

Two layers, build the first no matter what, add the second once a Gemini API key is in hand:

1. **Rule-based baseline (build this first, ~1-2 hrs)**: a keyword/category severity map. E.g. "no water," "gas leak," "exposed wire," "burst pipe" → Critical; "pothole," "streetlight," "traffic light" → Medium; "graffiti," "litter," "cosmetic" → Light. Deterministic, free, works offline, and is the fallback if the Gemini call fails or the free-tier rate limit is hit mid-demo (free tier has real per-minute limits — don't let the whole classify step depend on it live on stage).
2. **Gemini refinement (layer on top)**: send the report text + category + duplicate count (§B.10) to Gemini (`gemini-2.0-flash` or similar fast/cheap tier) for a severity label + one-line summary, structured JSON output. Store both the rule-based and Gemini-refined severity so the "why AI" story survives even if the live call is flaky on venue wifi.

Note on the AWS-alignment angle from §C: since the classifier is now Gemini instead of Bedrock/Comprehend, the "AWS-native AI" scoring angle is weaker. That's a reasonable trade for reliability and setup speed in 24h — Gemini's free tier needs just an API key, no IAM/model-access request. If there's slack time near the end, swapping in a second Bedrock call as an "alternate path" is a cheap way to reclaim that AWS-story point without redoing the core classifier.

### Backend stack (matches React Native/Expo team choice)
Node.js + Express (or Fastify) for the API — same language as the mobile app, so schema/types can be shared, and it's the fastest path to an EC2 deployment (plain `node` process behind Nginx, or PM2). Postgres (RDS or just Postgres on the EC2 box itself for MVP simplicity) for the database; S3 for photo uploads.

---

## 4. 24-hour implementation plan

Anchor times to whenever your team actually starts — this is Hour 0 → Hour 24, ending in time for the 25 July event.

| Hours | Focus | Output |
|---|---|---|
| 0–1 | **Kickoff & scope lock.** Confirm name, stack, platform (web vs native — see questions below), divide roles. Group Leader starts AWS account creation *immediately* — card verification can be slow. | Repo set up, roles assigned, AWS account in progress |
| 1–4 | **Backend foundation.** API skeleton (pick whatever your team knows fastest — Node/Express or Python/FastAPI). DB schema trimmed from the proposal: `reports`, `laws`, `law_comments` first; `ministries`/`ministry_suggestions` only if time. Core endpoints: `POST /reports`, `GET /reports`, `PATCH /reports/{id}`, `GET /laws`, `POST /laws/{id}/comments`. S3 bucket for photo uploads. | Working local API |
| 4–8 | **AI classifier.** Rule-based baseline first (§3.1). Wire AWS Comprehend/Bedrock on top if credentials are ready (§3.2). Store severity + confidence on the report record. Test against a handful of sample reports. | `/reports` returns a severity |
| 8–12 | **Admin/Municipal dashboard (web).** Simple table sorted by severity, status dropdown, basic auth (don't over-engineer login for a 24h MVP). Connect to the real API. | Judge-visible "other half" of the platform |
| 12–14 | **Wire the existing mobile screens to the real backend** — replace local dummy data with live API calls in Report/Feedback/History. Emergency tab needs nothing (already static). Confirm photo upload + GPS round-trip end to end. | Mobile app talks to real backend |
| 14–16 | **Public map view** (Leaflet/Mapbox/Google Maps, pins colored by severity) — either as a web page or a "Community" tab. | Your best 10-second demo beat |
| 16–19 | **AWS EC2 deployment.** Provision instance, Nginx reverse proxy, process manager (pm2/systemd) or Docker Compose if you want it (optional per rules). Elastic IP, open 80/443. Point backend + admin dashboard at it, connect RDS/hosted DB. Confirm it's reachable from **outside** your dev network. | Publicly accessible URL — the hard requirement, done early enough to debug |
| 19–21 | **End-to-end test + bug bash.** Run the full golden path (see §2 cheat sheet) repeatedly. Seed rich dummy data (the proposal explicitly calls for pre-populated dummy data — use it for a lived-in demo, not an empty app). Test edge cases: no photo, no GPS, offline draft → sync. | Stable demo path |
| 21–23 | **Pitch prep.** 4-minute script: problem → solution → live demo → architecture (one slide) → deployment/scaling story. Rehearse against a timer. Group Leader leads per the rules. Record a backup demo video in case venue wifi fails. | Ready presentation + safety net |
| 23–24 | **Buffer.** Final smoke test on venue wifi if possible, rest, margin for AWS support queue congestion the morning of. | Slack for the unexpected |

---

## 5. Open questions

See the in-chat questions — answers will tighten §4's timeline and stack choices (esp. web vs native affects how "publicly accessible via EC2" gets satisfied for the citizen-facing app, not just the admin side).
