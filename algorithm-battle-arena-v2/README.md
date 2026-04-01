﻿# Algorithm Battle Arena v2

> Migrated from ASP.NET Core 8 + MSSQL + SignalR + React/Vite + Azure  
> To: NestJS + PostgreSQL + Socket.IO + Redis + Next.js + Judge0 + Docker

## Quick Start (Full Docker)

```bash
cp .env.example .env
docker compose up -d
```

## 🚀 Local Development (No Docker for app code)

Run the API and frontend natively with Node.js — Docker is only used for
the Postgres database container.

### Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18+ | via nvm, nvm4w, or direct install |
| npm | 9+ | included with Node |
| Docker Desktop | any | **only** for Postgres container |

### One-command start

```powershell
# From the repo root — starts Postgres, runs migrations, starts API + web
.\dev.ps1
```

Then open **http://localhost:3000**

Default admin login: `admin@aba.dev` / `admin123`

### Script options

```powershell
.\dev.ps1              # Start everything (Postgres + API + Web)
.\dev.ps1 -SkipInfra   # Postgres already running — skip Docker step
.\dev.ps1 -ApiOnly     # Start only the NestJS API (port 5000)
.\dev.ps1 -WebOnly     # Start only the Next.js frontend (port 3000)

.\stop.ps1             # Kill API and Web processes (Postgres stays up)
.\stop.ps1 -All        # Kill everything including Postgres container
```

### Manual step-by-step

```powershell
# 1. Start Postgres only (no Redis, no Judge0, no app containers)
docker compose -f docker-compose.infra.yml up -d

# 2. NestJS API
cd packages/api
npm install
npm run prisma:generate
npm run prisma:migrate     # creates/updates DB schema
npm run start:dev          # http://localhost:5000

# 3. Next.js Frontend (new terminal)
cd packages/web
npm install
npm run dev                # http://localhost:3000
```

### What works without Judge0

| Feature | Without Judge0 | With Judge0 |
|---------|---------------|-------------|
| **Run** (in match editor) | ✅ Client-side execution | ✅ |
| **Submit** | ❌ Returns error | ✅ Server-side graded |
| All other features | ✅ | ✅ |

To enable server-side submission grading locally, add Judge0 to infra:

```powershell
docker compose -f docker-compose.infra.yml up -d  # then add:
docker run -d -p 2358:2358 --env REDIS_URL=redis://host.docker.internal:6379 judge0/judge0:latest
```

### Ports

| Service | Port | URL |
|---------|------|-----|
| Next.js Frontend | 3000 | http://localhost:3000 |
| NestJS API | 5000 | http://localhost:5000/api |
| PostgreSQL | 5432 | localhost:5432 |

## Project Structure

```
packages/
  api/        — NestJS backend (TypeScript)
  web/        — Next.js frontend (TypeScript) — Phase B
  shared/     — Shared DTOs and types
scripts/      — Data migration & utilities
docs/         — Documentation
```

## Migration Phases

- **Phase A**: NestJS backend validated against existing React frontend
- **Phase B**: Incremental Next.js frontend migration

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS + TypeScript |
| Database | PostgreSQL (Supabase Free) |
| ORM | Prisma |
| Real-Time | Socket.IO + Redis adapter |
| Auth | Custom JWT (HS512) + PBKDF2-HMAC-SHA256 |
| Code Execution | Judge0 (self-hosted Docker) |
| Frontend | Next.js 14 + React 18 + TypeScript |
| CSS | TailwindCSS 3.4 |
| Code Editor | Monaco Editor |
| CI/CD | GitHub Actions |
| Hosting | Cloud Run (API) + Vercel (Frontend) |

