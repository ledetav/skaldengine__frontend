# SkaldEngine Frontend

## Overview
A React 19 + Vite frontend for the SkaldEngine platform. Features auth, chat, lorebooks, personas, and admin dashboards.

## Tech Stack
- React 19 with React Compiler
- Vite 8 (dev server on port 5000)
- TypeScript
- React Router DOM v7
- Framer Motion
- react-markdown + remark-gfm

## Project Structure
```
src/
  core/         # Shared API client, hooks, types, utilities
  features/     # Feature modules (Auth, Chat, Dashboard, etc.)
  components/   # Shared UI components
  theme/        # Theme configuration
```

## Environment Variables
Set these in Replit Secrets:
- `VITE_AUTH_API_URL` - Auth service base URL (e.g. https://your-auth-api.com/api/v1)
- `VITE_CORE_API_URL` - Core service base URL (e.g. https://your-core-api.com/api/v1)
- `VITE_LOG_LEVEL` - Log level: DEBUG, INFO, WARN, ERROR (default: WARN)

## Running
The app runs via the "Start application" workflow using `npm run dev` on port 5000.

## Notes
- The app connects to two external backend services (auth + core API)
- API URLs fall back to localhost defaults if env vars are not set
- JWT tokens are stored in localStorage and sent as Bearer tokens
