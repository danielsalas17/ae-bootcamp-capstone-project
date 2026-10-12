# Project Guidelines

## Overview

This is an MVP clone of Letterboxd for tracking watched movies, ratings, and notes. **Social features are explicitly out of scope** — all data is scoped to a single local user per account, there is no following/sharing/feed. Movie metadata comes from the [OMDb API](http://www.omdbapi.com/).

## Architecture

pnpm workspace monorepo with two apps:

- `frontend/` — React + TypeScript + Vite, UI built with [shadcn/ui](https://ui.shadcn.com/) (import only the components actually used, don't scaffold the whole library)
- `backend/` — Express + TypeScript, exposes CRUD REST endpoints for movies, watch entries, and users
- `backend/data/` — JSON file(s) acting as the database (no external DB). Reads/writes must be done through a small data-access module, never scattered `fs` calls in route handlers

**OMDb API key security**: the OMDb API key lives only in `backend/.env` (`OMDB_API_KEY`), loaded via `dotenv`. The backend proxies all OMDb lookups; the frontend must never call OMDb directly or receive the key in any response/bundle.

## Auth Model

No passwords. A user "logs in" by selecting/entering a username, which becomes their scoping key for all stored data (watch entries, ratings, notes, watchlist). Treat `userId`/username as a required, validated field on every backend route that reads/writes user data — never trust a client-supplied user id without checking it exists.

## MVP Scope (core features only)

- Search movies via OMDb and view movie details
- Mark a movie as watched, with a rating
- Add personal notes/review text to a watched movie
- Maintain a watchlist (want-to-watch)
- Favorite/like a movie
- User-created lists/collections of movies

Do not add social features (following, feeds, sharing, comments, likes between users) — out of scope for this MVP.

## Build and Test

- Package manager: `pnpm` (use workspace filters, e.g. `pnpm --filter frontend <script>`)
- Frontend tests: Vitest + React Testing Library — aim for thorough coverage of components, hooks, and API client logic
- Backend tests: Jest + Supertest — test routes against the JSON data layer (use a temp/mock data file, never the real `backend/data` file in tests)

## Conventions

- TypeScript everywhere; avoid `any`, prefer explicit types/interfaces for API request/response shapes shared conceptually between frontend and backend
- Backend route handlers stay thin: validate input → call a service/data-access function → return response. Business logic does not belong in route files
- Only import the shadcn/ui components actually used in a feature; don't bulk-generate the full component set
- Never commit `.env` or real OMDb API keys; use `.env.example` for documented env vars
