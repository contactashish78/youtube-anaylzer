# youtube-anaylzer

A full-stack monorepo app that takes a YouTube URL and returns a markdown transcript with:
- timestamps
- simple chapter grouping
- basic diarization heuristic (Speaker 1/2 based on pauses/turns)

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Transcript source: `youtube-transcript` (no paid API required)

## Monorepo Structure

```
youtube-anaylzer/
  frontend/   # React Vite app
  backend/    # Express API
```

## API

### `POST /api/transcript`
Body:

```json
{ "url": "https://www.youtube.com/watch?v=VIDEO_ID" }
```

Response:

```json
{
  "markdown": "# Transcript ...",
  "chapters": [{ "title": "Chapter 1", "start": "00:00", "lines": 42 }],
  "totalLines": 128
}
```

## Local Run

From repo root:

```bash
npm install
cp .env.example .env
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8787`

## Deploy (Free) — Render + Vercel

### 1) Deploy backend on Render
- Open: `https://dashboard.render.com/blueprints`
- Click **New Blueprint Instance**
- Connect this repo: `contactashish78/youtube-anaylzer`
- Render will read `render.yaml` and create `youtube-anaylzer-api`
- After deploy, copy backend URL, e.g. `https://youtube-anaylzer-api.onrender.com`

### 2) Deploy frontend on Vercel
- Open: `https://vercel.com/new`
- Import repo: `contactashish78/youtube-anaylzer`
- Framework: Vite (auto-detected)
- Root directory: repo root (uses `vercel.json`)
- Add environment variable in Vercel project:
  - `VITE_API_BASE = <your-render-backend-url>`
  - Example: `VITE_API_BASE=https://youtube-anaylzer-api.onrender.com`
- Deploy

### 3) Verify
- Visit Vercel URL and test with a YouTube link.
- Health check backend: `<render-url>/api/health`

## Notes
- Validation is included for empty/invalid URLs.
- If captions are unavailable/disabled for a video, the API returns an error.
- Diarization is heuristic only and not true speaker identification.
- Render free tier may sleep after inactivity; first request can be slower.
