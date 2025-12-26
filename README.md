# Tetris Webapp (React frontend + Python Flask backend)

This project implements a simple Tetris webapp. The game is playable only after registering and logging in.

Structure
- `backend/` — Flask backend, SQLite database (`db.sqlite3`) and API endpoints
- `frontend/` — React frontend (Vite)

Quick start (Windows)

1. Backend

```
python -m pip install -r "backend/requirements.txt"
python -m backend.app
```

The backend runs on port 5000 by default.

2. Frontend

From the `frontend` folder:

```
npm install
npm run dev
```

The frontend dev server runs on port 3000 and proxies `/api` to `http://localhost:5000`.

Endpoints
- `POST /api/register` — JSON `{username,password}` → `{token}`
- `POST /api/login` — JSON `{username,password}` → `{token}`
- `GET /api/leaderboard` — top 10 scores
- `POST /api/score` — submit score (Authorization: Bearer <token>)

Notes
- Database file is `backend/db.sqlite3` and is created automatically on first run.
- For development you can set `TC_SECRET` environment variable to change JWT secret.
First vibe code project - rebuild TETRIS
