# Migration Plan — Algorithm Battle Arena (Scalable Production Stack)

> **From:** ASP.NET Core 8 + Dapper + MSSQL + SignalR + React/Vite + Azure
> **To:** Node.js/NestJS + Socket.IO + PostgreSQL + Redis + Next.js + Judge0 + Docker + Vercel/Cloud Run

---

## Table of Contents

1. [Migration Strategy](#1-migration-strategy)
2. [Current vs Target Stack Mapping](#2-current-vs-target-stack-mapping)
3. [Phase 1 — Database Migration (MSSQL → PostgreSQL)](#3-phase-1--database-migration-mssql--postgresql)
4. [Phase 2 — Backend Core, Auth & Middleware (ASP.NET → NestJS)](#4-phase-2--backend-core-auth--middleware-aspnet--nestjs)
5. [Phase 3 — Repository Layer & REST Controllers](#5-phase-3--repository-layer--rest-controllers)
6. [Phase 4 — Real-Time (SignalR → Socket.IO)](#6-phase-4--real-time-signalr--socketio)
7. [Phase 5 — Code Execution (Web Worker → Judge0)](#7-phase-5--code-execution-web-worker--judge0)
8. [Phase 6 — Frontend (Vite/React → Next.js + Socket.IO Client)](#8-phase-6--frontend-vitereact--nextjs--socketio-client)
9. [Phase 7 — Infrastructure, CI/CD & Deployment](#9-phase-7--infrastructure-cicd--deployment)
10. [New Repo Structure](#10-new-repo-structure)
11. [Risk Register & Mitigations](#11-risk-register--mitigations)
12. [Estimated Timeline](#12-estimated-timeline)

---

## 1. Migration Strategy

### Approach: Parallel Build with API-Contract Compatibility

The migration follows a **strangle-fig pattern**: the new NestJS backend is built in parallel, maintaining identical API route paths and request/response shapes. This allows the existing React frontend to switch between old and new backends by changing a single base URL. Once the backend is verified, the frontend is migrated to Next.js.

```
Week 1-4:  [Phase 1 + 2] Database + Auth + Middleware in NestJS
Week 4-7:  [Phase 3]     All 12 repositories + 11 controllers ported
Week 7-9:  [Phase 4 + 5] Socket.IO gateways + Judge0 integration
Week 9-12: [Phase 6]     Frontend migrated to Next.js + TypeScript
Week 12-14:[Phase 7]     Docker, CI/CD, production deployment
```

### Key Principles

- **API contracts are sacred** — every REST endpoint path, HTTP method, request body, and response shape remains identical so the old frontend works against the new backend.
- **Business rules are copied verbatim** — all 10 critical business rules from `PROJECT_DOCUMENTATION.md` Section 10 are preserved.
- **Password hashes are binary-compatible** — PBKDF2-HMAC-SHA256 with the same `PasswordKey + salt` pattern is reimplemented in Node.js `crypto` so existing users can log in without password resets.
- **Data is migrated, not recreated** — a migration script moves all existing rows from MSSQL to PostgreSQL.

---

## 2. Current vs Target Stack Mapping

| Layer | Current | Target | Migration Complexity |
| --- | --- | --- | --- |
| **Backend Framework** | ASP.NET Core 8 (C#) | NestJS (TypeScript) | 🔴 High — full rewrite |
| **Data Access** | Dapper (raw SQL) | Prisma ORM + raw SQL fallback | 🟡 Medium — SQL is portable |
| **Database** | Microsoft SQL Server | PostgreSQL (Supabase) | 🟡 Medium — syntax differences |
| **Real-Time** | SignalR (2 hubs) | Socket.IO (2 gateways) | 🟡 Medium — concept parity |
| **Authentication** | Custom JWT + PBKDF2 | Custom JWT + PBKDF2 (keep custom) | 🟢 Low — same algorithm |
| **Code Execution** | Client-side Web Worker | Judge0 (server-side Docker) + Web Worker (client "Run") | 🟡 Medium — new service |
| **Frontend Framework** | React 18 + Vite (JSX) | Next.js 14 + React 18 (TSX) | 🟡 Medium — port + TypeScript |
| **Real-Time Client** | @microsoft/signalr | socket.io-client | 🟢 Low — thin wrapper |
| **CSS** | TailwindCSS 3.4 | TailwindCSS 3.4 (identical) | 🟢 None |
| **Code Editor** | Monaco Editor | Monaco Editor (identical) | 🟢 None |
| **Hosting (Backend)** | Azure Web App | Google Cloud Run / AWS ECS | 🟡 Medium — Docker |
| **Hosting (Frontend)** | Azure Static Web Apps | Vercel | 🟢 Low — auto-deploy |
| **CI/CD** | GitHub Actions (2 workflows) | GitHub Actions (1 unified) | 🟢 Low |
| **Caching** | None | Redis (Socket.IO adapter + cache) | 🟢 New addition |
| **Testing** | xUnit + Selenium | Jest + Supertest + Playwright | 🟡 Medium — rewrite tests |

---

## 3. Phase 1 — Database Migration (MSSQL → PostgreSQL)

### 3.1 Provision PostgreSQL

- Create a **Supabase project** (free tier: 500 MB, 50k MAU) for hosted PostgreSQL.
- Alternatively, run `docker run -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres:16` for local development.

### 3.2 Translate DDL Script

Convert `DATABASE_AlgorithmBattleArina.sql` (393 lines, 16 tables) to PostgreSQL syntax:

| MSSQL | PostgreSQL |
| --- | --- |
| `NVARCHAR(50)` | `VARCHAR(50)` |
| `NVARCHAR(MAX)` | `TEXT` |
| `BIT` | `BOOLEAN` |
| `INT IDENTITY(1,1)` | `INT GENERATED ALWAYS AS IDENTITY` |
| `VARBINARY(MAX)` | `BYTEA` |
| `DATETIME` / `DATETIME2` | `TIMESTAMPTZ` |
| `GETDATE()` | `NOW()` |
| `NEWID()` | `gen_random_uuid()` |
| `CHECK IN ('A', 'B')` | `CHECK (col IN ('A', 'B'))` — same |
| Schema: `AlgorithmBattleArinaSchema.` | Schema: `public.` (or keep named schema) |

**Tables to convert (16):**

```
Auth, Teachers, Student, Problems, ProblemTestCases, ProblemSolutions,
Lobbies, LobbyParticipants, Matches, MatchProblems, Submissions,
StudentTeacherRequests, Friends, FriendRequests,
Conversations, ConversationParticipants, Messages, AuditLog
```

### 3.3 Convert Stored Procedure

**`spUpsertProblem`** → Replace with NestJS service-layer logic:

```typescript
// ProblemService.upsertProblem(dto)
await prisma.$transaction(async (tx) => {
  const problem = await tx.problem.upsert({
    where: { title: dto.title },
    update: { description: dto.description, ... },
    create: { title: dto.title, description: dto.description, ... },
  });
  // Upsert test cases via INSERT ... ON CONFLICT
  // Upsert solutions via INSERT ... ON CONFLICT
  return problem.problemId;
});
```

### 3.4 Data Migration Script

Create `scripts/migrate-data.ts`:

1. Connect to MSSQL via `mssql` npm package.
2. Connect to PostgreSQL via `pg` npm package.
3. For each table (in FK-dependency order): `SELECT *` from MSSQL → `INSERT` into PostgreSQL.
4. **Critical**: `PasswordHash` and `PasswordSalt` are `VARBINARY` (MSSQL) → `BYTEA` (PostgreSQL). Transfer as raw `Buffer` objects — **not** hex strings.
5. Reset PostgreSQL sequences to `MAX(id) + 1` for each identity column.
6. Run verification queries: `SELECT COUNT(*)` on both sides must match.

### 3.5 Set Up Prisma

```bash
npm install prisma @prisma/client
npx prisma init --datasource-provider postgresql
```

Create `prisma/schema.prisma` with models matching all 16 tables. Run `npx prisma db pull` to introspect or write models manually.

---

## 4. Phase 2 — Backend Core, Auth & Middleware (ASP.NET → NestJS)

### 4.1 Scaffold NestJS Application

```bash
npx @nestjs/cli new api --package-manager npm --language ts
cd api
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/config @nestjs/platform-socket.io
npm install class-validator class-transformer
npm install @prisma/client prisma
npm install csv-parse   # replaces CsvHelper
npm install axios       # for OpenAI HTTP calls
```

### 4.2 Environment Configuration

Create `.env.example`:

```env
DATABASE_URL=postgresql://user:pass@host:5432/algorithm_battle_arena
JWT_SECRET=your_jwt_secret_key_here
PASSWORD_KEY=your_password_encryption_key_here
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin_password
OPENAI_API_KEY=sk-xxx
REDIS_URL=redis://localhost:6379
JUDGE0_API_URL=http://localhost:2358
```

Register via `ConfigModule.forRoot({ isGlobal: true })`.

### 4.3 Port AuthHelper → AuthService

| Current (C# AuthHelper) | New (TS AuthService) |
| --- | --- |
| `GetPasswordSalt()` — 16 random bytes | `crypto.randomBytes(16)` |
| `GetPasswordHash(pw, salt)` — PBKDF2-HMAC-SHA256, 100K iter, 32-byte | `crypto.pbkdf2Sync(pw, Buffer.concat([passwordKeyBytes, salt]), 100000, 32, 'sha256')` |
| `VerifyPasswordHash(pw, hash, salt)` | Recompute and `timingSafeEqual` compare |
| `CreateToken(email, role, userId?)` — HMAC-SHA512, 24h | `jwtService.sign({ email, role, studentId/teacherId }, { algorithm: 'HS512', expiresIn: '24h' })` |
| `ValidateAdminCredentials(email, pw)` | Compare against `configService.get('ADMIN_EMAIL/PASSWORD')` |

**Critical**: The salt composition must be `Buffer.concat([Buffer.from(PASSWORD_KEY, 'utf8'), randomSalt])` to match the existing C# implementation byte-for-byte.

### 4.4 JWT Strategy & Guards

```typescript
// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
      algorithms: ['HS512'],
    });
  }
  validate(payload: any) {
    return { email: payload.email, role: payload.role,
             studentId: payload.studentId, teacherId: payload.teacherId };
  }
}
```

**Custom Guards** (mirror C# attributes):

| C# Attribute | NestJS Guard |
| --- | --- |
| `[AdminOnly]` | `@UseGuards(JwtAuthGuard, AdminGuard)` |
| `[StudentOnly]` | `@UseGuards(JwtAuthGuard, StudentGuard)` |
| `[StudentOrAdmin]` | `@UseGuards(JwtAuthGuard, StudentOrAdminGuard)` |

Also extract JWT from `?access_token=` query param for Socket.IO handshake (mirrors the SignalR `OnMessageReceived` event).

### 4.5 Port AuditLoggingMiddleware

Create `audit-logging.middleware.ts`:

- Intercept `PUT`, `POST`, `DELETE` on paths containing `/admin` or `/users/`.
- Read and sanitise request body — replace fields containing `password`, `pass`, `token`, `secret` with `[REDACTED]`.
- Extract actor ID from JWT claims (format: `Student:123`, `Teacher:456`, `Admin:email`).
- Extract resource type and ID from URL path.
- Insert into `audit_log` table via Prisma.
- Generate `X-Correlation-Id` header.

### 4.6 Define All DTOs

Port all 30 DTO classes to TypeScript with `class-validator` decorators:

```
packages/shared/src/dto/
├── auth/          (UserForLoginDto, StudentForRegistrationDto, TeacherForRegistrationDto, ...)
├── problem/       (ProblemUpsertDto, ProblemResponseDto, ProblemFilterDto, ProblemListDto, ...)
├── lobby/         (LobbyCreateDto, LobbyDto, UpdatePrivacyDto, UpdateDifficultyDto)
├── match/         (StartMatchRequest, MatchStartedDto)
├── submission/    (SubmissionDto, SubmissionResultDto, TestCaseResultDto)
├── chat/          (ConversationDto, MessageDto, SendMessageDto, CreateFriendConversationDto)
├── friend/        (FriendDto, FriendRequestDto, SendFriendRequestDto)
├── student/       (StudentRequestDto, StudentAnalyticsDto, TeacherDashboardStatsDto, ...)
├── statistics/    (UserStatisticsDto, LeaderboardEntryDto)
├── admin/         (AdminUserDto, UserToggleDto, ImportResultDto, ImportErrorDto)
└── micro-course/  (MicroCourseRequestDto, MicroCourseResponseDto, MicroCourseStepDto)
```

---

## 5. Phase 3 — Repository Layer & REST Controllers

### 5.1 Port All 12 Repositories

Each C# repository (`IXxxRepository` + `XxxRepository`) becomes a NestJS `@Injectable()` service. Dapper raw SQL translates to Prisma queries or `prisma.$queryRaw` for complex queries.

**SQL Translation Cheat Sheet (MSSQL → PostgreSQL):**

| MSSQL | PostgreSQL |
| --- | --- |
| `SELECT TOP N ...` | `SELECT ... LIMIT N` |
| `ORDER BY NEWID()` | `ORDER BY RANDOM()` |
| `OFFSET @skip ROWS FETCH NEXT @take ROWS ONLY` | `OFFSET $1 LIMIT $2` |
| `SCOPE_IDENTITY()` | `RETURNING id` |
| `ISNULL(col, default)` | `COALESCE(col, default)` |
| `LEN(col)` | `LENGTH(col)` |
| `CONVERT(...)` | `CAST(... AS ...)` |
| String concat `+` | `\|\|` |
| Boolean `1`/`0` | `TRUE`/`FALSE` |

**Repository → Service mapping (12 services):**

| C# Repository | NestJS Service | Key Notes |
| --- | --- | --- |
| `AuthRepository` | `AuthRepoService` | Registration inserts into `auth` + `student`/`teacher` in a transaction |
| `LobbyRepository` | `LobbyRepoService` | Most complex — 10 methods, multi-query for participants |
| `MatchRepository` | `MatchRepoService` | Leaderboard aggregations: `SUM`, `COUNT`, window functions |
| `ProblemRepository` | `ProblemRepoService` | Dynamic SQL for filters; stored proc becomes `upsert` logic |
| `SubmissionRepository` | `SubmissionRepoService` | Simple CRUD |
| `StudentRepository` | `StudentRepoService` | Complex analytics aggregations |
| `TeacherRepository` | `TeacherRepoService` | 2 methods only |
| `StatisticsRepository` | `StatisticsRepoService` | Aggregate rank + stats |
| `FriendsRepository` | `FriendsRepoService` | Accept creates `friends` row + conversation |
| `ChatRepository` | `ChatRepoService` | Idempotent participant insert, conversation dedup by type+referenceId |
| `AdminRepository` | `AdminRepoService` | UNION query across student + teacher tables, prefixed IDs |
| `ProblemImportRepository` | `ProblemImportService` | Validation + batch upsert; CSV via `csv-parse` |

### 5.2 Port All 11 Controllers

Each C# controller becomes a NestJS `@Controller()`. Route paths remain **identical**:

| Controller | Route Prefix | Endpoints | Guards |
| --- | --- | --- | --- |
| `AuthController` | `/api/auth` | 5 endpoints | AllowAnonymous (3) + JwtAuthGuard (2) |
| `ProblemsController` | `/api/problems` | 9 endpoints | AdminGuard, StudentOrAdminGuard, JwtAuthGuard |
| `LobbiesController` | `/api/lobbies` | 10 endpoints | StudentOrAdminGuard (all) |
| `MatchesController` | `/api/matches` | 3 endpoints | StudentOrAdminGuard + JwtAuthGuard |
| `SubmissionsController` | `/api/submissions` | 2 endpoints | JwtAuthGuard |
| `ChatController` | `/api/chat` | 4 endpoints | JwtAuthGuard |
| `FriendsController` | `/api/friends` | 8 endpoints | StudentGuard |
| `StudentsController` | `/api/students` | 8 endpoints | JwtAuthGuard (role-checked in handler) |
| `TeachersController` | `/api/teachers` | 1 endpoint | JwtAuthGuard |
| `StatisticsController` | `/api/statistics` | 2 endpoints | StudentOrAdminGuard |
| `AdminController` | `/api/admin` | 3 endpoints | AdminGuard |

### 5.3 Port PagedResult & ControllerHelper

- `PagedResult<T>` → TypeScript generic: `{ items: T[]; total: number; }`.
- `ControllerHelper.SafeExecuteAsync` → NestJS global exception filter (`AllExceptionsFilter`).
- `ImportException` → custom `HttpException` subclass with `errors: ImportErrorDto[]`.

---

## 6. Phase 4 — Real-Time (SignalR → Socket.IO)

### 6.1 Install Dependencies

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install @socket.io/redis-adapter ioredis  # for multi-instance scaling
```

### 6.2 Port MatchHub → LobbyGateway

```typescript
@WebSocketGateway({ namespace: '/lobby', cors: true })
export class LobbyGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('JoinLobby')
  async handleJoinLobby(client: Socket, lobbyId: string) {
    client.join(lobbyId);
    const lobby = await this.lobbyRepo.getLobbyById(+lobbyId);
    this.server.to(lobbyId).emit('LobbyUpdated', lobby);
  }

  @SubscribeMessage('LeaveLobby')
  async handleLeaveLobby(client: Socket, lobbyId: string) {
    client.leave(lobbyId);
    const lobby = await this.lobbyRepo.getLobbyById(+lobbyId);
    this.server.to(lobbyId).emit('LobbyUpdated', lobby);
  }
}
```

**Server-to-Client events** (emitted from controllers via injected gateway):

| Event | Payload | Trigger |
| --- | --- | --- |
| `LobbyUpdated` | Lobby object with participants | Any lobby state change |
| `MatchStarted` | `MatchStartedDto` | Host starts a match |
| `LobbyDeleted` | (none) | Host deletes lobby |

### 6.3 Port ChatHub → ChatGateway

```typescript
@WebSocketGateway({ namespace: '/chat', cors: true, transports: ['websocket'] })
export class ChatGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('JoinConversation')
  async handleJoin(client: Socket, conversationId: string) {
    // verify participant via chatRepo.isParticipant
    client.join(`conversation_${conversationId}`);
  }

  @SubscribeMessage('SendMessage')
  async handleSend(client: Socket, data: { conversationId: string; content: string }) {
    // save to DB, then broadcast
    const message = await this.chatRepo.sendMessage(...);
    this.server.to(`conversation_${data.conversationId}`).emit('NewMessage', message);
  }
}
```

### 6.4 JWT Authentication in Socket.IO Handshake

```typescript
// In gateway constructor or adapter:
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.access_token;
  try {
    const payload = jwtService.verify(token, { algorithms: ['HS512'] });
    socket.data.user = payload;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});
```

### 6.5 Redis Adapter for Multi-Instance

```typescript
// main.ts
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'ioredis';

const pubClient = new Redis(process.env.REDIS_URL);
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));
```

---

## 7. Phase 5 — Code Execution (Web Worker → Judge0)

### 7.1 Deploy Judge0

**Option A (MVP):** Use the free hosted Judge0 API at `https://judge0-ce.p.rapidapi.com`.

**Option B (Production):** Self-host via Docker:

```yaml
# docker-compose.yml (partial)
judge0:
  image: judge0/judge0:latest
  ports:
    - "2358:2358"
  environment:
    - REDIS_URL=redis://redis:6379
  depends_on:
    - redis
    - postgres
```

### 7.2 Create CodeExecutionService

```typescript
@Injectable()
export class CodeExecutionService {
  async executeCode(code: string, language: string, stdin: string, timeout: number): Promise<ExecutionResult> {
    // POST to Judge0 /submissions with { source_code, language_id, stdin, cpu_time_limit }
    // Poll GET /submissions/:token until status != 'Processing'
    // Return { success, output, error, executionTime, timedOut }
  }

  async runTestCases(code: string, language: string, testCases: TestCase[]): Promise<SubmissionResultDto> {
    // Run each test case, compare output, compute score as % passed
  }
}
```

### 7.3 Updated Submission Flow

| Action | Current Flow | New Flow |
| --- | --- | --- |
| **"Run" button** | Client Web Worker executes JS against sample test cases | **Same** — keep client-side Web Worker for instant feedback |
| **"Submit" button** | Client Web Worker runs ALL test cases, client computes score, client POSTs score to API | Server receives code → Judge0 runs ALL test cases server-side → server computes score → server saves submission |

**Benefits:** Tamper-proof scoring, multi-language support (40+ languages), secure sandboxing.

### 7.4 Language Support Expansion

| Judge0 Language ID | Language | Notes |
| --- | --- | --- |
| 63 | JavaScript (Node.js) | Current default |
| 71 | Python 3 | New |
| 62 | Java | New |
| 54 | C++ (GCC) | New |
| 51 | C# (Mono) | New |

Update the frontend language selector dropdown and Monaco Editor language mode accordingly.

---

## 8. Phase 6 — Frontend (Vite/React → Next.js + Socket.IO Client)

### 8.1 Scaffold Next.js App

```bash
npx create-next-app@latest web --typescript --tailwind --app --src-dir
cd web
npm install axios socket.io-client @monaco-editor/react jwt-decode dayjs lucide-react
```

### 8.2 Copy Theme & Styling (Zero Changes)

- Copy `tailwind.config.js` — arena colors, fonts, shadows, animations.
- Copy `index.css` — `@font-face` for MK4, global styles, browser fixes.
- Copy `public/fonts/MK4.TTF`, `public/images/LandingPage.jpg`, `public/aba-favicon.svg`.

### 8.3 Port Route Structure

| Current (React Router) | New (Next.js App Router) |
| --- | --- |
| `/` → `LandingPage` | `app/page.tsx` |
| `/login` → `LoginPage` | `app/login/page.tsx` |
| `/register` → `RegisterPage` | `app/register/page.tsx` |
| `/student-dashboard` → `StudentDashboard` | `app/student-dashboard/page.tsx` |
| `/teacher` → `TeacherDashboard` | `app/teacher/page.tsx` |
| `/teacher-chat` → `TeacherChatPage` | `app/teacher-chat/page.tsx` |
| `/manage-students` → `ManageStudentsPage` | `app/manage-students/page.tsx` |
| `/host-battle` → `HostBattlePage` | `app/host-battle/page.tsx` |
| `/create-challenge` → `CreateChallengePage` | `app/create-challenge/page.tsx` |
| `/admin` → `AdminDashboard` | `app/admin/page.tsx` |
| `/lobby` → `LobbyPage` | `app/lobby/page.tsx` |
| `/lobby/:lobbyId` → `LobbyInstancePage` | `app/lobby/[lobbyId]/page.tsx` |
| `/match/:matchId` → `MatchPage` | `app/match/[matchId]/page.tsx` |
| `/leaderboard` → `LeaderboardPage` | `app/leaderboard/page.tsx` |

All protected pages wrapped in a client-side `AuthProvider` + `ProtectedRoute` layout.

### 8.4 Replace SignalR Client with Socket.IO Client

**`signalRService.js` → `lobbySocket.ts`:**

```typescript
import { io, Socket } from 'socket.io-client';

class LobbySocketService {
  private socket: Socket | null = null;

  start(token: string) {
    this.socket = io('/lobby', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
    });
  }

  joinLobby(lobbyId: string) { this.socket?.emit('JoinLobby', lobbyId); }
  leaveLobby(lobbyId: string) { this.socket?.emit('LeaveLobby', lobbyId); }

  onLobbyUpdated(cb: (lobby: Lobby) => void) {
    this.socket?.on('LobbyUpdated', cb);
    return () => this.socket?.off('LobbyUpdated', cb);
  }
  onMatchStarted(cb: (dto: MatchStartedDto) => void) { /* same pattern */ }
  onLobbyDeleted(cb: () => void) { /* same pattern */ }

  stop() { this.socket?.disconnect(); }
}
```

**`chatSignalR.js` → `chatSocket.ts`:**

```typescript
class ChatSocketService {
  private socket: Socket | null = null;

  start(token: string) {
    this.socket = io('/chat', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 2000,
    });
  }

  joinConversation(id: string) { this.socket?.emit('JoinConversation', id); }
  leaveConversation(id: string) { this.socket?.emit('LeaveConversation', id); }
  sendMessage(convId: string, content: string) {
    this.socket?.emit('SendMessage', { conversationId: convId, content });
  }

  onReceiveMessage(cb: (msg: MessageDto) => void) {
    this.socket?.on('NewMessage', cb);
    return () => this.socket?.off('NewMessage', cb);
  }
}
```

### 8.5 Port Components & Hooks to TypeScript

| JSX File(s) | TSX File(s) | Changes |
| --- | --- | --- |
| 24 components (`.jsx`) | 24 components (`.tsx`) | Add prop type interfaces, no logic changes |
| 14 pages (`.jsx`) | 14 pages (`.tsx`) | Add type annotations, `'use client'` directive |
| `useSignalR.jsx` | `useLobbySocket.ts` | Uses `lobbySocket.ts` instead of `signalRService` |
| `useChat.js` | `useChat.ts` | Uses `chatSocket.ts` instead of `chatSignalR` |
| `useToast.js` | `useToast.ts` | Add types only |

### 8.6 Monaco Editor in Next.js

```typescript
// Wrap in dynamic import to avoid SSR issues
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });
```

The `codeWorker.js` remains in `public/` — Web Workers work identically in Next.js.

---

## 9. Phase 7 — Infrastructure, CI/CD & Deployment

### 9.1 Docker Setup

**`api/Dockerfile`:**

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
EXPOSE 5000
CMD ["node", "dist/main.js"]
```

**`docker-compose.yml` (local development):**

```yaml
services:
  api:
    build: ./packages/api
    ports: ["5000:5000"]
    env_file: .env
    depends_on: [postgres, redis]

  postgres:
    image: postgres:16
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: algorithm_battle_arena
      POSTGRES_PASSWORD: dev
    volumes: ["pgdata:/var/lib/postgresql/data"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  judge0:
    image: judge0/judge0:latest
    ports: ["2358:2358"]
    depends_on: [redis, postgres]

volumes:
  pgdata:
```

### 9.2 CI/CD Pipeline

**`.github/workflows/ci.yml`:**

```yaml
name: CI/CD
on:
  push: { branches: [main, dev] }
  pull_request: { branches: [main] }

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: test, POSTGRES_DB: test }
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npm test -- --coverage
      - run: npm run lint

  deploy-backend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build & push Docker image
        run: |
          docker build -t gcr.io/$PROJECT_ID/aba-api ./packages/api
          docker push gcr.io/$PROJECT_ID/aba-api
      - name: Deploy to Cloud Run
        uses: google-github-actions/deploy-cloudrun@v2
        with:
          service: aba-api
          image: gcr.io/$PROJECT_ID/aba-api

  # Frontend auto-deploys via Vercel GitHub integration
```

### 9.3 Production Architecture

```
┌──────────────────────┐         ┌──────────────────────────┐
│  Vercel (Frontend)   │────────>│  Cloud Run (NestJS API)  │
│  Next.js SSR/static  │         │  + Socket.IO             │
│  auto-deploy on push │         │  Docker container         │
└──────────────────────┘         │       │        │         │
                                  │       ▼        ▼         │
                                  │  ┌────────┐ ┌──────┐    │
                                  │  │Postgres│ │Redis │    │
                                  │  │Supabase│ │Upstash│   │
                                  │  └────────┘ └──────┘    │
                                  └──────────────────────────┘
                                           │
                                  ┌────────▼────────┐
                                  │  Judge0 (Docker) │
                                  │  Code Execution  │
                                  └─────────────────┘
```

### 9.4 Port Tests

| Current | New | Count |
| --- | --- | --- |
| xUnit controller tests (11 files) | Jest + Supertest e2e tests | 11 test files |
| xUnit repository tests (12 files) | Jest unit tests with Prisma mocking | 12 test files |
| xUnit hub tests (2 files) | Jest + socket.io-client tests | 2 test files |
| xUnit middleware/helper/attribute tests (8 files) | Jest unit tests | 8 test files |
| Selenium UI tests (8 files) | Playwright specs | 8 test files |

---

## 10. New Repo Structure

```
algorithm-battle-arena/
├── .github/workflows/ci.yml
├── docker-compose.yml
├── .env.example
├── packages/
│   ├── api/                          # NestJS Backend
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── auth/                 # AuthController, AuthService, JwtStrategy, Guards
│   │   │   ├── problems/             # ProblemsController, ProblemRepoService
│   │   │   ├── lobbies/              # LobbiesController, LobbyRepoService
│   │   │   ├── matches/              # MatchesController, MatchRepoService
│   │   │   ├── submissions/          # SubmissionsController, SubmissionRepoService
│   │   │   ├── chat/                 # ChatController, ChatRepoService, ChatGateway
│   │   │   ├── friends/              # FriendsController, FriendsRepoService
│   │   │   ├── students/             # StudentsController, StudentRepoService
│   │   │   ├── teachers/             # TeachersController, TeacherRepoService
│   │   │   ├── statistics/           # StatisticsController, StatisticsRepoService
│   │   │   ├── admin/                # AdminController, AdminRepoService, ProblemImportService
│   │   │   ├── code-execution/       # CodeExecutionService (Judge0 client)
│   │   │   ├── micro-course/         # MicroCourseService (OpenAI integration)
│   │   │   ├── gateways/             # LobbyGateway, ChatGateway
│   │   │   ├── middleware/           # AuditLoggingMiddleware
│   │   │   ├── common/               # Guards, decorators, filters, PagedResult
│   │   │   └── prisma/               # PrismaService, PrismaModule
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── test/                     # Jest test files
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── web/                          # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/                  # App Router pages (14 routes)
│   │   │   ├── components/           # 24 reusable components
│   │   │   ├── hooks/                # useChat, useLobbySocket, useToast
│   │   │   ├── services/             # api.ts, auth.tsx, lobbySocket.ts, chatSocket.ts, ...
│   │   │   └── types/                # Shared TypeScript interfaces
│   │   ├── public/
│   │   │   ├── codeWorker.js
│   │   │   ├── fonts/MK4.TTF
│   │   │   └── images/
│   │   ├── tailwind.config.ts
│   │   ├── next.config.js
│   │   └── package.json
│   └── shared/                       # Shared TypeScript DTOs/types
│       └── src/dto/
├── scripts/
│   └── migrate-data.ts               # MSSQL → PostgreSQL migration script
└── Docs/
```

---

## 11. Risk Register & Mitigations

| Risk | Impact | Likelihood | Mitigation |
| --- | --- | --- | --- |
| **Password hash incompatibility** — Node's PBKDF2 produces different bytes than .NET | All existing users locked out | Medium | Write a unit test comparing output of both implementations against known input. The `PasswordKey + salt` concatenation must be byte-identical. |
| **MSSQL-specific SQL breaks on PostgreSQL** — complex queries, MERGE, stored procs | Repository layer fails | High | Translate each query individually. Run integration tests against PostgreSQL for every repository method. |
| **Socket.IO event contract mismatch** — different serialisation than SignalR | Real-time features break | Low | Keep event names identical (`LobbyUpdated`, `MatchStarted`, `NewMessage`). Test with old frontend against new backend. |
| **Judge0 latency** — server-side execution is slower than client-side Web Worker | Users perceive submit as slow | Medium | Keep client Web Worker for "Run" (instant). Judge0 "Submit" shows a loading spinner. Use async polling with WebSocket notification when complete. |
| **Supabase free tier limits** — 500 MB DB, 50k MAU | Outgrow free tier quickly | Low (MVP) | Monitor usage. Upgrade to Pro ($25/mo) when approaching limits. PostgreSQL schema is portable to any host. |
| **Redis not available on free tier** — some cloud providers charge for Redis | Can't run Socket.IO adapter | Low | Redis is optional for single-instance. Use Upstash (free tier: 10k commands/day) or skip adapter until multi-instance is needed. |

---

## 12. Estimated Timeline

| Phase | Duration | Milestone |
| --- | --- | --- |
| **Phase 1** — Database Migration | 1 week | PostgreSQL running with all 16 tables + migrated data |
| **Phase 2** — Auth & Middleware | 1.5 weeks | Login/register works, JWT identical, audit logging active |
| **Phase 3** — Repositories & Controllers | 3 weeks | All 55+ REST endpoints passing integration tests |
| **Phase 4** — Socket.IO Gateways | 1 week | Lobby + Chat real-time working with old frontend |
| **Phase 5** — Judge0 Integration | 1 week | Server-side code execution for Submit, multi-language support |
| **Phase 6** — Frontend Migration | 3 weeks | All 14 pages + 24 components ported to Next.js/TypeScript |
| **Phase 7** — Docker, CI/CD, Deploy | 1.5 weeks | Production deployment on Cloud Run + Vercel |
| **Testing & QA** | 1 week | Full regression, load testing, UAT |
| | **Total: ~14 weeks** | |

---

*This plan preserves all existing business rules, API contracts, and user data while migrating to a modern, scalable, production-ready architecture.*

