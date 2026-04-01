# Local Development Setup Guide

> This guide covers running Algorithm Battle Arena v2 fully locally on Windows,
> using a **locally installed PostgreSQL** (no Docker required for the database).

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18+ | https://nodejs.org or via nvm-windows |
| npm | 9+ | Included with Node.js |
| PostgreSQL | any | Installed locally (e.g. `C:\Software\PostgreSQL\18`) |

> **Docker is NOT required** if PostgreSQL is already installed locally.

---

## 1. Clone & Navigate

```powershell
git clone <repo-url>
cd algorithm-battle-arena-v2
```

---

## 2. Set Up Environment Files

### API (`packages/api/.env`)

Copy the example and fill in your values:

```powershell
cp packages\api\.env.example packages\api\.env   # if an example exists
# OR edit packages\api\.env directly
```

Set the `DATABASE_URL` to use your local PostgreSQL password:

```dotenv
DATABASE_URL=postgresql://postgres:<YOUR_PG_PASSWORD>@localhost:5432/algorithm_battle_arena
JWT_SECRET=local_dev_jwt_secret_key_that_is_at_least_64_characters_for_hs512_algorithm
PASSWORD_KEY=local_dev_password_key
ADMIN_EMAIL=admin@aba.dev
ADMIN_PASSWORD=admin123
REDIS_URL=redis://localhost:6379
JUDGE0_API_URL=http://localhost:2358
NODE_ENV=development
PORT=5000
```

> Replace `<YOUR_PG_PASSWORD>` with your actual PostgreSQL `postgres` user password.

### Frontend (`packages/web/.env.local`)

```powershell
cp packages\web\.env.local.example packages\web\.env.local
```

Contents (already correct for local dev):

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 3. Create the PostgreSQL Database

Add `psql` to your PATH (adjust version number to match your install):

```powershell
$env:PATH = "C:\Software\PostgreSQL\18\bin;$env:PATH"
```

Create the database:

```powershell
psql -U postgres -c "CREATE DATABASE algorithm_battle_arena;"
```

> You will be prompted for your PostgreSQL password, or set `$env:PGPASSWORD = "<YOUR_PG_PASSWORD>"` beforehand to skip the prompt.

---

## 4. Install Dependencies & Run Migrations

### API

```powershell
cd packages\api
npm install
npm run prisma:generate
npm run prisma:migrate
```

`prisma:migrate` runs `prisma migrate dev` — it will:
- Detect the current DB state
- Apply all pending migrations (or create a new one if none exist)
- Regenerate the Prisma client

> If prompted **"Do you want to reset the schema?"** — type `yes`. This only matters on a fresh/empty database.
> If prompted for a **migration name** — enter anything, e.g. `algorithm-battle-arena`.

### Frontend

```powershell
cd ..\web
npm install
```

---

## 5. Start the Application

Open **two separate terminals**:

### Terminal 1 — NestJS API (port 5000)

```powershell
cd packages\api
npm run start:dev
```

Wait until you see `Nest application successfully started` in the output.

### Terminal 2 — Next.js Frontend (port 3000)

```powershell
cd packages\web
npm run dev
```

Wait until you see `Ready in ...ms` or `Local: http://localhost:3000`.

---

## 6. Open the App

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:5000/api |
| PostgreSQL | localhost:5432 (db: `algorithm_battle_arena`) |

**Default admin credentials:**
- Email: `admin@aba.dev`
- Password: `admin123`

---

## Stopping

Simply press `Ctrl+C` in each terminal.

---

## Troubleshooting

### `psql` not found
Add your PostgreSQL `bin` folder to PATH:
```powershell
$env:PATH = "C:\Software\PostgreSQL\<VERSION>\bin;$env:PATH"
```

### `CREATE DATABASE` — password authentication failed
Make sure `$env:PGPASSWORD` matches your postgres user password, or enter it at the prompt.

### Prisma migration drift / schema reset prompt
On a fresh database this is normal. Type `yes` to reset and let Prisma apply the full migration from scratch.

### Port already in use (5000 or 3000)
Find and kill the occupying process:
```powershell
netstat -ano | findstr ":5000"
Stop-Process -Id <PID> -Force
```

### Redis connection errors in API logs
Redis is optional for basic local development. Most features work without it. To run Redis locally, either install it natively or use Docker:
```powershell
docker run -d -p 6379:6379 redis:alpine
```

### Submit button returns an error
Judge0 (code execution engine) is not required for local dev. The **Run** button works client-side. The **Submit** button requires Judge0:
```powershell
docker run -d -p 2358:2358 judge0/judge0:latest
```
Then set `JUDGE0_API_URL=http://localhost:2358` in `packages/api/.env`.

