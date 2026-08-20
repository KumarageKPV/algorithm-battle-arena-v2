# Algorithm Battle Arena v2

A full-stack competitive coding platform where students and teachers can create, host, and compete in real-time algorithm battles.

**Migrated from:** ASP.NET Core 8 + MSSQL + SignalR + React/Vite + Azure  
**To:** NestJS + PostgreSQL + Socket.IO + Redis + Next.js + Judge0 + Docker

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Simple Run Commands](#simple-run-commands)
- [Local Development](#local-development)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Project Structure](#project-structure)
- [Database & Migrations](#database--migrations)
- [API Documentation](#api-documentation)
- [Frontend Architecture](#frontend-architecture)
- [Real-Time Features](#real-time-features)
- [Authentication](#authentication)
- [Features by Role](#features-by-role)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Project Overview

**Algorithm Battle Arena** is an educational platform designed to:

- **Students**: Compete in real-time coding challenges, practice algorithms, track progress, and collaborate with peers
- **Teachers**: Create problem sets, host live match tournaments, monitor student performance, and provide micro-course guidance
- **Admins**: Manage users, problems, lobbies, and platform configuration

### Key Features

✅ **Real-time Matches** — Student vs. student coding competitions with live leaderboards  
✅ **Code Execution** — Client-side run + server-side submission grading via Judge0  
✅ **AI Micro-Courses** — OpenAI-powered learning guides when students are stuck  
✅ **Chat & Collaboration** — Direct messaging between friends and teachers  
✅ **Leaderboard & Analytics** — Global rankings and detailed submission history  
✅ **Role-Based Access** — Student, Teacher, and Admin portals with custom dashboards

---

## 🛠️ Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Backend** | NestJS + TypeScript | Modular, scalable microservice-ready |
| **Frontend** | Next.js 14 + React 18 | Server-side rendering, ISR support |
| **Database** | PostgreSQL (Prisma ORM) | Strong typing with Prisma schema |
| **Real-Time** | Socket.IO + Redis | Pub/sub for chat, lobbies, and matches |
| **Auth** | Custom JWT (HS512) | PBKDF2-HMAC-SHA256 password hashing |
| **Code Execution** | Judge0 (Docker) | Compilation API for 60+ languages |
| **AI** | OpenAI API | gpt-4-turbo for contextual hints |
| **Code Editor** | Monaco Editor | VS Code-like IDE in the browser |
| **Styling** | TailwindCSS 3.4 | Utility-first CSS with dark mode |
| **CI/CD** | GitHub Actions | Automated tests and deployments |
| **Hosting** | Cloud Run + Vercel | Serverless backend + edge frontend |

---

## 🚀 Quick Start

### Option 1: Full Docker (Simplest)

```bash
cd algorithm-battle-arena-v2
cp .env.example .env         # Update with your secrets
docker compose up -d
```

Then open **http://localhost:3000**  
Login: `admin@aba.com` / `Admin1234!`

### Option 2: Local Dev + Docker Infra (Recommended)

**Prerequisites:**
- Node.js 18+ ([nvm](https://github.com/nvm-sh/nvm) or direct install)
- Docker Desktop (for Postgres only)

```powershell
# Windows PowerShell — one command setup
.\dev.ps1
```

Then open **http://localhost:3000**

---

## 📟 Simple Run Commands

Once you have the infrastructure running, use these simple commands to start development:

### Backend (NestJS API)

```bash
cd packages/api
npm run start:dev
```

**Or in production mode:**
```bash
npm run build
npm run start:prod
```

### Frontend (Next.js App)

```bash
cd packages/web
npm run dev
```

**Or production build:**
```bash
npm run build
npm run start
```

### All-in-One (From Project Root)

```powershell
# Windows PowerShell - starts both API and Web with infra
.\dev.ps1

# Start with infrastructure
.\dev.ps1

# Skip infrastructure (if already running)
.\dev.ps1 -SkipInfra

# API only
.\dev.ps1 -ApiOnly

# Web only
.\dev.ps1 -WebOnly

# Stop all services
.\stop.ps1

# Stop everything including Docker containers
.\stop.ps1 -All
```

---

## 💻 Local Development

### Prerequisites

| Tool | Version | How to Install |
|------|---------|---|
| Node.js | 18+ | `nvm install 18` or [nodejs.org](https://nodejs.org) |
| npm | 9+ | Included with Node.js |
| Docker Desktop | Latest | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) |
| Git | Latest | [git-scm.com](https://git-scm.com) |

### Step 1: Infrastructure

Start Postgres and Redis containers:

```bash
docker compose -f docker-compose.infra.yml up -d
```

Verify:
```bash
docker ps  # Should show postgres and redis containers
```

### Step 2: NestJS API

```bash
cd packages/api
npm install

# Generate Prisma client and set up DB schema
npm run prisma:generate
npm run prisma:migrate

# Start the API server (http://localhost:5000)
npm run start:dev
```

In a new terminal, watch for changes:
```bash
npm run start:debug
```

### Step 3: Next.js Frontend

```bash
cd packages/web
npm install

# Start the dev server (http://localhost:3000)
npm run dev
```

### Step 4: Test the Setup

1. Open **http://localhost:3000**
2. Login as: `admin@aba.dev` / `admin123`
3. Navigate to **Student Dashboard** or **Create Challenge** (teacher)

---

### Script Helpers

From the repo root:

```powershell
# Start everything in one go
.\dev.ps1

# Start only API and Web (Postgres already running)
.\dev.ps1 -SkipInfra

# Start API only
.\dev.ps1 -ApiOnly

# Start Web only
.\dev.ps1 -WebOnly

# Stop API and Web (Postgres stays up)
.\stop.ps1

# Stop everything including Postgres
.\stop.ps1 -All
```

---

### Manual Commands (If Scripts Don't Work)

```bash
# 1. Terminal 1 - Database
docker compose -f docker-compose.infra.yml up -d

# 2. Terminal 2 - API
cd packages/api
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev

# 3. Terminal 3 - Frontend
cd packages/web
npm install
npm run dev
```

---

## 🐳 Docker Deployment

### Full Stack (All Containers)

```bash
docker compose up -d
```

**Services:**
- `api` — NestJS backend (port 5000)
- `postgres` — PostgreSQL database
- `redis` — Redis cache & pub/sub
- `judge0-server` — Code execution API (port 2358)
- `judge0-workers` — Async job processors

**Check logs:**
```bash
docker compose logs -f api       # API logs
docker compose logs -f judge0-server  # Judge0 logs
```

**Tear down:**
```bash
docker compose down              # Keep volumes
docker compose down -v           # Remove all data
```

### Infrastructure Only

For local development (app via Node.js):

```bash
docker compose -f docker-compose.infra.yml up -d
```

**Includes:** Postgres, Redis, Judge0  
**Does NOT include:** NestJS, Next.js containers

---

## 📁 Project Structure

```
algorithm-battle-arena-v2/
├── packages/
│   ├── api/                          # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/                 # Authentication & JWT
│   │   │   ├── chat/                 # WebSocket chat & messaging
│   │   │   ├── code-execution/       # Judge0 integration
│   │   │   ├── friends/              # Friend requests & relationships
│   │   │   ├── lobbies/              # Match lobbies & tournaments
│   │   │   ├── matches/              # Live match engine
│   │   │   ├── problems/             # Problem CRUD & AI helpers
│   │   │   ├── submissions/          # Code submission grading
│   │   │   ├── students/             # Student profiles & analytics
│   │   │   ├── teachers/             # Teacher management
│   │   │   ├── prisma/               # Database schema & migrations
│   │   │   ├── gateways/             # Socket.IO event handlers
│   │   │   ├── app.module.ts         # Root module
│   │   │   └── main.ts               # Entry point
│   │   ├── test/                     # Unit & integration tests
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Data model
│   │   │   └── migrations/           # DB migration history
│   │   ├── .env                      # Environment variables
│   │   ├── .env.example              # Template
│   │   └── package.json
│   │
│   └── web/                          # Next.js frontend
│       ├── src/
│       │   ├── app/                  # Next.js 14 App Router
│       │   │   ├── student-dashboard/
│       │   │   ├── chat/page.tsx
│       │   │   ├── leaderboard/page.tsx
│       │   │   ├── lobby/page.tsx
│       │   │   ├── match/[matchId]/page.tsx
│       │   │   ├── teacher/page.tsx
│       │   │   ├── admin/page.tsx
│       │   │   ├── login/page.tsx
│       │   │   ├── layout.tsx         # Root layout
│       │   │   └── page.tsx           # Landing page
│       │   ├── components/
│       │   │   ├── screens/           # Full-page components
│       │   │   ├── primitives/        # Design system (Card, Chip, StatTile)
│       │   │   ├── ui/                # Shadcn UI components
│       │   │   ├── chat/              # Chat-specific components
│       │   │   └── shell/             # AppShell wrapper
│       │   ├── hooks/                 # Custom React hooks
│       │   │   ├── useChat.ts
│       │   │   └── ...
│       │   ├── lib/
│       │   │   ├── api.ts             # Axios API client
│       │   │   ├── auth-context.tsx   # Auth state
│       │   │   ├── chatSocket.ts      # Socket.IO client
│       │   │   └── data.ts            # Mock/static data
│       │   └── styles/                # Global CSS & Tailwind config
│       ├── .env.local                 # Local env (not committed)
│       ├── .env.example               # Template
│       ├── next.config.js
│       └── package.json
│
├── scripts/
│   ├── init.sql                       # Database seed script
│   ├── migrations/                    # Data migration scripts
│   └── ...
│
├── docs/                              # Additional documentation
├── .github/
│   └── workflows/                     # GitHub Actions CI/CD
├── docker-compose.yml                 # Full stack
├── docker-compose.infra.yml           # Infra only (dev)
├── .env                               # Root-level secrets (docker-compose)
├── .env.example                       # Template
├── dev.ps1                            # Development startup script
├── stop.ps1                           # Stop script
└── README.md                          # THIS FILE
```

---

## 🔐 Environment Configuration

### Setup Steps

#### 1. Root `.env` (Docker - Used with Docker Compose)

For full Docker deployment (`docker-compose.yml`):

```bash
cd algorithm-battle-arena-v2
cp .env.example .env
```

Then edit `.env` with real values:

```env
# Database (Supabase PostgreSQL or local)
DATABASE_URL=postgresql://postgres:dev@localhost:5432/algorithm_battle_arena

# Redis (Local or Upstash)
REDIS_URL=redis://default:password@localhost:6379

# JWT Secret (min 64 chars for HS512)
JWT_SECRET=your-super-secret-jwt-key-min-64-characters-long-for-hs512

# Password hashing key (must stay consistent)
PASSWORD_KEY=your-consistent-password-key

# Admin account credentials
ADMIN_EMAIL=admin@aba.com
ADMIN_PASSWORD=Admin1234!

# Judge0 API (local Docker service)
JUDGE0_API_URL=http://judge0:2358

# OpenAI (optional for AI features)
OPENAI_API_KEY=sk-proj-your-key-here

# App settings
NODE_ENV=development
PORT=5000
```

#### 2. Backend `.env` (NestJS API - Local Development)

```bash
cd packages/api
cp .env.example .env
```

Key variables to configure:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://postgres:dev@localhost:5432/algorithm_battle_arena` | Local Postgres (Docker) or Supabase |
| `JWT_SECRET` | Random 64+ char string | Must match across all services |
| `PASSWORD_KEY` | Consistent key | Used for PBKDF2 hashing |
| `ADMIN_EMAIL` | `admin@aba.dev` | Default admin account |
| `ADMIN_PASSWORD` | `admin123` | Default admin password |
| `REDIS_URL` | `redis://localhost:6379` | Local or Upstash Redis |
| `JUDGE0_API_URL` | `http://localhost:2358` | Local Judge0 Docker service |
| `NODE_ENV` | `development` | Switch to `production` for builds |
| `PORT` | `5000` | Backend port |

#### 3. Frontend `.env.local` (Next.js - Local Development Only)

**This file is NOT in git** — create it locally:

```bash
cd packages/web
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
EOF
```

⚠️ **Important:** Prefix env vars with `NEXT_PUBLIC_` to expose them to the browser.

### Environment Variables Reference

| File | Variable | Purpose | Example |
|------|----------|---------|---------|
| **Root .env** | `DATABASE_URL` | Database connection string | `postgresql://user:pass@localhost:5432/db` |
| **Root .env** | `REDIS_URL` | Redis pub/sub for real-time features | `redis://localhost:6379` |
| **Root .env** | `JWT_SECRET` | JWT token signing (min 64 chars) | `your-secret-...` |
| **Root .env** | `PASSWORD_KEY` | PBKDF2 password hashing key | `your-key-...` |
| **Root .env** | `JUDGE0_API_URL` | Judge0 code execution endpoint | `http://localhost:2358` |
| **packages/api/.env** | `OPENAI_API_KEY` | OpenAI API key (optional) | `sk-proj-...` |
| **packages/web/.env.local** | `NEXT_PUBLIC_API_URL` | Backend API URL (visible in browser) | `http://localhost:5000` |
| **packages/web/.env.local** | `NEXT_PUBLIC_SOCKET_URL` | WebSocket server URL | `http://localhost:5000` |

---

## 🗄️ Database & Migrations

### Viewing the Schema

```bash
cd packages/api
cat prisma/schema.prisma
```

Key tables:
- `Student` — User profile for learners
- `Teacher` — User profile for instructors
- `Problem` — Coding challenges
- `Lobby` — Match game rooms
- `Match` — Active competitive session
- `Submission` — Student code submissions
- `Conversation` — Chat threads
- `Message` — Chat messages

### Running Migrations

Auto-migrate on startup:
```bash
npm run prisma:migrate dev
```

Push existing schema (no migrations):
```bash
npm run prisma:db:push
```

Reset database (⚠️ deletes all data):
```bash
npm run prisma:migrate:reset
```

### Viewing Data

```bash
npm run prisma:studio
# Opens http://localhost:5555 — visual DB browser
```

---

## 📡 API Documentation

### Base URL

**Local:** `http://localhost:5000/api`  
**Production:** `https://your-cloud-run-domain.run.app/api`

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/Auth/login` | Student/teacher login |
| **GET** | `/Auth/profile` | Current user profile |
| **GET** | `/Problems` | List all problems |
| **POST** | `/Lobbies` | Create a new match lobby |
| **POST** | `/Matches/{lobbyId}/start` | Start match, generate problems |
| **POST** | `/CodeExecution/run-tests` | Execute code with test cases |
| **POST** | `/Submissions` | Submit solution (auto-graded) |
| **GET** | `/Statistics/leaderboard` | Global rankings |
| **GET** | `/Chat/conversations` | User's chat threads |
| **POST** | `/Chat/conversations/{id}/messages` | Send message |

### WebSocket Events

Real-time updates via Socket.IO:

**Chat:**
- `JoinConversation` → `NewMessage` (incoming)

**Lobby:**
- `JoinLobby` → `LobbyUpdated` (participant changes)
- `LobbyDeleted` (host closes)

**Match:**
- `JoinMatch` → `MatchStateUpdated` (score changes)

---

## 🎨 Frontend Architecture

### Routing (App Router)

Next.js 14 file-based routing:

```
pages/
  page.tsx              → /
  login/page.tsx        → /login
  student-dashboard/page.tsx  → /student-dashboard
  chat/page.tsx         → /chat
  match/[matchId]/page.tsx    → /match/123
```

### Component Structure

- **Screens** — Full-page components (StudentDashboard, MatchPage)
- **Primitives** — Design system (Card, Chip, StatTile, ProgressRing)
- **UI** — Shadcn/ui components (Button, Input, Avatar, Dropdown)
- **Shell** — Layout wrapper (AppShell with sidebar nav)

### State Management

- **Auth Context** (`useAuth`) — Current user, login/logout
- **Chat Hook** (`useChat`) — Conversation list, messages, send
- **React Query (optional)** — Server state caching

### Styling

- **TailwindCSS** — Utility classes
- **CSS-in-JS** — inline `style={{}}` for dynamic colors
- **Dark mode** — CSS variables (e.g., `var(--surface)`, `var(--primary)`)

---

## ⚡ Real-Time Features

### Socket.IO Setup

**Server** (`packages/api/src/gateways/`)
- `chat.gateway.ts` — Chat messages and typing
- `lobby.gateway.ts` — Lobby participant updates
- `match.gateway.ts` — Live match events

**Client** (`packages/web/src/lib/chatSocket.ts`)
- Connects to `/chat` namespace
- Auto-reconnects on disconnect
- Emits/listens to custom events

### Example: Sending a Message

```typescript
// Frontend
const { sendMessage } = useChat();
await sendMessage(conversationId, "Hello!");

// Server receives, stores in DB, broadcasts via Socket.IO
// Other participants see real-time update
```

---

## 🔑 Authentication

### Login Flow

1. User submits email + password
2. API validates credentials (PBKDF2 hash check)
3. Server returns JWT token (HS512 signed)
4. Frontend stores token in secure HTTP-only cookie
5. Subsequent requests include JWT in `Authorization: Bearer <token>`

### Password Security

- **Hash:** PBKDF2-HMAC-SHA256 (configurable iterations)
- **Salt:** Unique per user (embedded in hash)
- **Key:** `PASSWORD_KEY` environment variable

### JWT Payload

```json
{
  "email": "student@aba.dev",
  "role": "Student",
  "studentId": 42,
  "iat": 1234567890,
  "exp": 1234668890
}
```

**TTL:** 7 days (configurable via `JWT_EXPIRY`)

---

## 👥 Features by Role

### Student
- 🏠 **Dashboard** — Stats, recent matches, friends
- ⚔️ **Create/Join Arenas** — Enter match lobbies
- 🎮 **Live Coding** — Editor with Run/Submit buttons
- 💬 **Chat** — Message friends and teachers
- 📊 **Leaderboard** — View global rankings
- 📚 **Micro-Courses** — AI-powered hints when stuck

### Teacher
- 🎓 **Dashboard** — Students, submissions, analytics
- ➕ **Create Challenges** — Write problems with tests
- 🏛️ **Manage Students** — Accept requests, view progress
- 💬 **Chat** — Message students
- 📋 **Submissions** — Review code and scores

### Admin
- ⚙️ **Console** — User management, system config
- 👥 **Members** — Enable/disable accounts
- 📚 **Problems** — Import/export problem sets
- 🏆 **Leaderboard** — Global view

---

## 🐛 Troubleshooting

### `npm install` hangs

```bash
npm cache clean --force
npm install --prefer-offline
```

### Postgres won't start

```bash
# Check if 5432 is already in use
lsof -i :5432      # macOS/Linux
netstat -ano | findstr :5432  # Windows

# Reset Docker volumes
docker compose down -v
docker compose up -d
```

### JWT validation fails

Ensure `JWT_SECRET` matches across containers:
```bash
# In .env
JWT_SECRET=your-consistent-secret-64-chars-minimum
```

### Judge0 submission hangs

Judge0 needs Redis. Ensure both are running:
```bash
docker ps | grep redis
docker ps | grep judge0
```

If missing, restart infra:
```bash
docker compose down
docker compose up -d
```

### Socket.IO messages not real-time

Check Redis connection:
```bash
docker compose exec redis redis-cli ping
# Should return: PONG
```

Check Socket.IO adapter:
```typescript
// packages/api/src/main.ts
// Verify Redis adapter is registered
```

### Frontend showing 404 for routes

Ensure Next.js app is fully built:
```bash
npm run build
npm run start  # or npm run dev
```

Check that routes exist in `src/app/` folder.

---

## 🤝 Contributing

### Code Style

- **TypeScript** — Strict mode enabled
- **ESLint** — Run before commit
- **Prettier** — Auto-format on save

### Running Tests

```bash
# Backend
cd packages/api
npm run test                    # Unit tests
npm run test:e2e               # End-to-end tests

# Frontend
cd packages/web
npm run test                    # Jest + React Testing Library
```

### Commit Convention

```
feat: add new feature
fix: resolve bug
docs: update documentation
refactor: code cleanup
test: add/update tests
```

Example:
```
feat: add AI micro-course generation for problems
fix: correct chat message timestamps
```

### Pull Request Process

1. **Fork & branch** — `git checkout -b feat/your-feature`
2. **Commit** — Follow convention above
3. **Test** — Run `npm run test` locally
4. **Push** — `git push origin feat/your-feature`
5. **PR** — Fill template, request review
6. **CI** — Wait for GitHub Actions to pass
7. **Merge** — Squash + merge

---

## 📦 Deployment

### Backend (Cloud Run)

```bash
cd packages/api
docker build -t your-api:latest .
docker tag your-api:latest gcr.io/your-project/api:latest
docker push gcr.io/your-project/api:latest

# Deploy to Cloud Run
gcloud run deploy api \
  --image gcr.io/your-project/api:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars="DATABASE_URL=...,JWT_SECRET=..." \
  --allow-unauthenticated
```

### Frontend (Vercel)

```bash
cd packages/web
npm run build
vercel deploy --prod
```

Or push to GitHub and auto-deploy via Vercel integration.

---

## 📞 Support

- **Issues** — GitHub Issues
- **Discussions** — GitHub Discussions
- **Docs** — `/docs` folder
- **Email** — pavanvilhan@gmail.com (example)

---

## 📄 License

See `LICENSE` file.

---

**Last Updated:** May 31, 2026  
**Version:** 2.0.0

