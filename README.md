# TaskFlow — Smart Task & Project Manager

A full-stack MERN task/board manager (Trello-style) with JWT auth and an AI-powered
"Suggest estimate" feature for effort + due-date estimation.

This repo contains everything required by the assignment:

```
taskflow/
├── server/   → Node.js + Express + MongoDB (Mongoose) REST API
└── client/   → React 18 + Vite + Tailwind CSS frontend
```

---

## 1. Tech Stack

- **Frontend:** React 18 (hooks, functional components), React Router, Axios, Tailwind CSS
- **Backend:** Node.js, Express.js (REST API)
- **Database:** MongoDB via Mongoose
- **Auth:** JWT + bcrypt password hashing
- **AI:** Google Gemini free tier (`gemini-2.0-flash`) called only from the backend, with a
  local heuristic fallback if the key is missing or the call fails/times out

---

## 2. Data Model

- **User**: name, email (unique), passwordHash
- **Board**: title, description, owner (ref User)
- **Task**: title, description, status (todo/in-progress/done), priority (low/med/high),
  dueDate, estimatedEffort, aiReasoning, board (ref Board), owner (ref User), timestamps

---

## 3. API Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/register | No | Register a new user |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/auth/me | Yes | Get current logged-in user |
| GET | /api/boards | Yes | List my boards |
| POST | /api/boards | Yes | Create a board |
| GET | /api/boards/:id | Yes | Get one board |
| PUT | /api/boards/:id | Yes | Update a board |
| DELETE | /api/boards/:id | Yes | Delete a board (and its tasks) |
| GET | /api/tasks?boardId=&status=&priority=&sort= | Yes | List tasks (filter/sort) |
| POST | /api/tasks | Yes | Create a task |
| PUT | /api/tasks/:id | Yes | Update / move a task |
| DELETE | /api/tasks/:id | Yes | Delete a task |
| POST | /api/ai/suggest-estimate | Yes | AI effort/due-date suggestion |
| GET | /api/health | No | Health check |

All board/task routes enforce **ownership** — a user can only see/edit their own data
(server checks `owner === req.user.id` on every query).

---

## 4. Run It Locally — Step by Step

### Step 1 — Install prerequisites
- Node.js 18+ and npm
- A MongoDB database — either:
  - Install MongoDB locally, **or**
  - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (recommended)

### Step 2 — Get a free Gemini API key (optional but recommended)
1. Go to https://aistudio.google.com/app/apikey
2. Sign in and click "Create API key" (free tier)
3. Copy the key — you'll paste it into `server/.env`
4. If you skip this, the app still works — the AI button returns a heuristic fallback.

### Step 3 — Backend setup
```bash
cd server
npm install
cp .env.example .env
```
Edit `server/.env`:
```
PORT=5000
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<any long random string>
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=<your Gemini key, or leave blank>
GEMINI_MODEL=gemini-2.0-flash
CLIENT_ORIGIN=http://localhost:5173
```
Run it:
```bash
npm run dev
```
You should see `MongoDB connected` and `Server running on port 5000`.
Test it: open http://localhost:5000/api/health

### Step 4 — Frontend setup
Open a new terminal:
```bash
cd client
npm install
cp .env.example .env
```
`client/.env` should contain:
```
VITE_API_URL=http://localhost:5000/api
```
Run it:
```bash
npm run dev
```
Open http://localhost:5173 — register a user, create a board, add tasks, click
"✨ Suggest estimate (AI)" on a task.

---

## 5. How the AI Feature Works

1. In the task form, the user clicks **"Suggest estimate"**.
2. The frontend sends only the task **title + description** to `POST /api/ai/suggest-estimate`
   (never the API key — that stays server-side in `.env`).
3. The backend builds a short prompt and calls Google Gemini's `generateContent` endpoint,
   asking for strict JSON: `{ effort, suggestedDueDate, reasoning }`.
4. The response is shown to the user with an **"Accept suggestion"** button — nothing is
   saved automatically.
5. If the API key is missing, the request times out (8s), or Gemini returns malformed JSON,
   the backend silently falls back to a deterministic local heuristic (based on text length
   and a few keywords) so the feature **never breaks the app**.

You can swap providers (Groq, OpenRouter, Anthropic, etc.) by editing `server/src/utils/llm.js`
— only that one file talks to the LLM.

---

## 6. Deploying (Step by Step)

### Step A — Push to GitHub
```bash
cd taskflow
git init
git add .
git commit -m "Initial commit: TaskFlow MERN app"
git branch -M main
git remote add origin <your-empty-github-repo-url>
git push -u origin main
```
(`.env` files are already git-ignored — only `.env.example` gets committed.)

### Step B — Database (production)
1. Create a free MongoDB Atlas cluster (https://www.mongodb.com/cloud/atlas)
2. Create a database user + allow access from anywhere (0.0.0.0/0) for simplicity
3. Copy the connection string — you'll use it as `MONGO_URI` in Step C

### Step C — Deploy the backend (Render, free tier)
1. Go to https://render.com → New → Web Service → connect your GitHub repo
2. Root directory: `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables (same keys as your local `.env`):
   `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `CLIENT_ORIGIN`
   (set `CLIENT_ORIGIN` to your Vercel/Netlify URL once you have it — Step D)
6. Deploy. Note the live URL, e.g. `https://taskflow-api.onrender.com`

### Step D — Deploy the frontend (Vercel, free tier)
1. Go to https://vercel.com → New Project → import the same GitHub repo
2. Root directory: `client`
3. Framework preset: Vite
4. Environment variable: `VITE_API_URL=https://taskflow-api.onrender.com/api`
5. Deploy. Note the live URL, e.g. `https://taskflow.vercel.app`

### Step E — Close the loop
- Go back to Render → update `CLIENT_ORIGIN` to your Vercel URL → redeploy
- Visit your live frontend URL and test register/login/boards/tasks/AI suggest end-to-end

---

## 7. README Checklist Mapping (what's covered)

- ✅ Project title & description (this file)
- ⬜ Screenshots — add your own once you run the app locally (Login, Dashboard, Board, Mobile)
- ✅ Tech stack & libraries
- ✅ Local setup instructions (Steps 1–4 above)
- ✅ Environment variables + `.env.example` (server and client)
- ✅ Which LLM API and why (Gemini — generous free tier, fast, simple REST call)
- ✅ API documentation (Section 3)
- ⬜ Live demo links — fill in after Step C/D above
- ⬜ Test credentials — register a demo user after deploying and list it here

## 8. Known Limitations / Next Steps

- No drag-and-drop yet — moving tasks between columns currently uses a dropdown (bonus item)
- No automated tests yet (Jest/Supertest) — would add next
- No pagination on tasks list — fine for small boards, would add for scale
- No board sharing/collaboration between users yet

---

## 9. Evaluation Criteria Self-Check

| Criteria | Where to find it |
|---|---|
| Backend & API design | `server/src/routes`, `server/src/controllers` |
| Auth & security | `server/src/controllers/authController.js`, `server/src/middleware/auth.js` |
| Database & modelling | `server/src/models` |
| Frontend & UI/UX | `client/src/pages`, `client/src/components` |
| AI integration | `server/src/utils/llm.js`, `server/src/controllers/aiController.js`, `client/src/components/TaskModal.jsx` |
| Code quality | separated routes/controllers/models/middleware; client split into pages/components/context/api |
