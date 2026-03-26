# AI Code Review Tool

A full-stack AI-powered code review tool using React, Express, PostgreSQL, and Google Gemini / OpenAI.

## Deployment Instructions

### 1. Neon DB Setup
- Go to [neon.tech](https://neon.tech) → create project → copy connection string
- Run `backend/db/schema.sql` in the Neon SQL editor to create the `reviews` table.

### 2. Render (Backend)
- Connect GitHub repo → select `/backend` folder
- Set environment variables: 
  - `GEMINI_API_KEY`
  - `OPENAI_API_KEY`
  - `DATABASE_URL`
  - `FRONTEND_URL`
- Build command: `npm install`
- Start command: `node index.js`

### 3. Vercel (Frontend)
- Connect GitHub repo → select `/frontend` folder
- Set environment variable: `VITE_API_URL` = your Render backend URL (e.g. `https://your-backend.onrender.com/api`)
- Framework preset: Vite
- Build command: `npm run build`
- Output dir: `dist`

## Local Setup

### Backend
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and fill values
4. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. Copy `.env.example` to `.env` and fill `VITE_API_URL` (usually `http://localhost:5000/api`)
4. `npm run dev`
