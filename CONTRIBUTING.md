# Contributing to CityCare

Thanks for taking the time to contribute! This is a hackathon-built project, so contributions of all sizes are welcome — bug reports, fixes, docs, and ideas.

## Code of conduct

Read our [Code of Conduct](CODE_OF_CONDUCT.md) first. Be kind, be constructive.

## How to contribute

1. **Fork** the repository and create a branch from `master`:

   ```bash
   git checkout -b feat/your-feature
   ```

2. **Make your changes.** Follow the existing code style — plain CommonJS on the backend, React Native (Expo SDK 54) on mobile, no comments unless they explain why.

3. **Test locally** before opening a PR:

   ```bash
   cd backend && npm install && npm run seed && npm start   # API + admin + map
   cd mobile && npm install && npx expo start               # Expo Go
   ```

4. **Open a pull request** with a clear title and a short description of what you changed and why. Reference any related issue.

## Project layout

| Path | What lives there |
|---|---|
| `backend/src` | Express API: routes, SQLite schema, AI classifier, duplicate clustering |
| `backend/public` | Static admin dashboard and public map (plain HTML/JS) |
| `mobile` | Expo / React Native app |
| `deploy` | EC2 + PM2 + nginx runbook and configs |

## Reporting bugs

Open an issue with:

- What you did
- What you expected to happen
- What actually happened (paste errors)
- Steps to reproduce, and which part (backend / mobile / web) it affects

## Code style

- Backend: CommonJS, `camelCase`, no semicolon-free formatting — match the surrounding code.
- Mobile: same as the existing screens/components.
- Never commit `.env` files, secrets, or generated artifacts (`node_modules`, `data/`, `uploads/`, logs).

## License

By contributing you agree that your contributions are licensed under the [MIT License](LICENSE).