# Book Recommendation System 📚

## Problem 🧭

In a bookstore (or while browsing online) 📚, it can be hard to quickly identify which books will match your tastes. Reading descriptions and manually comparing many titles is slow and often leads to decision fatigue.

## Tech Stack 🧰

- Frontend: Next.js (React + TypeScript), Tailwind CSS, shadcn/ui components 🖥️
- Backend (data + auth): Supabase (Auth, Postgres, Storage, Edge Functions) 🗄️
- AI:
  - OpenAI for OCR/extraction and recommendation logic 🧠
  - Gemini as an optional fallback for OCR 🧠
- Billing: Stripe (Checkout, Customer Portal, Webhooks)
- Cache: Upstash Redis (HTTP/REST access from edge functions)
- Search ranking: Fuse.js (fuzzy matching) 🔎

## Solution 🚀

This app helps users make faster, more accurate choices by:

- letting users take a photo of books they see (shelf image / cover image),
- extracting titles/authors from the image using an OCR+LLM pipeline,
- generating recommendations tailored to the user’s saved favorites and genre preferences.

It includes a dashboard experience for history and favorites, plus subscription-based usage limits.

## Features ✨

- Image-based scan 📸 -> structured extraction of book titles/authors.
- Recommendation engine that uses the detected books + user preferences to generate up to 5 recommendations (with guardrails to keep results grounded in what was detected).
- Favorites management:
  - token-based fallback search over Open Library (per-word retrieval to handle typos / partial misspellings)
  - Fuse.js fuzzy ranking over merged candidates (title + author) for forgiving results
  - add/remove favorites and save them to your profile
- Recommendation transparency 👀:
  - scan history with statuses and stored results.
- Usage limits tied to subscription plan ⏳:
  - Free tier with a small monthly scan allowance
  - Premium tier with a larger monthly allowance
- Stripe subscription billing 💳:
  - Checkout + webhook handling
  - automatic plan activation/deactivation
  - storage of billing period information (`next_billing_date`) used by the UI
  - customer portal access for invoice/payment management
- Guided onboarding tour 🧭:
  - dashboard onboarding trigger + animated sidebar walkthrough (Driver.js)
  - onboarding state bootstrap endpoint (`get-onboarding-status`) tied to profile state
- Auth UX:
  - Google One Tap / Google Sign-In button rendering reliability improvements on first mount
- Performance optimizations:
  - Open Library search is served from a backend edge function
  - Redis (Upstash) cache-aside for token-level Open Library results ⚡

## Project Structure 🗂️

- `frontend/`
  - Next.js App Router pages for the dashboard (scan history, favorites, genre preferences, usage)
  - UI components (sidebar, favorites search, usage cards, etc.)
  - Calls Supabase Edge Functions for backend operations (favorites search, scan history, settings updates)
- `supabase/`
  - `functions/`
    - `image-processing/`: authenticated image scan pipeline (extract + recommend) 🖼️
    - `search-books/`: backend Open Library search + cache layer (used by favorites search) 🔍
    - `get-previous-scans/`: scan history for the signed-in user
    - `save-favorites/`: persist favorites in `profiles`
    - `get-onboarding-status/`: returns prior onboarding state and marks first-time users onboarded
    - Stripe sync functions (`create-stripe-checkout`, `stripe-webhook`, `create-stripe-portal`) 💳

## Local development 🛠️

From the `frontend/` directory:

| Command | Description |
|--------|-------------|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production server (after `build`) |
| `npm run lint` | ESLint (Next.js + TypeScript rules) |
| `npm run test` | Vitest — runs all `*.test.ts(x)` / `*.spec.ts(x)` files |

Requirements: **Node.js 20+** (matches CI).

## Testing 🧪

- **Runner:** [Vitest](https://vitest.dev/) v4 with **jsdom** as the test environment.
- **Assertions / DOM:** [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) and [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) (via `vitest.setup.ts`).
- **Config:** `frontend/vitest.config.ts` — path alias `@/` matches the Next.js app, `include` pattern `**/*.{test,spec}.{ts,tsx}`.
- **Current tests:** `frontend/app/page.test.tsx` — smoke test for the landing page (branding, primary heading, signup links).

Add new tests next to the code they cover using the `*.test.tsx` (or `.test.ts`) naming convention.

## Continuous integration (GitHub Actions) 🔄

Workflows live under [`.github/workflows/`](.github/workflows/) and run on **push** and **pull_request** to **`main`**. Both use **Node 20** and `npm ci` in **`frontend/`**.

| Workflow | File | What it runs |
|----------|------|----------------|
| **Linter** | [`ci.yml`](.github/workflows/ci.yml) | `npm run lint` |
| **Frontend** | [`frontend-tests.yml`](.github/workflows/frontend-tests.yml) | `npm run test` (Vitest) |

Together they keep ESLint clean and the Vitest suite passing on every change to `main`.

