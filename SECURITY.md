# Security Policy

## Supported versions

This is a hackathon prototype. Only the latest commit on `master` is supported.

## Reporting a vulnerability

Please **do not open a public issue** for security problems. Instead, report them privately to the repository owner (see the repo's GitHub profile) or open a GitHub Security Advisory at:

https://github.com/realEdwinJ/CityCare/security/advisories

Include:

- What the issue is and its impact
- Steps to reproduce
- Any fix you'd suggest

## Known notes for production use

This project is an MVP and is **not hardened for production**:

- Admin auth is a shared-secret header (`X-Admin-User` / `X-Admin-Password`) — replace with real authentication before any public deployment.
- Default credentials are `admin` / `changeme` — change `ADMIN_PASSWORD` in `backend/.env`.
- Uploads and the SQLite database live on local disk; add backups and object storage for production.