# Algorithm Battle Arena — Comprehensive Project Documentation

> **Purpose of this document:** This file describes every file, class, endpoint, component, database table, and architectural decision in the Algorithm Battle Arena project in enough detail for an AI or developer to recreate the entire application in a different tech stack (e.g., Java Spring Boot, Python Django, Go, etc.).

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack Summary](#2-tech-stack-summary)
3. [Repository Structure](#3-repository-structure)
4. [User Roles & Authentication Flow](#4-user-roles--authentication-flow)
5. [Database Schema](#5-database-schema)
6. [Backend — ASP.NET Core 8 Web API](#6-backend--aspnet-core-8-web-api)
   - 6.1 [Entry Point — Program.cs](#61-entry-point--programcs)
   - 6.2 [Configuration Files](#62-configuration-files)
   - 6.3 [Data Layer](#63-data-layer)
   - 6.4 [Models](#64-models)
   - 6.5 [DTOs (Data Transfer Objects)](#65-dtos-data-transfer-objects)
   - 6.6 [Repository Interfaces & Implementations](#66-repository-interfaces--implementations)
   - 6.7 [Controllers (REST API)](#67-controllers-rest-api)
   - 6.8 [SignalR Hubs (Real-Time)](#68-signalr-hubs-real-time)
   - 6.9 [Services](#69-services)
   - 6.10 [Helpers](#610-helpers)
   - 6.11 [Custom Authorization Attributes](#611-custom-authorization-attributes)
   - 6.12 [Middleware](#612-middleware)
   - 6.13 [Exceptions](#613-exceptions)
7. [Frontend — React 18 + Vite](#7-frontend--react-18--vite)
   - 7.1 [Build & Configuration](#71-build--configuration)
   - 7.2 [Entry Point & Routing](#72-entry-point--routing)
   - 7.3 [Services](#73-services)
   - 7.4 [Hooks](#74-hooks)
   - 7.5 [Components](#75-components)
   - 7.6 [Pages](#76-pages)
   - 7.7 [Public Assets](#77-public-assets)
   - 7.8 [Styling](#78-styling)
8. [Testing](#8-testing)
9. [CI/CD & Deployment](#9-cicd--deployment)
10. [Migration Guidance](#10-migration-guidance)

---

## 1. Project Overview

**Algorithm Battle Arena** is a **real-time competitive coding platform** where students compete head-to-head solving algorithm problems while live leaderboards update in real-time.

### Core Feature Areas

| Feature | Description |
|---|---|
| **Authentication & Profiles** | Separate registration for Students and Teachers. Admin login via environment credentials. JWT-based authentication with role claims. |
| **Problem Library (CRUD)** | Admin can create, update, and delete algorithm problems with test cases and solutions. Problems can be imported via JSON/CSV. |
| **Lobby System** | Students create/join lobbies with invite codes. Lobby host controls settings (privacy, difficulty, players). Real-time lobby state via SignalR. |
| **Real-Time Matches** | Host starts a match selecting problems and duration. All participants get problems simultaneously via SignalR broadcast. Countdown timer synchronized to server UTC. |
| **Code Execution** | Client-side JavaScript execution in a sandboxed Web Worker. Code is run against test cases with pass/fail scoring. |
| **Submissions** | Users submit code with scores. Submissions are recorded per match/problem/user. |
| **Leaderboards** | Per-match and global leaderboards computed from submission scores. |
| **Friends System** | Students can search, send/accept/reject friend requests, remove friends. |
| **Real-Time Chat** | SignalR-powered chat for friend conversations, lobby chat, and match chat. Conversation types: Friend, Lobby, Match, TeacherStudent. |
| **Teacher Dashboard** | Teachers manage student requests, view student analytics (submissions, scores, preferred language), and see dashboard stats. |
| **Admin Dashboard** | Admin can list/search/deactivate users, manage problems, and bulk-import problems from JSON/CSV files. |
| **AI Micro-Courses** | OpenAI GPT-4o-mini integration generates 3-4 step learning guides for problems (without revealing solutions). Local fallback when API key is missing. |
| **Audit Logging** | Middleware automatically logs all mutating admin requests to an AuditLog table with sanitized payloads. |
| **Student-Teacher Relationship** | Students request to join a teacher. Teachers accept/reject. Teachers view analytics for their students. |

---

## 2. Tech Stack Summary

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **ASP.NET Core** | 8.0 | Web API framework |
| **SignalR** | (built-in) | WebSocket-based real-time communication |
| **Dapper** | 2.1.66 | Primary data access (raw SQL) |
| **Entity Framework Core** | 9.0.8 | Secondary data context (used for model definitions, not primary queries) |
| **Microsoft.Data.SqlClient** | 6.1.1 | SQL Server connection driver |
| **JWT Bearer** | 8.0.0 | Authentication tokens |
| **CsvHelper** | 30.0.1 | CSV file parsing for problem import |
| **DotNetEnv** | 3.1.1 | `.env` file loading |
| **Swashbuckle** | 6.6.2 | Swagger/OpenAPI documentation |
| **AutoMapper** | 12.0.1 | Object mapping (referenced but Dapper handles most mapping) |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.2 | UI framework |
| **Vite** | 5.4 | Build tool and dev server |
| **React Router DOM** | 6.14 | Client-side routing |
| **Axios** | 1.11 | HTTP client |
| **@microsoft/signalr** | 7.0 | SignalR client for real-time features |
| **Monaco Editor** | 0.53 / @monaco-editor/react 4.7 | In-browser code editor |
| **TailwindCSS** | 3.4 | Utility-first CSS framework |
| **jwt-decode** | 3.1 | JWT token parsing on client |
| **dayjs** | 1.11 | Date/time formatting |
| **lucide-react** | 0.544 | Icon library |

### Database
| Technology | Purpose |
|---|---|
| **Microsoft SQL Server (MSSQL)** | Primary database. Schema: `AlgorithmBattleArinaSchema` |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Azure Web App** | Hosts the .NET backend API |
| **Azure Static Web Apps** | Hosts the React frontend |
| **GitHub Actions** | CI/CD pipelines |

### Testing
| Technology | Purpose |
|---|---|
| **xUnit** | Unit & integration tests for backend |
| **Selenium** | End-to-end UI tests |
| **Vitest** | Frontend unit tests |
| **MSW (Mock Service Worker)** | Frontend API mocking |

---

## 3. Repository Structure

```
algorithm-battle-arena-frontend/
├── .github/workflows/                  # CI/CD pipeline definitions
│   ├── dev_algorithmbattlearena.yml     # Backend build/test/deploy
│   └── azure-static-web-apps-*.yml     # Frontend build/deploy
├── AlgorithmBattleArena/               # ── BACKEND (.NET 8 Web API) ──
│   ├── Program.cs                      # Application entry point & DI config
│   ├── AlgorithmBattleArena.csproj     # NuGet dependencies
│   ├── AlgorithmBattleArena.sln        # Solution file
│   ├── .env.example                    # Environment variable template
│   ├── appsettings.json                # App configuration (production)
│   ├── appsettings.Development.json    # App configuration (development)
│   ├── DATABASE_AlgorithmBattleArina.sql # Full database DDL script
│   ├── Properties/
│   │   └── launchSettings.json         # Dev server launch profiles
│   ├── Attributes/                     # Custom authorization filter attributes
│   │   ├── AdminOnlyAttribute.cs
│   │   ├── StudentOnlyAttribute.cs
│   │   └── StudentOrAdminAttribute.cs
│   ├── Controllers/                    # REST API controllers (11 files)
│   │   ├── AdminController.cs
│   │   ├── AuthController.cs
│   │   ├── ChatController.cs
│   │   ├── FriendsController.cs
│   │   ├── LobbiesController.cs
│   │   ├── MatchesController.cs
│   │   ├── ProblemsController.cs
│   │   ├── StatisticsController.cs
│   │   ├── StudentsController.cs
│   │   ├── SubmissionsController.cs
│   │   └── TeachersController.cs
│   ├── Data/                           # Data access layer
│   │   ├── IDataContextDapper.cs       # Dapper interface
│   │   ├── DataContextDapper.cs        # Dapper implementation
│   │   └── DataContextEF.cs            # Entity Framework DbContext
│   ├── Dtos/                           # Data Transfer Objects (30 files)
│   ├── Exceptions/
│   │   └── ImportException.cs          # Custom exception for import validation
│   ├── Helpers/
│   │   ├── AuthHelper.cs              # JWT & password hashing
│   │   ├── ControllerHelper.cs        # Error handling utilities
│   │   └── PagedResult.cs             # Generic pagination wrapper
│   ├── Hubs/                           # SignalR real-time hubs
│   │   ├── MatchHub.cs                # Lobby/match real-time events
│   │   └── ChatHub.cs                 # Chat real-time messaging
│   ├── Middleware/
│   │   └── AuditLoggingMiddleware.cs  # Auto audit logging for admin ops
│   ├── Models/                         # Domain entity classes (18 files)
│   ├── Repository/                     # Repository pattern (12 interfaces + 12 implementations)
│   └── Services/                       # Business services
│       ├── IMicroCourseService.cs
│       ├── OpenAiMicroCourseService.cs
│       └── LocalMicroCourseService.cs
├── AlgorithmBattleArenaFrontend/       # ── FRONTEND (React 18 + Vite) ──
│   ├── package.json                    # NPM dependencies & scripts
│   ├── vite.config.js                  # Vite build config with proxy
│   ├── tailwind.config.js             # TailwindCSS theme customization
│   ├── postcss.config.js             # PostCSS plugins
│   ├── eslint.config.js              # ESLint config
│   ├── index.html                     # HTML entry point
│   ├── public/
│   │   ├── codeWorker.js             # Web Worker for sandboxed code execution
│   │   ├── aba-favicon.svg           # Favicon
│   │   ├── fonts/MK4.TTF            # Custom retro display font
│   │   └── images/LandingPage.jpg    # Landing page hero image
│   └── src/
│       ├── main.jsx                   # React DOM render entry
│       ├── App.jsx                    # Root component with routing
│       ├── App.css                    # Minimal root styles
│       ├── index.css                  # TailwindCSS imports & global styles
│       ├── services/                  # API & real-time service layer (7 files)
│       ├── hooks/                     # Custom React hooks (3 files)
│       ├── components/                # Reusable UI components (24 files)
│       └── pages/                     # Page-level components (14 files)
├── AlgorithmBattleArena.Tests/        # ── BACKEND TESTS (xUnit) ──
├── AlgorithmBattleArena.UiTests/      # ── UI TESTS (Selenium) ──
├── data/seeds/tests/                  # Test seed data (JSON fixtures)
├── Docs/                              # Project documentation
│   ├── api_reference.markdown
│   ├── cicd_pipeline_documentation.md
│   ├── deployment_guide.md
│   └── developerdocumentation.markdown
├── bug_report.md
├── generate_reports.py                # Script to generate test reports
├── sample-problems-no-slug.json       # Sample problem data
├── selenium_test_report.md
├── unit_test_report.md
└── README.md
```

---

## 4. User Roles & Authentication Flow

### Three User Roles

| Role | Description | How They Log In |
|---|---|---|
| **Student** | Primary user. Joins lobbies, solves problems, views leaderboards, manages friends, chats. | Registers via `/api/Auth/register/student`, logs in via `/api/Auth/login`. Receives JWT with `role=Student` and `studentId` claims. |
| **Teacher** | Manages students. Views student analytics, accepts/rejects student requests, hosts battles, chats with students. | Registers via `/api/Auth/register/teacher`, logs in via `/api/Auth/login`. Receives JWT with `role=Teacher` and `teacherId` claims. |
| **Admin** | System administrator. Manages all users (activate/deactivate), manages problems (CRUD, bulk import). | Logs in with hardcoded credentials from environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`). No registration endpoint. Receives JWT with `role=Admin`. |

### Authentication Flow

1. **Registration**: Client POSTs to `/api/Auth/register/student` or `/api/Auth/register/teacher` with email, password, first name, last name.
2. **Password Storage**: Server generates a random 16-byte salt, then computes PBKDF2-HMAC-SHA256 hash (100,000 iterations) using `password + PasswordKey + salt`. Both `PasswordHash` and `PasswordSalt` are stored in the `Auth` table.
3. **Login**: Client POSTs `{ email, password }` to `/api/Auth/login`.
   - Server first checks if credentials match the admin environment variables.
   - Otherwise, it retrieves the `Auth` record, verifies the password hash, determines role (Student/Teacher), checks if active, then returns a JWT.
4. **JWT Structure**: Signed with HMAC-SHA512. Claims include:
   - `email` (ClaimTypes.Email)
   - `role` (ClaimTypes.Role) — "Student", "Teacher", or "Admin"
   - `studentId` or `teacherId` — numeric user ID (only for Student/Teacher)
   - Expires in 24 hours.
5. **Token Refresh**: `GET /api/Auth/refresh/token` (authenticated) reads claims from the current valid token and issues a fresh one.
6. **SignalR Auth**: JWT is passed via `?access_token=<token>` query parameter for WebSocket connections. The server's `OnMessageReceived` event extracts the token for SignalR hub paths (`/lobbyHub`, `/matchhub`, `/chathub`).

### Frontend Token Storage

- Stored in `localStorage` under keys `access_token` and `jwt` (legacy compatibility).
- A custom `token-changed` event is dispatched when the token is set or cleared, so all same-tab listeners (AuthContext, API service) stay in sync.
- `jwt-decode` library parses the token client-side to extract `email` and `role` for routing decisions.

---

## 5. Database Schema

**Database**: `AlgorithmBattleArina` (note the typo — consistent throughout the project)  
**Schema**: `AlgorithmBattleArinaSchema`  
**Engine**: Microsoft SQL Server (MSSQL)

### 5.1 Entity-Relationship Overview

```
Auth (Email PK)
 ├── 1:1 ── Student (Email FK → Auth.Email, TeacherId FK → Teachers.TeacherId)
 └── 1:1 ── Teacher (Email FK → Auth.Email)
              └── 1:N ── Student (TeacherId FK)

Problems (ProblemId PK)
 ├── 1:N ── ProblemTestCases (ProblemId FK, CASCADE DELETE)
 ├── 1:N ── ProblemSolutions (ProblemId FK, CASCADE DELETE)
 └── N:M ── Matches (via MatchProblems join table)

Lobbies (LobbyId PK, HostEmail FK → Auth.Email)
 ├── 1:N ── LobbyParticipants (LobbyId FK, ParticipantEmail FK → Auth.Email)
 └── 1:N ── Matches (LobbyId FK, CASCADE DELETE)
              ├── 1:N ── MatchProblems (MatchId FK)
              └── 1:N ── Submissions (MatchId FK)

Submissions (SubmissionId PK)
 └── FK → Matches, Problems, Auth

Student ←→ Student (via Friends, FriendRequests)
Student ←→ Teacher (via StudentTeacherRequests)

Conversations (ConversationId PK, Type: Friend|Lobby|TeacherStudent|Match)
 ├── 1:N ── ConversationParticipants (ParticipantEmail FK → Auth.Email)
 └── 1:N ── Messages (SenderEmail FK → Auth.Email)

AuditLog (standalone, no FK constraints)
```

### 5.2 Table Definitions

#### `Auth`
| Column | Type | Constraints |
|---|---|---|
| Email | NVARCHAR(50) | **PRIMARY KEY** |
| PasswordHash | VARBINARY(MAX) | NOT NULL |
| PasswordSalt | VARBINARY(MAX) | NOT NULL |

#### `Teachers`
| Column | Type | Constraints |
|---|---|---|
| TeacherId | INT IDENTITY(1,1) | **PRIMARY KEY** |
| FirstName | NVARCHAR(50) | |
| LastName | NVARCHAR(50) | |
| Email | NVARCHAR(50) | UNIQUE, FK → Auth.Email |
| Active | BIT | |

#### `Student`
| Column | Type | Constraints |
|---|---|---|
| StudentId | INT IDENTITY(1,1) | **PRIMARY KEY** |
| FirstName | NVARCHAR(50) | |
| LastName | NVARCHAR(50) | |
| Email | NVARCHAR(50) | UNIQUE, FK → Auth.Email |
| TeacherId | INT | NULLABLE, FK → Teachers.TeacherId |
| Active | BIT | |

#### `Problems`
| Column | Type | Constraints |
|---|---|---|
| ProblemId | INT IDENTITY(1,1) | **PRIMARY KEY** |
| Title | NVARCHAR(255) | NOT NULL |
| Description | NVARCHAR(MAX) | NOT NULL |
| DifficultyLevel | NVARCHAR(50) | |
| Category | NVARCHAR(100) | |
| TimeLimit | INT | In milliseconds |
| MemoryLimit | INT | In MB |
| CreatedBy | NVARCHAR(100) | |
| Tags | NVARCHAR(MAX) | JSON string or comma-separated |
| CreatedAt | DATETIME | DEFAULT GETDATE() |

> **Note**: The `Problem` C# model also has `Slug`, `IsPublic`, `IsActive`, and `UpdatedAt` properties that may be added as columns in later migrations.

#### `ProblemTestCases`
| Column | Type | Constraints |
|---|---|---|
| TestCaseId | INT IDENTITY(1,1) | **PRIMARY KEY** |
| ProblemId | INT | NOT NULL, FK → Problems.ProblemId (CASCADE DELETE) |
| InputData | NVARCHAR(MAX) | |
| ExpectedOutput | NVARCHAR(MAX) | |
| IsSample | BIT | DEFAULT 0 (sample test cases are shown to users) |

#### `ProblemSolutions`
| Column | Type | Constraints |
|---|---|---|
| SolutionId | INT IDENTITY(1,1) | **PRIMARY KEY** |
| ProblemId | INT | NOT NULL, FK → Problems.ProblemId (CASCADE DELETE) |
| Language | NVARCHAR(50) | E.g., "JavaScript", "Python", "Java" |
| SolutionText | NVARCHAR(MAX) | |

#### `Lobbies`
| Column | Type | Constraints |
|---|---|---|
| LobbyId | INT IDENTITY(1,1) | **PRIMARY KEY** |
| LobbyCode | NVARCHAR(10) | NOT NULL, UNIQUE (6-char alphanumeric invite code) |
| HostEmail | NVARCHAR(50) | NOT NULL, FK → Auth.Email |
| LobbyName | NVARCHAR(100) | NOT NULL |
| IsPublic | BIT | NOT NULL, DEFAULT 1 |
| MaxPlayers | INT | NOT NULL, DEFAULT 10 |
| Mode | NVARCHAR(20) | CHECK IN ('1v1', 'Team', 'FreeForAll') |
| Difficulty | NVARCHAR(20) | CHECK IN ('Easy', 'Medium', 'Hard', 'Mixed') |
| Category | NVARCHAR(100) | NULLABLE |
| Status | NVARCHAR(20) | CHECK IN ('Open', 'InProgress', 'Closed'), DEFAULT 'Open' |
| CreatedAt | DATETIME2 | DEFAULT GETDATE() |
| StartedAt | DATETIME2 | NULLABLE |
| EndedAt | DATETIME2 | NULLABLE |

#### `LobbyParticipants`
| Column | Type | Constraints |
|---|---|---|
| LobbyParticipantId | INT IDENTITY(1,1) | **PRIMARY KEY** |
| LobbyId | INT | FK → Lobbies.LobbyId (CASCADE DELETE) |
| ParticipantEmail | NVARCHAR(50) | FK → Auth.Email (CASCADE DELETE) |
| Role | NVARCHAR(20) | CHECK IN ('Host', 'Player', 'Spectator'), DEFAULT 'Player' |
| JoinedAt | DATETIME2 | DEFAULT GETDATE() |
| | | UNIQUE(LobbyId, ParticipantEmail) |

#### `Matches`
| Column | Type | Constraints |
|---|---|---|
| MatchId | INT IDENTITY(1,1) | **PRIMARY KEY** |
| LobbyId | INT | NOT NULL, FK → Lobbies.LobbyId (CASCADE DELETE) |
| StartedAt | DATETIME2 | NOT NULL, DEFAULT GETDATE() |
| EndedAt | DATETIME2 | NULLABLE |

#### `MatchProblems`
| Column | Type | Constraints |
|---|---|---|
| MatchProblemId | INT IDENTITY(1,1) | **PRIMARY KEY** |
| MatchId | INT | NOT NULL, FK → Matches.MatchId (CASCADE DELETE) |
| ProblemId | INT | NOT NULL, FK → Problems.ProblemId (CASCADE DELETE) |

#### `Submissions`
| Column | Type | Constraints |
|---|---|---|
| SubmissionId | INT IDENTITY(1,1) | **PRIMARY KEY** |
| MatchId | INT | NOT NULL, FK → Matches.MatchId (NO ACTION) |
| ProblemId | INT | NOT NULL, FK → Problems.ProblemId |
| ParticipantEmail | NVARCHAR(50) | NOT NULL, FK → Auth.Email |
| Language | NVARCHAR(50) | NOT NULL |
| Code | NVARCHAR(MAX) | NOT NULL |
| Status | NVARCHAR(20) | NOT NULL, DEFAULT 'Submitted' |
| Score | INT | NULLABLE (0-100 percentage of test cases passed) |
| SubmittedAt | DATETIME2 | NOT NULL, DEFAULT GETDATE() |

#### `StudentTeacherRequests`
| Column | Type | Constraints |
|---|---|---|
| RequestId | INT IDENTITY(1,1) | **PRIMARY KEY** |
| StudentId | INT | NOT NULL, FK → Student.StudentId (CASCADE DELETE) |
| TeacherId | INT | NOT NULL, FK → Teachers.TeacherId (CASCADE DELETE) |
| Status | NVARCHAR(20) | CHECK IN ('Pending', 'Accepted', 'Rejected'), DEFAULT 'Pending' |
| RequestedAt | DATETIME2 | DEFAULT GETDATE() |
| | | UNIQUE(StudentId, TeacherId) |

#### `Friends`
| Column | Type | Constraints |
|---|---|---|
| FriendshipId | INT IDENTITY(1,1) | **PRIMARY KEY** |
| StudentId1 | INT | NOT NULL, FK → Student.StudentId |
| StudentId2 | INT | NOT NULL, FK → Student.StudentId |
| CreatedAt | DATETIME2 | DEFAULT GETDATE() |
| | | UNIQUE(StudentId1, StudentId2) |

#### `FriendRequests`
| Column | Type | Constraints |
|---|---|---|
| RequestId | INT IDENTITY(1,1) | **PRIMARY KEY** |
| SenderId | INT | NOT NULL, FK → Student.StudentId |
| ReceiverId | INT | NOT NULL, FK → Student.StudentId |
| Status | NVARCHAR(20) | CHECK IN ('Pending', 'Accepted', 'Rejected'), DEFAULT 'Pending' |
| RequestedAt | DATETIME2 | DEFAULT GETDATE() |
| RespondedAt | DATETIME2 | NULLABLE |
| | | UNIQUE(SenderId, ReceiverId) |

#### `Conversations`
| Column | Type | Constraints |
|---|---|---|
| ConversationId | INT IDENTITY(1,1) | **PRIMARY KEY** |
| Type | NVARCHAR(20) | CHECK IN ('Friend', 'Lobby', 'TeacherStudent', 'Match') |
| ReferenceId | INT | NULLABLE (LobbyId or MatchId for context-specific chats, NULL for friend chats) |
| CreatedAt | DATETIME2 | DEFAULT GETDATE() |
| UpdatedAt | DATETIME2 | DEFAULT GETDATE() |

#### `ConversationParticipants`
| Column | Type | Constraints |
|---|---|---|
| ConversationParticipantId | INT IDENTITY(1,1) | **PRIMARY KEY** |
| ConversationId | INT | NOT NULL, FK → Conversations (CASCADE DELETE) |
| ParticipantEmail | NVARCHAR(50) | NOT NULL, FK → Auth.Email |
| JoinedAt | DATETIME2 | DEFAULT GETDATE() |
| | | UNIQUE(ConversationId, ParticipantEmail) |

#### `Messages`
| Column | Type | Constraints |
|---|---|---|
| MessageId | INT IDENTITY(1,1) | **PRIMARY KEY** |
| ConversationId | INT | NOT NULL, FK → Conversations (CASCADE DELETE) |
| SenderEmail | NVARCHAR(50) | NOT NULL, FK → Auth.Email |
| Content | NVARCHAR(MAX) | NOT NULL |
| SentAt | DATETIME2 | DEFAULT GETDATE() |

#### `AuditLog`
| Column | Type | Constraints |
|---|---|---|
| AuditLogId | INT IDENTITY(1,1) | **PRIMARY KEY** |
| UserId | NVARCHAR(100) | Actor identifier (format: "Student:123", "Teacher:456", "Admin:email") |
| Action | NVARCHAR(100) | HTTP method (PUT, POST, DELETE) |
| EntityType | NVARCHAR(100) | Extracted from route path |
| EntityId | NVARCHAR(100) | Extracted from route path |
| BeforeState | NVARCHAR(MAX) | Empty string (not captured currently) |
| AfterState | NVARCHAR(MAX) | Sanitized JSON request body |
| CorrelationId | NVARCHAR(100) | Request correlation ID |
| Timestamp | DATETIME2 | DEFAULT GETDATE() |

### 5.3 Stored Procedures

#### `spUpsertProblem`
**Purpose**: Create or update a problem along with its test cases and solutions in a single transaction.

**Parameters**: `@Title`, `@Description`, `@DifficultyLevel`, `@Category`, `@TimeLimit`, `@MemoryLimit`, `@CreatedBy`, `@Tags`, `@TestCases` (JSON), `@Solutions` (JSON)

**Logic**:
1. Begin transaction.
2. If a problem with the same `Title` exists → UPDATE it; otherwise → INSERT and get new `ProblemId`.
3. MERGE `ProblemTestCases` — match on `ProblemId + InputData`; update existing or insert new.
4. MERGE `ProblemSolutions` — match on `ProblemId + Language`; update existing or insert new.
5. Commit transaction.
6. Return the `ProblemId`.

---

## 6. Backend — ASP.NET Core 8 Web API

### 6.1 Entry Point — Program.cs

**File**: `AlgorithmBattleArena/Program.cs` (181 lines)

**Responsibilities**:
1. **Load `.env`** file via `DotNetEnv.Env.Load()`.
2. **Register services** (DI container):
   - All 12 repository interfaces → their implementations (scoped lifetime).
   - `AuthHelper` as singleton.
   - `IMicroCourseService` → `OpenAiMicroCourseService` (scoped).
   - `IHttpClientFactory` for OpenAI HTTP calls.
3. **Configure JWT authentication**:
   - Reads `TOKEN_KEY` from env vars or `appsettings.json`.
   - Validates `IssuerSigningKey` with HMAC-SHA symmetric key.
   - No issuer/audience validation.
   - `ClockSkew = TimeSpan.Zero` (no tolerance).
   - Custom `OnMessageReceived` event extracts `access_token` from query string for SignalR hub paths.
4. **Configure CORS**:
   - `DevCors` policy: allows `localhost:5173`, `:4200`, `:3000`, `:8000` with credentials.
   - `ProdCors` policy: allows the Azure Static Web App origin.
5. **Middleware pipeline** (order matters):
   - CORS (first, before auth)
   - Swagger (dev only)
   - HTTPS redirection (prod only)
   - Authentication
   - Audit Logging (custom middleware)
   - Authorization
6. **Map endpoints**:
   - `app.MapControllers()` — REST API
   - `app.MapHub<MatchHub>("/lobbyHub")` — lobby/match real-time events
   - `app.MapHub<ChatHub>("/chathub")` — chat real-time messaging

### 6.2 Configuration Files

#### `.env.example`
```
DEFAULT_CONNECTION=Server=your_server;Database=your_database;User Id=your_user;Password=your_password;
TOKEN_KEY=your_jwt_secret_key_here
PASSWORD_KEY=your_password_encryption_key_here
ADMIN_EMAIL=your_admin_email@example.com
ADMIN_PASSWORD=your_admin_password
OPENAI_API_KEY=your_openai_api_key_here
```

#### `appsettings.json` / `appsettings.Development.json`
```json
{
  "ConnectionStrings": { "DefaultConnection": "" },
  "AppSettings": {
    "TokenKey": "",
    "PasswordKey": "",
    "AdminEmail": "",
    "AdminPassword": ""
  }
}
```
> Environment variables take priority over appsettings values. The code reads `Environment.GetEnvironmentVariable("X")` first, falling back to `Configuration`.

#### `launchSettings.json`
- Default dev URL: `http://localhost:5000`
- HTTPS URL: `https://localhost:7295`
- Swagger launches by default in development.

### 6.3 Data Layer

#### `IDataContextDapper` (Interface)
Defines both sync and async methods for raw SQL execution via Dapper:

| Method | Description |
|---|---|
| `LoadDataAsync<T>(sql, params)` | Execute query, return `IEnumerable<T>` |
| `LoadDataSingleAsync<T>(sql, params)` | Execute query, return exactly one `T` |
| `LoadDataSingleOrDefaultAsync<T>(sql, params)` | Execute query, return `T?` |
| `ExecuteSqlAsync(sql, params)` | Execute non-query, return `bool` (rows affected > 0) |
| `LoadData<T>`, `LoadDataSingle<T>`, `LoadDataSingleOrDefault<T>` | Sync equivalents |
| `ExecuteSql(sql, params)` | Sync non-query |
| `ExecuteSqlWithRowCount(sql, params)` | Returns `int` row count |
| `ExecuteTransaction(commands)` | Execute multiple SQL commands in a single transaction |
| `CreateConnection()` | Returns a new `IDbConnection` (for manual Dapper usage) |

#### `DataContextDapper` (Implementation)
- Creates `SqlConnection` using `DEFAULT_CONNECTION` env var or `ConnectionStrings:DefaultConnection`.
- Each method opens a fresh connection (using `using` pattern).
- `ExecuteTransaction` opens one connection, begins a transaction, executes all commands, commits or rolls back.

#### `DataContextEF` (Entity Framework DbContext)
- Configures EF Core with SQL Server and retry-on-failure.
- **DbSets**: `Student`, `Teachers`, `Auth`, `AuditLogs`, `Problems`, `ProblemTestCases`.
- **Schema**: All tables mapped to `AlgorithmBattleArinaSchema`.
- **Relationships**: Auth ↔ Student (1:1 via Email), Auth ↔ Teacher (1:1 via Email), Student → Teacher (N:1), ProblemTestCase → Problem (N:1 CASCADE).
- **Note**: The application primarily uses Dapper for data access. EF is available but secondary.

### 6.4 Models

All models are in namespace `AlgorithmBattleArena.Models`.

| Model | Key Properties | DB Table | Notes |
|---|---|---|---|
| **Auth** | `Email` (PK), `PasswordHash` (byte[]), `PasswordSalt` (byte[]) | Auth | Navigation props: `Student?`, `Teacher?` |
| **Student** | `StudentId` (PK), `FirstName`, `LastName`, `Email`, `TeacherId?`, `Active` | Student | FK to Auth via Email, FK to Teacher. Computed: `FullName`. |
| **Teacher** | `TeacherId` (PK), `FirstName`, `LastName`, `Email`, `Active` | Teachers | FK to Auth via Email. Navigation: `Students` collection. Computed: `FullName`. |
| **Problem** | `ProblemId` (PK), `Slug`, `Title`, `Description`, `DifficultyLevel`, `Category`, `TimeLimit`, `MemoryLimit`, `CreatedBy`, `Tags`, `IsPublic`, `IsActive`, `CreatedAt`, `UpdatedAt` | Problems | Navigation: `TestCases` collection. `Difficulty` is alias for `DifficultyLevel`. |
| **ProblemTestCase** | `TestCaseId` (PK), `ProblemId` (FK), `InputData`, `ExpectedOutput`, `IsSample` | ProblemTestCases | `Input` is alias for `InputData`. Navigation: `Problem?`. |
| **ProblemSolution** | `SolutionId` (PK), `ProblemId` (FK), `Language`, `SolutionText`, `CreatedAt`, `UpdatedAt` | ProblemSolutions | Navigation: `Problem?`. |
| **Lobby** | `LobbyId` (PK), `LobbyCode`, `HostEmail`, `LobbyName`, `IsPublic`, `MaxPlayers`, `Mode`, `Difficulty`, `Category`, `Status`, `CreatedAt`, `StartedAt`, `EndedAt` | Lobbies | Navigation: `Participants` list. |
| **LobbyParticipant** | `LobbyParticipantId` (PK), `LobbyId`, `ParticipantEmail`, `Role`, `JoinedAt` | LobbyParticipants | |
| **Match** | `MatchId` (PK), `LobbyId`, `StartedAt`, `EndedAt` | Matches | |
| **MatchProblem** | `MatchProblemId` (PK), `MatchId`, `ProblemId` | MatchProblems | Join table. |
| **Submission** | `SubmissionId` (PK), `MatchId`, `ProblemId`, `ParticipantEmail`, `Language`, `Code`, `Status`, `Score`, `SubmittedAt` | Submissions | |
| **StartMatchRequest** | `ProblemIds` (List\<int\>), `DurationSec`, `PreparationBufferSec` (default 5) | — | Request body model (not persisted). |
| **Friend** | `FriendshipId` (PK), `StudentId1` (FK), `StudentId2` (FK), `CreatedAt` | Friends | |
| **FriendRequest** | `RequestId` (PK), `SenderId` (FK), `ReceiverId` (FK), `Status`, `RequestedAt`, `RespondedAt` | FriendRequests | |
| **Conversation** | `ConversationId` (PK), `Type`, `ReferenceId?`, `CreatedAt`, `UpdatedAt` | Conversations | Navigation: `Participants`, `Messages`. |
| **ConversationParticipant** | `ConversationParticipantId` (PK), `ConversationId` (FK), `ParticipantEmail`, `JoinedAt` | ConversationParticipants | |
| **Message** | `MessageId` (PK), `ConversationId` (FK), `SenderEmail`, `Content`, `SentAt` | Messages | |
| **AuditLog** | `Id` (PK), `ActorUserId`, `ActorEmail`, `Action`, `ResourceType`, `ResourceId`, `Details`, `TimestampUtc`, `SourceIp`, `Route`, `CorrelationId` | AuditLog | |

### 6.5 DTOs (Data Transfer Objects)

All DTOs are in namespace `AlgorithmBattleArena.Dtos`.

#### Authentication DTOs

| DTO | Purpose | Key Fields |
|---|---|---|
| `UserForLoginDto` | Login request | `Email` [Required, EmailAddress], `Password` [Required] |
| `UserForLoginConfirmationDto` | Internal — holds hash/salt from DB | `PasswordHash` (byte[]), `PasswordSalt` (byte[]) |
| `StudentForRegistrationDto` | Student registration request | `Email`, `Password`, `PasswordConfirm`, `FirstName`, `LastName`, `TeacherId?`, `Role` (default "Student") |
| `TeacherForRegistrationDto` | Teacher registration request | `Email`, `Password`, `PasswordConfirm`, `FirstName`, `LastName`, `Role` (default "Teacher") |

#### Problem DTOs

| DTO | Purpose | Key Fields |
|---|---|---|
| `ProblemUpsertDto` | Create/update problem | `Title`, `Description`, `DifficultyLevel`, `Category`, `TimeLimit`, `MemoryLimit`, `CreatedBy`, `Tags` (JSON string), `TestCases` (JSON string), `Solutions` (JSON string) |
| `ProblemResponseDto` | Full problem detail response | All problem fields + `TestCases` (list), `Solutions` (list) |
| `ProblemListDto` | Paginated list item | `ProblemId`, `Title`, `DifficultyLevel`, `Category`, `CreatedBy`, `CreatedAt` |
| `ProblemFilterDto` | Query parameters for listing | `Category?`, `DifficultyLevel?`, `SearchTerm?`, `Page` (default 1), `PageSize` (default 10) |
| `ProblemGenerationDto` | Generate random problems for match | `Language`, `Difficulty`, `MaxProblems` |
| `TestCaseDto` | Individual test case | `InputData`, `ExpectedOutput`, `IsSample` |
| `SolutionDto` | Individual solution | `Language`, `SolutionText` |

#### Import DTOs

| DTO | Purpose | Key Fields |
|---|---|---|
| `ImportedProblemDto` | One problem in a bulk import | Same fields as `ProblemUpsertDto` but with `TestCases[]` and `Solutions[]` as typed arrays |
| `ImportTestCaseDto` | Test case within import | `InputData`, `ExpectedOutput`, `IsSample` |
| `ImportSolutionDto` | Solution within import | `Language`, `SolutionText` |
| `ImportErrorDto` | Validation error | `Row`, `Field`, `Message` |
| `ImportResultDto` | Import operation result | `Ok`, `Inserted`, `Slugs[]`, `Errors[]` |

#### Lobby & Match DTOs

| DTO | Purpose | Key Fields |
|---|---|---|
| `LobbyCreateDto` | Create lobby request | `Name`, `MaxPlayers` (default 10), `Mode` (default "1v1"), `Difficulty` (default "Medium") |
| `LobbyDto` | Basic lobby info | `Id`, `Name`, `MemberCount`, `IsActive` |
| `UpdatePrivacyDto` | Toggle lobby visibility | `IsPublic` (bool) |
| `UpdateDifficultyDto` | Change lobby difficulty | `Difficulty` (string) |
| `MatchStartedDto` | SignalR broadcast when match starts | `MatchId`, `ProblemIds[]`, `StartAtUtc`, `DurationSec`, `SentAtUtc` |

#### Submission DTOs

| DTO | Purpose | Key Fields |
|---|---|---|
| `SubmissionDto` | Submit code | `MatchId`, `ProblemId`, `Language`, `Code`, `Score?`, `Status` |
| `SubmissionResultDto` | Detailed result | `SubmissionId`, `Score`, `Status`, `PassedCount`, `TotalCount`, `TestCaseResults[]`, `SubmittedAt` |
| `TestCaseResultDto` | Per-test-case result | `TestCaseIndex`, `Passed`, `ExpectedOutput`, `ActualOutput`, `ExecutionTime`, `Error?` |

#### Statistics & Leaderboard DTOs

| DTO | Purpose | Key Fields |
|---|---|---|
| `UserStatisticsDto` | User's personal stats | `Email`, `FullName`, `Rank`, `MatchesPlayed`, `WinRate`, `ProblemsCompleted`, `TotalScore`, `LastActivity` |
| `LeaderboardEntryDto` | One row in leaderboard | `Rank`, `ParticipantEmail`, `FullName`, `TotalScore`, `ProblemsCompleted`, `MatchesPlayed`, `WinRate`, `LastSubmission` |

#### Student/Teacher DTOs

| DTO | Purpose | Key Fields |
|---|---|---|
| `StudentRequestDto` | Student-teacher request | `RequestId`, `StudentId`, `FirstName`, `LastName`, `Email`, `Username` |
| `TeacherDto` | Teacher list item | `TeacherId`, `FirstName`, `LastName`, `Email`, computed `FullName` |
| `StudentAnalyticsDto` | Detailed student performance | `StudentId`, `StudentName`, `Email`, `TotalSubmissions`, `SuccessfulSubmissions`, `SuccessRate`, `ProblemsAttempted`, `ProblemsSolved`, `MatchesParticipated`, `AverageScore`, `PreferredLanguage`, `LastActivity` |
| `SubmissionHistoryDto` | Student's submission record | `SubmissionId`, `ProblemTitle`, `Language`, `Status`, `Score`, `SubmittedAt`, `DifficultyLevel` |
| `TeacherDashboardStatsDto` | Teacher dashboard summary | `TotalStudents`, `ActiveStudents`, `TotalSubmissions`, `OverallSuccessRate`, `TopPerformers[]` |

#### Friend DTOs

| DTO | Purpose | Key Fields |
|---|---|---|
| `FriendDto` | Friend list item | `StudentId`, `FullName`, `Email`, `IsOnline`, `FriendsSince` |
| `FriendRequestDto` | Friend request detail | `RequestId`, `SenderId`, `ReceiverId`, `SenderName`, `SenderEmail`, `ReceiverName`, `ReceiverEmail`, `Status`, `RequestedAt` |
| `SendFriendRequestDto` | Send request body | `ReceiverId` |

#### Chat DTOs

| DTO | Purpose | Key Fields |
|---|---|---|
| `ConversationDto` | Conversation summary | `ConversationId`, `Type`, `ReferenceId?`, `CreatedAt`, `UpdatedAt`, `Participants[]` (emails), `LastMessage?` |
| `MessageDto` | Single message | `MessageId`, `ConversationId`, `SenderEmail`, `SenderName`, `Content`, `SentAt` |
| `SendMessageDto` | Send message request | `Content` |
| `CreateConversationDto` | Create conversation request | `Type`, `ReferenceId?`, `ParticipantEmails[]` |
| `CreateFriendConversationDto` | Create friend chat | `FriendId`, `FriendEmail` |

#### Admin DTOs

| DTO | Purpose | Key Fields |
|---|---|---|
| `AdminUserDto` | User in admin list | `Id` (prefixed: "Student:123" or "Teacher:456"), `Name`, `Email`, `Role`, `IsActive`, `CreatedAt` |
| `UserToggleDto` | Activate/deactivate user | `Deactivate` (bool) |

#### AI Micro-Course DTOs

| DTO | Purpose | Key Fields |
|---|---|---|
| `MicroCourseRequestDto` | Request micro-course | `TimeLimitSeconds?`, `RemainingSec?`, `Language` |
| `MicroCourseResponseDto` | Micro-course result | `MicroCourseId`, `Summary`, `Steps[]`, `Disclaimer` |
| `MicroCourseStepDto` | One learning step | `Title`, `DurationSec`, `Content`, `Example`, `Resources[]` |

### 6.6 Repository Interfaces & Implementations

The project uses the **Repository Pattern** with Dapper for all data access. Each interface has a corresponding implementation class that injects `IDataContextDapper` and executes raw SQL.

#### `IAuthRepository` / `AuthRepository`
| Method | SQL Pattern |
|---|---|
| `RegisterStudent(dto)` | Transaction: INSERT into Auth (email, hash, salt), then INSERT into Student |
| `RegisterTeacher(dto)` | Transaction: INSERT into Auth, then INSERT into Teachers |
| `GetAuthByEmail(email)` | SELECT from Auth WHERE Email = @email |
| `GetStudentByEmail(email)` | SELECT from Student WHERE Email = @email |
| `GetTeacherByEmail(email)` | SELECT from Teachers WHERE Email = @email |
| `UserExists(email)` | SELECT COUNT from Auth WHERE Email = @email |
| `GetUserRole(email)` | Check Student table first, then Teachers table, return "Student"/"Teacher"/"Unknown" |

#### `ILobbyRepository` / `LobbyRepository`
| Method | Description |
|---|---|
| `CreateLobby(...)` | INSERT into Lobbies + INSERT into LobbyParticipants (host as 'Host' role) |
| `JoinLobby(lobbyId, email)` | Check capacity, check lobby status is 'Open', INSERT into LobbyParticipants |
| `LeaveLobby(lobbyId, email)` | DELETE from LobbyParticipants |
| `KickParticipant(lobbyId, hostEmail, email)` | Verify host, DELETE participant |
| `CloseLobby(lobbyId, hostEmail)` | Verify host, UPDATE Status = 'Closed' |
| `UpdateLobbyStatus/Privacy/Difficulty(...)` | UPDATE Lobbies SET ... |
| `DeleteLobby(lobbyId)` | DELETE from Lobbies (cascades to participants) |
| `GetOpenLobbies()` | SELECT from Lobbies WHERE Status = 'Open' AND IsPublic = 1, include participants via multi-query |
| `GetLobbyById/ByCode(...)` | SELECT with JOIN to LobbyParticipants |
| `IsHost(lobbyId, email)` | SELECT from LobbyParticipants WHERE Role = 'Host' AND email match |

#### `IMatchRepository` / `MatchRepository`
| Method | Description |
|---|---|
| `CreateMatch(lobbyId, problemIds)` | INSERT into Matches, then INSERT into MatchProblems for each problemId |
| `GetMatchLeaderboard(matchId)` | Aggregate query: SUM scores, COUNT problems per participant for one match |
| `GetGlobalLeaderboard()` | Aggregate query: SUM scores, COUNT matches across all matches, with ranking |

#### `IProblemRepository` / `ProblemRepository`
| Method | Description |
|---|---|
| `UpsertProblem(dto)` | Calls stored procedure `spUpsertProblem` |
| `GetProblems(filter)` | Dynamic SQL with optional WHERE clauses for category, difficulty, search term. Returns `PagedResult<ProblemListDto>`. |
| `GetProblem(id)` | SELECT problem + test cases + solutions by ProblemId (multi-query or separate queries) |
| `DeleteProblem(id)` | DELETE from Problems WHERE ProblemId = @id (cascades) |
| `GetCategories()` | SELECT DISTINCT Category FROM Problems |
| `GetDifficultyLevels()` | SELECT DISTINCT DifficultyLevel FROM Problems |
| `GetRandomProblems(language, difficulty, max)` | SELECT problems filtered by difficulty, with solution in specified language, ORDER BY NEWID() (random), TOP @max |
| `ImportProblemsAsync(problems)` | Bulk insert problems |
| `SlugExistsAsync(slug)` | Check if slug already exists |

#### `ISubmissionRepository` / `SubmissionRepository`
| Method | Description |
|---|---|
| `CreateSubmission(submission)` | INSERT into Submissions, returns SubmissionId |
| `GetSubmissionsByMatchAndUser(matchId, email)` | SELECT from Submissions WHERE MatchId AND ParticipantEmail |

#### `IStudentRepository` / `StudentRepository`
| Method | Description |
|---|---|
| `CreateRequest(studentId, teacherId)` | INSERT into StudentTeacherRequests |
| `AcceptRequest(requestId, teacherId)` | UPDATE Status = 'Accepted', UPDATE Student SET TeacherId |
| `RejectRequest(requestId, teacherId)` | UPDATE Status = 'Rejected' |
| `GetStudentsByStatus(teacherId, status)` | SELECT students by request status for a teacher |
| `GetAcceptedTeachers(studentId)` | SELECT teachers with accepted requests for a student |
| `GetStudentAnalytics(teacherId, studentId)` | Complex aggregation: submissions, success rate, problems attempted/solved, preferred language |
| `GetStudentSubmissionHistory(teacherId, studentId)` | SELECT submissions with problem titles for a student |
| `GetTeacherDashboardStats(teacherId)` | Aggregate: total students, active students, total submissions, overall success rate, top performers |

#### `ITeacherRepository` / `TeacherRepository`
| Method | Description |
|---|---|
| `GetTeachers()` | SELECT all active teachers |
| `ExistsAsync(teacherId)` | Check if teacher exists by ID |

#### `IStatisticsRepository` / `StatisticsRepository`
| Method | Description |
|---|---|
| `GetUserStatistics(email)` | Aggregate: rank, matches played, win rate, problems completed, total score for one user |
| `GetLeaderboard()` | Global ranked list of all users by total score |

#### `IFriendsRepository` / `FriendsRepository`
| Method | Description |
|---|---|
| `GetFriendsAsync(studentId)` | SELECT friends for a student (join Friends + Student tables) |
| `SearchStudentsAsync(query, currentId)` | Search students by name/email, excluding current user and existing friends |
| `SendFriendRequestAsync(senderId, receiverId)` | INSERT into FriendRequests |
| `GetReceivedRequestsAsync(studentId)` | SELECT pending requests where ReceiverId = studentId |
| `GetSentRequestsAsync(studentId)` | SELECT requests where SenderId = studentId |
| `GetFriendRequestAsync(requestId)` | SELECT single request by ID |
| `AcceptFriendRequestAsync(requestId, studentId)` | UPDATE request Status = 'Accepted', INSERT into Friends |
| `RejectFriendRequestAsync(requestId, studentId)` | UPDATE request Status = 'Rejected' |
| `RemoveFriendAsync(studentId, friendId)` | DELETE from Friends |
| `GetFriendRequestEmailsAsync(requestId)` | Get sender and receiver emails for a request |

#### `IChatRepository` / `ChatRepository`
| Method | Description |
|---|---|
| `CreateConversationAsync(type, refId, emails)` | INSERT into Conversations + INSERT into ConversationParticipants for each email. For Lobby/Match types, if conversation with same ReferenceId exists, adds new participants instead. |
| `AddParticipantsToConversationAsync(convId, emails)` | INSERT participants (idempotent — ignores duplicates) |
| `GetConversationsAsync(userEmail)` | SELECT conversations for a user with last message preview |
| `GetConversationAsync(convId)` | SELECT single conversation with participants |
| `SendMessageAsync(convId, senderEmail, content)` | INSERT into Messages, UPDATE Conversations.UpdatedAt |
| `GetMessagesAsync(convId, pageSize, offset)` | SELECT messages with pagination (newest first in DB, reversed on client) |
| `IsParticipantAsync(convId, email)` | Check if user is a participant |
| `GetFriendConversationAsync(email1, email2)` | Find existing Friend conversation between two users |
| `GetLobbyConversationAsync(lobbyId)` | Find Lobby conversation by ReferenceId |
| `GetMatchConversationAsync(matchId)` | Find Match conversation by ReferenceId |

#### `IAdminRepository` / `AdminRepository`
| Method | Description |
|---|---|
| `GetUsersAsync(q, role, page, pageSize)` | SELECT from Student UNION SELECT from Teachers, with optional search/role filter, paginated. Returns `PagedResult<AdminUserDto>`. ID is prefixed (e.g., "Student:123"). |
| `ToggleUserActiveAsync(id, deactivate)` | Parse prefixed ID, UPDATE Student or Teachers SET Active = !deactivate |

#### `IProblemImportRepository` / `ProblemImportRepository`
| Method | Description |
|---|---|
| `ImportProblemsAsync(problems)` | Validate each problem, generate slugs, call UpsertProblem for each valid one. Throws `ImportException` if any validation errors. |
| `ValidateAsync(problem, row)` | Validate required fields, check title length, difficulty values, time/memory limits, test case and solution structure. Returns list of `ImportErrorDto`. |

### 6.7 Controllers (REST API)

All controllers use `[ApiController]` and `[Route("api/[controller]")]`. Most require `[Authorize]` (JWT). Custom attributes add role restrictions.

---

#### `AuthController` — `/api/Auth`

| Method | Route | Auth | Request Body / Params | Response | Description |
|---|---|---|---|---|---|
| POST | `/register/student` | `[AllowAnonymous]` | `StudentForRegistrationDto` | `{ message }` | Register a new student |
| POST | `/register/teacher` | `[AllowAnonymous]` | `TeacherForRegistrationDto` | `{ message }` | Register a new teacher |
| POST | `/login` | `[AllowAnonymous]` | `UserForLoginDto` | `{ token, role, email }` | Authenticate user (admin, student, or teacher) |
| GET | `/refresh/token` | `[Authorize]` | — | `{ token, role, email }` | Issue a fresh JWT |
| GET | `/profile` | `[Authorize]` | — | `{ id, firstName, lastName, fullName, email, role, active, teacherId? }` | Get current user's profile |

---

#### `ProblemsController` — `/api/Problems`

| Method | Route | Auth | Request / Params | Response | Description |
|---|---|---|---|---|---|
| POST | `/UpsertProblem` | `[AdminOnly]` | `ProblemUpsertDto` | `{ Message, ProblemId }` | Create or update a problem (calls stored proc) |
| POST | `/{id}/microcourse` | `[AllowAnonymous]` | `MicroCourseRequestDto` | Micro-course JSON | Generate AI learning guide for a problem |
| GET | `/` | `[Authorize]` | Query: `ProblemFilterDto` | `{ problems[], page, pageSize, total }` | List problems (paginated, filterable) |
| GET | `/{id}` | `[StudentOrAdmin]` | — | `ProblemResponseDto` | Get problem detail with test cases & solutions |
| DELETE | `/{id}` | `[AdminOnly]` | — | `{ message }` | Delete a problem |
| GET | `/categories` | `[StudentOrAdmin]` | — | `string[]` | List distinct categories |
| GET | `/difficulty-levels` | `[StudentOrAdmin]` | — | `string[]` | List distinct difficulty levels |
| POST | `/generate` | `[Authorize]` | `ProblemGenerationDto` | `Problem[]` | Get random problems for a match (by language, difficulty, count) |
| GET | `/debug/javascript-count` | `[Authorize]` | — | `{ count, problems[] }` | Debug endpoint — count JS problems |

---

#### `LobbiesController` — `/api/Lobbies`

| Method | Route | Auth | Request / Params | Response | Description |
|---|---|---|---|---|---|
| GET | `/` | `[StudentOrAdmin]` | — | `Lobby[]` | List all open public lobbies |
| GET | `/{lobbyId}` | `[StudentOrAdmin]` | — | `Lobby` | Get lobby by ID (with participants) |
| POST | `/` | `[StudentOrAdmin]` | `LobbyCreateDto` | `Lobby` (201 Created) | Create a new lobby. Generates 6-char code. Auto-creates lobby chat conversation. |
| POST | `/{lobbyCode}/join` | `[StudentOrAdmin]` | — | `Lobby` | Join a lobby by invite code. Adds user to conversation. Broadcasts `LobbyUpdated` via SignalR. |
| POST | `/{lobbyId}/leave` | `[StudentOrAdmin]` | — | `{ message }` | Leave a lobby. Broadcasts `LobbyUpdated`. |
| POST | `/{lobbyId}/close` | `[StudentOrAdmin]` | — | `{ message }` | Host closes lobby. Broadcasts `LobbyUpdated`. |
| DELETE | `/{lobbyId}/participants/{email}` | `[StudentOrAdmin]` | — | `{ message }` | Host kicks a participant. Broadcasts `LobbyUpdated`. |
| PUT | `/{lobbyId}/privacy` | `[StudentOrAdmin]` | `UpdatePrivacyDto` | `{ message }` | Toggle lobby public/private. Broadcasts `LobbyUpdated`. |
| PUT | `/{lobbyId}/difficulty` | `[StudentOrAdmin]` | `UpdateDifficultyDto` | `{ message }` | Change lobby difficulty. Broadcasts `LobbyUpdated`. |
| DELETE | `/{lobbyId}` | `[StudentOrAdmin]` | — | `{ message }` | Host deletes lobby. Broadcasts `LobbyDeleted`. |

> **Lobby Code Generation**: Random 6-character alphanumeric string from `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`.

---

#### `MatchesController` — `/api/Matches`

| Method | Route | Auth | Request / Params | Response | Description |
|---|---|---|---|---|---|
| POST | `/{lobbyId}/start` | `[StudentOrAdmin]` | `StartMatchRequest` | `MatchStartedDto` | Host starts a match. Creates match record, creates match chat, broadcasts `MatchStarted` to lobby group via SignalR, sets lobby status to 'InProgress'. `StartAtUtc` = now + `PreparationBufferSec`. |
| GET | `/{matchId}/leaderboard` | `[Authorize]` | — | `LeaderboardEntryDto[]` | Get leaderboard for a specific match |
| GET | `/leaderboard/global` | `[Authorize]` | — | `LeaderboardEntryDto[]` | Get global leaderboard across all matches |

---

#### `SubmissionsController` — `/api/Submissions`

| Method | Route | Auth | Request / Params | Response | Description |
|---|---|---|---|---|---|
| POST | `/` | `[Authorize]` | `SubmissionDto` | `{ SubmissionId }` | Record a code submission with score |
| GET | `/match/{matchId}/user` | `[Authorize]` | — | `Submission[]` | Get current user's submissions for a match |

---

#### `ChatController` — `/api/Chat`

| Method | Route | Auth | Request / Params | Response | Description |
|---|---|---|---|---|---|
| GET | `/conversations` | `[Authorize]` | — | `ConversationDto[]` | Get all conversations for current user |
| GET | `/conversations/{convId}/messages` | `[Authorize]` | Query: `pageSize`, `offset` | `MessageDto[]` | Get messages for a conversation (paginated) |
| POST | `/conversations/{convId}/messages` | `[Authorize]` | `SendMessageDto` | `{ MessageId }` | Send a message. Broadcasts `NewMessage` via ChatHub SignalR. |
| POST | `/conversations/friend` | `[Authorize]` | `CreateFriendConversationDto` | `ConversationDto` | Create or get existing friend/teacher-student conversation. Students can only chat with friends or teachers. Teachers can chat with any student. |

---

#### `FriendsController` — `/api/Friends`

| Method | Route | Auth | Request / Params | Response | Description |
|---|---|---|---|---|---|
| GET | `/` | `[StudentOnly]` | — | `FriendDto[]` | Get current student's friends list |
| GET | `/search?query=` | `[StudentOnly]` | Query: `query` | `FriendDto[]` | Search students by name/email |
| POST | `/request` | `[StudentOnly]` | `SendFriendRequestDto` | `{ RequestId, Message }` | Send a friend request |
| GET | `/requests/received` | `[StudentOnly]` | — | `FriendRequestDto[]` | Get pending received requests |
| GET | `/requests/sent` | `[StudentOnly]` | — | `FriendRequestDto[]` | Get sent requests |
| PUT | `/requests/{requestId}/accept` | `[StudentOnly]` | — | `{ Message }` | Accept a friend request. Also creates a Friend chat conversation. |
| PUT | `/requests/{requestId}/reject` | `[StudentOnly]` | — | `{ Message }` | Reject a friend request |
| DELETE | `/{friendId}` | `[StudentOnly]` | — | `{ Message }` | Remove a friend |

---

#### `StudentsController` — `/api/Students`

| Method | Route | Auth | Request / Params | Response | Description |
|---|---|---|---|---|---|
| POST | `/request` | `[Authorize]` (Student) | `int teacherId` (body) | `{ RequestId }` | Student requests to join a teacher |
| PUT | `/{requestId}/accept` | `[Authorize]` (Teacher) | — | 200 OK | Teacher accepts student request |
| PUT | `/{requestId}/reject` | `[Authorize]` (Teacher) | — | 200 OK | Teacher rejects student request |
| GET | `/?status=` | `[Authorize]` (Teacher) | Query: `status` | `StudentRequestDto[]` | Teacher gets students by request status (Pending/Accepted/Rejected) |
| GET | `/teachers` | `[Authorize]` (Student) | — | `TeacherDto[]` | Student gets list of their accepted teachers |
| GET | `/{studentId}/analytics` | `[Authorize]` (Teacher) | — | `StudentAnalyticsDto` | Teacher views detailed analytics for one student |
| GET | `/{studentId}/submissions` | `[Authorize]` (Teacher) | — | `SubmissionHistoryDto[]` | Teacher views a student's submission history |
| GET | `/dashboard-stats` | `[Authorize]` (Teacher) | — | `TeacherDashboardStatsDto` | Teacher dashboard summary stats |

---

#### `TeachersController` — `/api/Teachers`

| Method | Route | Auth | Request / Params | Response | Description |
|---|---|---|---|---|---|
| GET | `/` | `[Authorize]` | — | `Teacher[]` | List all active teachers (used by students during registration/search) |

---

#### `StatisticsController` — `/api/Statistics`

| Method | Route | Auth | Request / Params | Response | Description |
|---|---|---|---|---|---|
| GET | `/user` | `[StudentOrAdmin]` | — | `UserStatisticsDto` | Get current user's statistics |
| GET | `/leaderboard` | `[StudentOrAdmin]` | — | `LeaderboardEntryDto[]` | Get global leaderboard |

---

#### `AdminController` — `/api/Admin`

| Method | Route | Auth | Request / Params | Response | Description |
|---|---|---|---|---|---|
| GET | `/users` | `[AdminOnly]` | Query: `q`, `role`, `page`, `pageSize` | `PagedResult<AdminUserDto>` | Search/list all users with pagination |
| PUT | `/users/{id}/deactivate` | `[AdminOnly]` | `UserToggleDto` | `AdminUserDto` | Activate or deactivate a user |
| POST | `/problems/import` | `[AdminOnly]` | JSON body or multipart file (JSON/CSV, max 10MB, max 1000 rows) | `ImportResultDto` | Bulk import problems. Validates all rows; if any errors, throws `ImportException`. |

### 6.8 SignalR Hubs (Real-Time)

#### `MatchHub` — mapped to `/lobbyHub`

**Authorization**: `[Authorize]` (JWT required)

| Hub Method | Parameters | Description |
|---|---|---|
| `JoinLobby(lobbyId)` | string lobbyId | Add connection to SignalR group named `{lobbyId}`. Broadcasts `LobbyUpdated` with fresh lobby data. |
| `LeaveLobby(lobbyId)` | string lobbyId | Remove connection from group. Broadcasts `LobbyUpdated`. |

**Server-to-Client Events** (broadcast by controllers and hub):

| Event | Payload | Trigger |
|---|---|---|
| `LobbyUpdated` | `Lobby` object (with participants) | Any lobby state change (join, leave, kick, settings change, close) |
| `MatchStarted` | `MatchStartedDto` | Host starts a match via `MatchesController` |
| `LobbyDeleted` | (none) | Host deletes a lobby |

#### `ChatHub` — mapped to `/chathub`

**Authorization**: `[Authorize]` (JWT required)  
**Transport**: WebSockets only (with `skipNegotiation: true` on client)

| Hub Method | Parameters | Description |
|---|---|---|
| `JoinConversation(conversationId)` | string conversationId | Verify user is a participant, add connection to group `conversation_{convId}`. |
| `LeaveConversation(conversationId)` | string conversationId | Remove connection from group. |
| `SendMessage(conversationId, content)` | string conversationId, string content | Verify participant, save message to DB, broadcast `NewMessage` to group. |

**Server-to-Client Events**:

| Event | Payload | Trigger |
|---|---|---|
| `NewMessage` | `MessageDto` | Message sent via hub or via `ChatController.SendMessage` REST endpoint |

> **Note**: Messages can be sent via BOTH the SignalR hub (`ChatHub.SendMessage`) and the REST API (`POST /api/Chat/conversations/{id}/messages`). Both paths save to DB and broadcast via SignalR.

### 6.9 Services

#### `IMicroCourseService` (Interface)
```csharp
Task<object?> GenerateMicroCourseAsync(int problemId, MicroCourseRequestDto request, string userId);
```

#### `OpenAiMicroCourseService` (Primary Implementation)
- **Dependency**: `IProblemRepository`, `IHttpClientFactory`, `ILogger`
- **API Key**: Read from `OPENAI_API_KEY` environment variable.
- **Model**: `gpt-4o-mini`
- **Max Tokens**: 800
- **System Prompt**: "You are a concise tutor. Return ONLY valid JSON with fields: summary, steps, disclaimer. Steps is array of objects with: title, durationSec, content, example, resources. Keep content brief. Do NOT include solution code."
- **User Prompt**: Includes problem title, description, language, time limits.
- **Response Parsing**: Strips markdown code fences, extracts first JSON object, deserializes.
- **Error Handling**: Returns null on failure (graceful degradation).

#### `LocalMicroCourseService` (Fallback)
- Returns a hardcoded 3-step learning guide (understand the core idea, sketch small examples, choose a strategy).
- Used when OpenAI API key is not configured.

### 6.10 Helpers

#### `AuthHelper`
**Scope**: Singleton (injected everywhere)

| Method | Description |
|---|---|
| `GetPasswordSalt()` | Generate 16-byte cryptographic random salt |
| `GetPasswordHash(password, salt)` | PBKDF2-HMAC-SHA256, 100K iterations, 32-byte output. Combined salt = `PasswordKey` bytes + random salt. |
| `VerifyPasswordHash(password, storedHash, storedSalt)` | Recompute hash and compare byte-by-byte |
| `CreateToken(email, role, userId?)` | Create JWT with email, role, and role-specific ID claims. Signs with HMAC-SHA512. 24-hour expiry. |
| `ValidateToken(token)` | Validate JWT and return `ClaimsPrincipal` or null |
| `GetEmailFromClaims(user)` | Extract email from multiple possible claim types |
| `GetRoleFromClaims(user)` | Extract role from multiple possible claim types |
| `GetUserIdFromClaims(user, role)` | Extract `studentId` or `teacherId` claim as `int?` |
| `ValidateAdminCredentials(email, password)` | Compare against `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars |

#### `ControllerHelper`
**Scope**: Static utility class

| Method | Description |
|---|---|
| `HandleError(ex, message, logger)` | Log error and return 500 with details |
| `SafeExecute(action, errorMessage, logger)` | Try/catch wrapper for sync controller actions |
| `SafeExecuteAsync(action, errorMessage, logger)` | Try/catch wrapper for async controller actions |
| `IsValidJson(jsonString)` | Parse test via `JsonDocument.Parse` |
| `ValidateJson<T>(json, predicate, logger)` | Deserialize JSON array and validate each item |

#### `PagedResult<T>`
Generic wrapper: `Items` (IEnumerable<T>), `Total` (int).

### 6.11 Custom Authorization Attributes

All three are `IAuthorizationFilter` implementations that check the JWT `role` claim.

| Attribute | Allowed Roles | HTTP Result on Failure |
|---|---|---|
| `[AdminOnly]` | Admin | 401 if not authenticated, 403 if wrong role |
| `[StudentOnly]` | Student | 401 if not authenticated, 403 if wrong role |
| `[StudentOrAdmin]` | Student, Admin | 401 if not authenticated, 403 if wrong role |

**Implementation pattern**: Read `ClaimTypes.Role` or fallback to `"role"` claim. Compare against allowed value(s).

### 6.12 Middleware

#### `AuditLoggingMiddleware`
**Registered via**: `app.UseAuditLogging()` extension method.

**Behavior**:
1. Generates or reads `X-Correlation-Id` header, stores in `HttpContext.Items`.
2. Checks if request should be audited: only `PUT`, `POST`, `DELETE` methods on paths containing `/admin` or `/users/`.
3. If auditing:
   - Reads and sanitizes request body (redacts fields containing "password", "pass", "token", "secret").
   - Extracts actor user ID (format: "Student:123", "Teacher:456", "Admin:email").
   - Extracts resource type and ID from URL path segments.
   - Inserts audit log record into `AlgorithmBattleArinaSchema.AuditLog` table.
4. Calls `next(context)` to continue the pipeline.

### 6.13 Exceptions

#### `ImportException`
- Extends `Exception`.
- Contains `List<ImportErrorDto> Errors`.
- Thrown by `ProblemImportRepository` when validation fails.
- Caught by `AdminController.ImportProblems` and returned as 400 Bad Request with error details.

---

## 7. Frontend — React 18 + Vite

### 7.1 Build & Configuration

#### `package.json`
- **Runtime dependencies**: React 18, React Router DOM 6, Axios, @microsoft/signalr 7, @monaco-editor/react 4.7, dayjs, jwt-decode, lucide-react.
- **Dev dependencies**: Vite 5, TailwindCSS 3.4, PostCSS, Autoprefixer, ESLint, Vitest, @testing-library/react, MSW.
- **Scripts**: `dev` (Vite dev server), `build` (Vite build), `test` (Vitest), `lint` (ESLint), `preview` (Vite preview).
- **Node**: >=18.0.0

#### `vite.config.js`
- Plugin: `@vitejs/plugin-react`
- **Dev proxy**: `/api` → `http://localhost:5000`, `/hubs` → `http://localhost:5000` (with WebSocket support)
- **Path alias**: `@` → `./src`

#### `tailwind.config.js`
Custom theme extends TailwindCSS with:
- **Custom colors**: `arena-gold` (#ffed4e), `arena-orange` (#ff6b00), `arena-pink` (#ff3366), `arena-crimson` (#6B0F1A), and panel/input semi-transparent backgrounds.
- **Custom fonts**: `arena` (MK4 retro display font), `mono` (Courier New).
- **Custom shadows**: Orange glow, gold glow, crimson glow, green glow, pink glow.
- **Custom animations**: `fade-in`, `fade-out`.

#### `postcss.config.js`
Standard TailwindCSS + Autoprefixer PostCSS config.

#### `index.html`
Root HTML with `<div id="root">`. Loads `src/main.jsx` via Vite.

### 7.2 Entry Point & Routing

#### `main.jsx`
Wraps `<App />` in `<StrictMode>` and `<BrowserRouter>`.

#### `App.jsx`
Provider hierarchy (outer → inner):
1. `<ErrorBoundary>` — catches React render errors
2. `<AuthProvider>` — provides auth context (token, user, login, logout)
3. `<ToastProvider>` — provides toast notification context
4. `<SignalRProvider>` — auto-connects lobby SignalR when token is available

**Route Table**:

| Path | Component | Auth | Allowed Roles |
|---|---|---|---|
| `/` | `LandingPage` | Public | — |
| `/login` | `LoginPage` | Public | — |
| `/register` | `RegisterPage` | Public | — |
| `/student-dashboard` | `StudentDashboard` | Protected | Student |
| `/leaderboard` | `LeaderboardPage` | Protected | Any authenticated |
| `/teacher` | `TeacherDashboard` | Protected | Teacher |
| `/teacher-chat` | `TeacherChatPage` | Protected | Teacher |
| `/manage-students` | `ManageStudentsPage` | Protected | Teacher |
| `/host-battle` | `HostBattlePage` | Protected | Teacher |
| `/create-challenge` | `CreateChallengePage` | Protected | Teacher |
| `/admin` | `AdminDashboard` | Protected | Admin |
| `/lobby` | `LobbyPage` | Protected | Any authenticated |
| `/lobby/:lobbyId` | `LobbyInstancePage` | Protected | Any authenticated |
| `/match/:matchId` | `MatchPage` | Protected | Any authenticated |

### 7.3 Services

#### `api.js` — Centralized API Client
- Uses **Axios** with automatic base URL detection:
  - `localhost` → `http://localhost:5000`
  - Production → Azure backend URL
- Singleton `ApiService` class with method groups mirroring backend controllers:

| Group | Methods |
|---|---|
| `auth` | `login`, `registerStudent`, `registerTeacher`, `refreshToken`, `getProfile` |
| `matches` | `start`, `getLeaderboard`, `getGlobalLeaderboard` |
| `problems` | `getAll`, `getById`, `create`, `generate`, `getMicroCourse`, `update`, `delete` |
| `submissions` | `create`, `getUserSubmissions` |
| `students` | `getByStatus`, `acceptRequest`, `rejectRequest`, `requestTeacher`, `getAcceptedTeachers`, `getAnalytics`, `getSubmissionHistory`, `getDashboardStats` |
| `teachers` | `getAll` |
| `statistics` | `getLeaderboard`, `getUserStatistics` |
| `lobbies` | `getAll`, `getById`, `create`, `join`, `leave`, `close`, `kickParticipant`, `updatePrivacy`, `updateDifficulty`, `delete` |
| `friends` | `getFriends`, `searchStudents`, `sendFriendRequest`, `getReceivedRequests`, `getSentRequests`, `acceptFriendRequest`, `rejectFriendRequest`, `removeFriend` |
| `admin` | `getUsers`, `toggleUserActive`, `importProblems` |
| `chat` | `getConversations`, `getMessages`, `createConversation`, `sendMessage`, `createFriendConversation` |

#### `auth.jsx` — Authentication Context & Provider
- **AuthContext** provides: `token`, `user` (decoded JWT), `login(email, password)`, `logout()`.
- `login` calls API, stores token, parses JWT with `jwt-decode`, returns role for navigation.
- `logout` clears token, resets state, navigates to `/login`.
- Listens for `token-changed` and `storage` events (cross-tab sync).

#### `tokenStorage.js` — Token Persistence
- `setToken(token)` — stores in `localStorage` under `access_token` and `jwt` keys, dispatches `token-changed` event.
- `getToken()` — reads from `access_token` || `jwt` || null.
- `clearToken()` — removes both keys, dispatches event.

#### `signalRService.js` — Lobby/Match SignalR Client
- Singleton class managing one `HubConnection` to `/lobbyHub`.
- **Connection**: Uses `accessTokenFactory` for JWT. Automatic reconnect.
- **Hub Methods**: `joinLobby(id)`, `leaveLobby(id)`.
- **Callback Registration**: `onLobbyUpdated(cb)`, `onMatchStarted(cb)`, `onLobbyDeleted(cb)` — returns unsubscribe function.

#### `chatSignalR.js` — Chat SignalR Client
- Singleton class managing one `HubConnection` to `/chathub`.
- **Transport**: WebSockets only with `skipNegotiation: true`.
- **Automatic Reconnect**: [0, 2000, 10000, 30000] ms intervals.
- **Hub Methods**: `joinConversation(id)`, `leaveConversation(id)`, `sendMessage(convId, content)`.
- **Callback**: `onReceiveMessage(cb)` — returns unsubscribe function. Handles `NewMessage` server events.

#### `signalrClient.js` — Alternative Match Hub Builder
- Factory function `createMatchHubConnection({ baseUrl, getToken })` for creating a match-specific hub connection.
- Provides typed helpers: `onMatchStarted`, `onLobbyMemberJoined`, `onLobbyMemberLeft`.

#### `codeExecutor.js` — Client-Side Code Execution
- **Architecture**: Spawns a disposable **Web Worker** (`/codeWorker.js`) per execution.
- `executeCode(code, input, timeoutMs)` — posts code to worker, resolves with `{ success, output, error, executionTime, timedOut }`.
- `runTestCases(code, testCases)` — runs all test cases sequentially, compares output to expected, computes score as percentage.
- **Default timeout**: 5 seconds per test case.
- **Sandbox**: Worker's `new Function()` runs user code with fake console, shadowed globals (`self`, `fetch`, `XMLHttpRequest`, `WebSocket` = undefined), and a `readLine()` function for input simulation.

### 7.4 Hooks

#### `useSignalR.jsx` — SignalR Provider & Hook
- `SignalRProvider` starts `signalRService` when `token` becomes available, stops on cleanup.
- `useSignalR()` returns the `signalRService` singleton.

#### `useChat.js` — Chat State Management
- Manages: `conversations`, `messages` (keyed by conversationId), `activeConversation`, `loading`.
- **On mount**: Starts chatSignalR if disconnected, loads all conversations.
- **Methods**: `sendMessage(convId, content)`, `joinConversation(convId)` (loads messages), `leaveConversation(convId)`, `loadConversations()`, `createFriendConversation(friendId, email)`.
- **Real-time**: Subscribes to `chatSignalR.onReceiveMessage` — appends new messages to the correct conversation.

#### `useToast.js` — Toast Notifications
- `ToastContext` provides `success(msg)`, `error(msg)`, `info(msg)`, `warning(msg)` methods.
- Fallback to `console.log` if used outside provider.

### 7.5 Components

| Component | Purpose |
|---|---|
| **`ProtectedRoute`** | HOC that checks `token` and `user.role` against `allowedRoles`. Redirects to `/login` or role-specific dashboard. |
| **`ErrorBoundary`** | React error boundary — catches render errors and shows fallback UI. |
| **`ArenaPageLayout`** | Common page layout wrapper with arena-themed styling (dark gradient background, header, footer). |
| **`Toast` / `ToastProvider`** | Toast notification system. Provider wraps app, manages toast state, renders floating notifications. |
| **`ConfirmationDialog`** | Generic modal dialog for confirming destructive actions. |
| **`ArenaConfirmDialog`** | Arena-themed confirmation dialog (styled variant). |
| **`CreateLobbyModal`** | Modal form for creating a new lobby (name, max players, mode, difficulty). |
| **`ProblemBrowserModal`** | Modal for browsing and selecting problems. Used by lobby host when starting a match. Supports pagination, filtering by category/difficulty. |
| **`ResultsModal`** | Modal displaying match results — per-test-case pass/fail, score, expected vs actual output. |
| **`AdminUsersPanel`** | Admin sub-component for managing users — search, filter by role, activate/deactivate. |
| **`AdminProblemsPanel`** | Admin sub-component for managing problems — CRUD, bulk JSON/CSV import with drag-and-drop. |
| **`StudentAnalyticsPanel`** | Teacher sub-component showing detailed student analytics — submissions, success rate, preferred language, submission history table. |
| **`ContactsSection`** | Student dashboard sidebar — shows friends list, pending friend requests, search for students. Allows starting chat from friend list. |
| **`TeacherContactsSection`** | Teacher variant of contacts — shows accepted students as contacts for chat. |
| **`ConversationList`** | Lists all conversations with last message preview. Click to open chat. |
| **`MessageList`** | Renders a scrollable list of messages in a conversation. Auto-scrolls to bottom on new messages. |
| **`MessageInput`** | Text input + send button for composing messages. |
| **`ChatWindow`** | Full chat window component — conversation list + message area. Used as overlay/panel. |
| **`InlineChatWindow`** | Inline chat variant embedded within lobby/match pages. |
| **`LobbyChatSidebar`** | Chat sidebar specific to lobby context. |
| **`MatchChatPanel`** | Chat panel specific to match context. |
| **`ChatButton`** | Floating button to toggle chat window visibility. |
| **`ChatIcon`** | Small chat icon component. |
| **`ChatDebug`** | Debug component showing SignalR connection state (dev only). |

### 7.6 Pages

#### `LandingPage`
- Public homepage with hero image, feature highlights, and CTA buttons to login/register.
- Arena-themed dark design with gradient backgrounds.

#### `LoginPage`
- Email + password form. On success, navigates to role-specific dashboard:
  - Student → `/student-dashboard`
  - Teacher → `/teacher`
  - Admin → `/admin`

#### `RegisterPage`
- Dual-mode registration form (Student or Teacher toggle).
- Student form: first name, last name, email, password, confirm password, optional teacher selection.
- Teacher form: first name, last name, email, password, confirm password.
- Fetches teacher list for the student teacher-selection dropdown.

#### `StudentDashboard`
- **Stats section**: Rank, matches played, win rate, problems completed, total score (from `/api/statistics/user`).
- **Quick actions**: Join Lobby, View Leaderboard, Find Teachers.
- **Friends section**: Friends list with online status, remove friend, start chat. Friend request management (received/sent). Student search for adding friends.
- **Teacher management**: Request to join a teacher, view accepted teachers.
- **Chat**: Floating chat button opens ChatWindow overlay.

#### `TeacherDashboard`
- **Dashboard stats**: Total students, active students, total submissions, overall success rate (from `/api/Students/dashboard-stats`).
- **Student management links**: View pending/accepted student requests.
- **Quick actions**: Manage Students, Host Battle, Create Challenge, Teacher Chat.
- **Top performers**: List of top students with analytics.

#### `TeacherChatPage`
- Full-page chat interface for teachers.
- Left sidebar: list of accepted students as contacts.
- Main area: conversation view with message history.
- Uses `useChat` hook and `chatSignalR` service.

#### `AdminDashboard`
- **Tabs**: Overview, Manage Users, Manage Problems.
- **Overview**: System stats summary.
- **Manage Users tab**: Renders `AdminUsersPanel` — search, filter by role, paginated user list, activate/deactivate toggle.
- **Manage Problems tab**: Renders `AdminProblemsPanel` — problem list, create/edit/delete, bulk import (JSON/CSV file upload).

#### `ManageStudentsPage`
- Teacher page for managing student requests and viewing student analytics.
- **Tabs**: Pending Requests, Accepted Students, Rejected Requests.
- Click on an accepted student opens `StudentAnalyticsPanel` with detailed performance data.

#### `HostBattlePage`
- Teacher page for creating lobby-based battles.
- Similar to `LobbyPage` but teacher-oriented.

#### `CreateChallengePage`
- Teacher page for creating custom coding challenges/problems.
- Form for problem creation with test cases and solutions.

#### `LobbyPage`
- Lists all open public lobbies.
- "Create Lobby" button opens `CreateLobbyModal`.
- "Join by Code" input field for private lobbies.
- Each lobby card shows: name, host, player count, mode, difficulty, status.
- Click lobby card → navigate to `/lobby/{lobbyId}`.

#### `LobbyInstancePage`
- **Most complex page** — real-time lobby experience.
- **State**: Lobby data (refreshed via SignalR `LobbyUpdated` events), selected problems, match settings.
- **Features for Host**:
  - Settings panel: toggle public/private, change difficulty, kick players.
  - Problem selection: opens `ProblemBrowserModal` to pick problems for the match.
  - Start Match: sends `POST /api/Matches/{lobbyId}/start` with selected problem IDs and duration.
  - Delete Lobby.
- **Features for All**:
  - Player list with host crown icon.
  - Copy lobby invite code.
  - Leave lobby.
  - Lobby chat sidebar.
- **Match Start Flow**: When `MatchStarted` SignalR event is received, navigates to `/match/{matchId}` with match data in `location.state`.
- **Real-time updates**: Joins SignalR group on mount, leaves on unmount. Handles `LobbyUpdated`, `MatchStarted`, `LobbyDeleted` events.

#### `MatchPage`
- **Most feature-rich page** — the competitive coding experience.
- **Layout**: Two-panel — left (problem list + details) and right (code editor + controls).
- **Monaco Editor**: Full-featured code editor (@monaco-editor/react). Language: JavaScript.
- **Countdown Timer**: Computed from `match.startAtUtc + match.durationSec`. Displays `MM:SS` format. When time expires, auto-submits current code.
- **Problem Navigation**: Left sidebar lists problems. Click to expand description and test cases. Sample test cases shown; hidden test cases hidden.
- **Code Execution**: "Run" button executes code against sample test cases using `codeExecutor` (Web Worker). Shows per-test-case results inline (pass/fail, expected vs actual).
- **Submission**: "Submit" button executes code against ALL test cases, computes score (% passed), records via `POST /api/Submissions`. Shows `ResultsModal` with detailed results.
- **Score Tracking**: Per-problem scores displayed. Submission count per problem shown.
- **AI Micro-Course**: "Get Help" button requests a micro-course from `/api/Problems/{id}/microcourse`. Displays learning steps in a panel. Rate-limited to one request per problem per 30 seconds.
- **Chat**: Inline match chat panel using `InlineChatWindow` + `useChat`.
- **Exit**: "Exit Match" with confirmation dialog. Navigates back to lobby.
- **Auto-Submit on Timeout**: When countdown reaches zero, automatically submits code for the active problem with current score.

#### `LeaderboardPage`
- Displays global leaderboard from `/api/statistics/leaderboard`.
- Table columns: Rank, Name, Email, Total Score, Matches Played, Win Rate, Problems Completed.
- Arena-themed styling with gold/orange accents.

### 7.7 Public Assets

| File | Purpose |
|---|---|
| `codeWorker.js` | Web Worker script that executes user JavaScript in a sandboxed environment. Uses `new Function()` with shadowed dangerous globals (`self`, `fetch`, `XMLHttpRequest`, `WebSocket`, `importScripts` all set to `undefined`). Captures `console.log` output. Simulates stdin via `readLine()` function from newline-split input. Returns `{ success, output, error, executionTime, timedOut }`. |
| `fonts/MK4.TTF` | Custom "MK4" retro/fighting-game-style display font used for headings and branding. |
| `images/LandingPage.jpg` | Hero image for the landing page. |
| `aba-favicon.svg` | SVG favicon for the application. |
| `vite.svg` | Default Vite logo (unused). |

### 7.8 Styling

#### Design System
The application uses a **dark, arena/fighting-game inspired theme**:
- **Background**: Dark gradients (`gray-900` → `red-900` → `black`).
- **Primary accent**: Orange (#ff6b00) for borders, buttons, and glows.
- **Secondary accent**: Gold (#ffed4e) for highlights, stats, and important text.
- **Tertiary accent**: Pink (#ff3366) for destructive actions and alerts.
- **Crimson**: (#6B0F1A) for admin elements and deep accents.
- **Panels**: Semi-transparent dark backgrounds (`rgba(20, 20, 20, 0.85)`) with colored borders.
- **Typography**: MK4 font for headings (fighting-game aesthetic), Courier New for monospace/code, system-ui for body text.
- **Shadows**: Colored glows (orange, gold, crimson, green, pink) using box-shadow.

#### CSS Architecture
- **TailwindCSS**: Primary styling via utility classes.
- **`index.css`**: Imports Tailwind layers, declares `@font-face` for MK4 font, sets dark color scheme, browser compatibility fixes.
- **`App.css`**: Minimal — only ensures `#root` takes full width/height.
- **Inline styles**: Some components use inline `style={}` for arena-specific custom values.

---

## 8. Testing

### 8.1 Backend Tests — `AlgorithmBattleArena.Tests` (xUnit)

**Framework**: xUnit with `InternalsVisibleTo` access to main project.

**Test files (comprehensive coverage)**:

| Test File | Tests |
|---|---|
| `Controllers.AuthControllerTests.cs` | Register student/teacher, login, refresh token, profile |
| `Controllers.ChatControllerTests.cs` | Get conversations, send message, create friend conversation |
| `Controllers.FriendsControllerTests.cs` | Get friends, send/accept/reject requests, remove friend, search |
| `Controllers.LobbiesControllerTests.cs` | Create, join, leave, close, kick, update settings, delete |
| `Controllers.MatchesControllerTests.cs` | Start match, get leaderboard |
| `Controllers.ProblemsControllerTests.cs` | CRUD, generate, micro-course |
| `Controllers.StatisticsControllerTests.cs` | User stats, leaderboard |
| `Controllers.StudentsControllerTests.cs` | Student-teacher request flow |
| `Controllers.SubmissionsControllerTests.cs` | Create submission, get user submissions |
| `Controllers.TeachersControllerTests.cs` | Get teachers list |
| `AdminControllerTests.cs` | User management, problem import |
| `Repositories.*.Tests.cs` | Each repository has corresponding tests (12 files) |
| `Hubs.ChatHubTests.cs` | Chat hub join/leave/send |
| `Hubs.MatchHubTests.cs` | Match hub join/leave |
| `Middleware.AuditLoggingMiddlewareTests.cs` | Audit logging behavior |
| `Attributes.*Tests.cs` | Authorization attribute tests (3 files) |
| `AuthHelperTest.cs` | JWT creation, password hashing, validation |
| `Helpers.ControllerHelperTests.cs` | Error handling utilities |
| `Helpers.PagedResultTests.cs` | Pagination wrapper |
| `Data.DataContextDapper*.Tests.cs` | Dapper data context (unit + integration) |
| `Data.DataContextEFTests.cs` | EF context configuration |
| `ProblemImportServiceTests.cs` | Import validation and processing |
| `ProblemImportValidatorTests.cs` | Individual field validation |
| `ProblemImportIntegrationTests.cs` | End-to-end import flow |
| `CompilationTest.cs` | Ensures project compiles |
| `ProgramTests.cs` | Program.cs startup validation |
| `Exceptions.ImportExceptionTests.cs` | Exception structure |

### 8.2 UI Tests — `AlgorithmBattleArena.UiTests` (Selenium)

**Framework**: Selenium WebDriver with xUnit.

| Test File | Tests |
|---|---|
| `BaseTest.cs` | Base test class with browser setup/teardown |
| `DemoTest.cs` | Basic smoke test |
| `LandingPageTests.cs` | Landing page loads correctly |
| `LoginPageTests.cs` | Login form and navigation |
| `RegisterPageTests.cs` | Registration form |
| `StudentDashboardTests.cs` | Dashboard renders after login |
| `AdminDashboardTests.cs` | Admin dashboard access |
| `LobbyPageTests.cs` | Lobby list and creation |

### 8.3 Test Data

- `data/seeds/tests/valid-test.json` — Valid problem data for import testing
- `data/seeds/tests/malformed-test.json` — Malformed data for error handling tests

---

## 9. CI/CD & Deployment

### 9.1 Backend Pipeline — `dev_algorithmbattlearena.yml`

**Trigger**: Push to `main` or `dev` branches.

**Jobs**:

1. **build-and-test** (ubuntu-latest):
   - Setup .NET 8 SDK
   - `dotnet restore` the solution
   - `dotnet build` in Release mode
   - Copy test seed data to test output directory
   - `dotnet test` (continue on error — results uploaded as artifacts)
   - `dotnet publish` (only on `main` branch)
   - Upload publish artifact

2. **deploy** (only on `main`, after build-and-test):
   - Download published artifact
   - Deploy to Azure Web App `AlgorithmBattleArena` using publish profile secret

### 9.2 Frontend Pipeline — `azure-static-web-apps-lemon-mud-0cd08c100.yml`

**Trigger**: Push to `main` or pull requests against `main`.

**Jobs**:

1. **build_and_deploy_job**:
   - Checkout code
   - Setup Node.js 20.18.0 with npm cache
   - Install OIDC client
   - Get ID token for Azure authentication
   - Build & Deploy using `Azure/static-web-apps-deploy@v1`:
     - `app_location`: `./AlgorithmBattleArenaFrontend`
     - `output_location`: `dist`
   - Uses OIDC token-based authentication

2. **close_pull_request_job**: Closes PR staging environment.

### 9.3 Deployment Architecture

```
┌─────────────────────┐     ┌─────────────────────────┐
│  Azure Static Web   │     │   Azure Web App          │
│  Apps (Frontend)     │────>│   (Backend API)          │
│  React SPA (dist/)   │     │   ASP.NET Core 8         │
│  lemon-mud-*.net     │     │   algorithmbattlearena-*  │
└─────────────────────┘     │       │                   │
                             │       ▼                   │
                             │  ┌──────────┐             │
                             │  │ MSSQL DB │             │
                             │  └──────────┘             │
                             └─────────────────────────┘
```

---

## 10. Migration Guidance

### Key Architectural Patterns to Replicate

| Pattern | Implementation in This Project | Migration Notes |
|---|---|---|
| **Repository Pattern** | Each domain area has an interface + Dapper SQL implementation | In Spring Boot: use `@Repository` with JdbcTemplate or JPA. In Django: use managers/querysets. |
| **JWT Authentication** | Custom HMAC-SHA512 tokens with role + userId claims | In Spring Boot: use Spring Security + `jjwt` library. Same claim structure. |
| **Role-Based Authorization** | Custom `IAuthorizationFilter` attributes (`[AdminOnly]`, etc.) | In Spring Boot: use `@PreAuthorize("hasRole('Admin')")` or custom filters. |
| **Password Hashing** | PBKDF2-HMAC-SHA256, 100K iterations, with app-level PasswordKey prepended to salt | Replicate exactly for data compatibility, or re-hash on first login if migrating. |
| **Admin as Env Vars** | No admin row in DB — credentials checked against environment variables | Simple to replicate. Consider adding an admin table for multiple admins. |
| **Real-Time: SignalR** | Two hubs (lobby/match + chat) with group-based broadcasting | In Spring Boot: use Spring WebSocket + STOMP, or Socket.IO. Same event names. |
| **Client-Side Code Execution** | Web Worker sandboxing JavaScript execution | This is frontend-only — same approach works regardless of backend. For server-side execution: use Docker containers or judge systems. |
| **Dapper (Raw SQL)** | All queries are handwritten SQL | Good for migration — SQL can be adapted directly to JdbcTemplate or similar. |
| **Stored Procedures** | `spUpsertProblem` for atomic problem upserts | Convert to service-layer transaction logic in the target framework. |
| **OpenAI Integration** | Direct HTTP call to chat completions API | Same HTTP call works in any language. Use the same system/user prompts. |
| **Audit Logging** | Middleware intercepts admin mutations, sanitizes body, logs to DB | In Spring Boot: use `HandlerInterceptor` or AOP `@Around` advice. |
| **Pagination** | Custom `PagedResult<T>` with SQL `OFFSET`/`FETCH NEXT` | Standard in Spring Data (`Page<T>`) or Django (Paginator). |

### Critical Business Rules to Preserve

1. **Match start flow**: Host selects problems → calls start API → server creates match record, broadcasts `MatchStarted` DTO with `startAtUtc` (server time + buffer) and `durationSec` → clients compute countdown locally.
2. **Lobby code**: 6-character random alphanumeric. Must be unique.
3. **Scoring**: Score = percentage of test cases passed (0-100). Test cases are run client-side. Final score is submitted to server.
4. **Conversation types**: Friend (1:1, no ReferenceId), Lobby (ReferenceId = LobbyId), Match (ReferenceId = MatchId), TeacherStudent (1:1).
5. **Friend chat auto-creation**: When a friend request is accepted, a Friend conversation is automatically created.
6. **Lobby chat auto-creation**: When a lobby is created, a Lobby conversation is automatically created. New joiners are added as participants.
7. **Student-Teacher relationship**: Students request teachers. Teachers accept/reject. Accepted students get TeacherId set. Teachers can view analytics only for their students.
8. **Problem import validation**: Validates title (required, max 255), description (required), difficulty (must be Easy/Medium/Hard), timeLimit (>0), memoryLimit (>0), at least 1 test case, at least 1 solution.
9. **Audit log sanitization**: Fields containing "password", "pass", "token", "secret" are replaced with `[REDACTED]`.
10. **Token refresh**: Client can refresh token while authenticated. New token has same claims with fresh 24-hour expiry.

### Environment Variables Required

| Variable | Purpose |
|---|---|
| `DEFAULT_CONNECTION` | MSSQL connection string |
| `TOKEN_KEY` | JWT signing key (must be long enough for HMAC-SHA512) |
| `PASSWORD_KEY` | Prepended to password salt before hashing |
| `ADMIN_EMAIL` | Hardcoded admin email |
| `ADMIN_PASSWORD` | Hardcoded admin password |
| `OPENAI_API_KEY` | OpenAI API key for micro-course generation (optional) |

---

*End of documentation. This file contains everything needed to understand and recreate the Algorithm Battle Arena in any technology stack.*

