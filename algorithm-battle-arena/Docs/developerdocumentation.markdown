## User Story ABA-3: Responsive Auth & Problems List

**Story Definition:**  
As a player, I want responsive login/register pages and a public problems list so I can authenticate and browse problems.

**Technical Implementation:**

- **Frontend:**
  - React pages: `LoginPage`, `RegisterPage`, and `LobbyPage` (problems list with pagination).
  - API integration via `/api/Auth/login`, `/api/Auth/register/student`, `/api/Auth/register/teacher`.
  - JWT token managed in `localStorage` and provided via context (`AuthProvider`).
  - Problems list displays title, difficulty, tags, and links to detail pages.
  - Pagination and filtering handled via API and frontend state.

- **Backend:**
  - Auth endpoints implemented in `AuthController`.
  - Problems endpoints in `ProblemsController`:
    - `GET /api/problems` for list (supports pagination/filtering).
    - `GET /api/problems/{id}` for details.
  - DTOs for problem data and filtering.

**Testing Approach:**

- **Frontend:**
  - Unit tests for React components using Jest and React Testing Library.
  - E2E smoke test: login → redirect → problems list.
  - Accessibility checks for keyboard navigation and color contrast.

- **Backend:**
  - Controller unit tests for authentication and problems endpoints.

**Acceptance Criteria:**

- Login/Register UI authenticates via backend and redirects to problems list.
- Problems list renders at least 10 items and supports pagination.
- Invalid input triggers client-side validation errors.

---

## User Story ABA-9: Real-Time Lobby & Match Start Broadcasts

**Story Definition:**  
As a player, I want real-time lobby behavior and match start broadcasts so all participants begin the match in sync.

**Technical Implementation:**

- **Backend:**
  - SignalR hub `/hubs/match` implemented in `MatchHub`:
    - Methods: `JoinLobby`, `LeaveLobby`, and server broadcast of `MatchStarted`.
    - Payload includes: `matchId`, `problemId`, `startAt` (UTC), `durationSec`.
    - JWT authentication required for hub access.
    - Lobby membership and authorization enforced.
  - REST endpoint `/api/matches/{lobbyId}/start` triggers match start and broadcasts to lobby.

- **Frontend:**
  - SignalR client connects to `/hubs/match` and listens for `MatchStarted`.
  - Lobby UI updates in real-time on member join/leave and match start.

**Testing Approach:**

- Integration tests for hub methods using SignalR test client.
- E2E: multiple clients join lobby and receive `MatchStarted` event.
- Broadcast latency measured in staging.
- Authorization checks for hub operations.

**Acceptance Criteria:**

- All clients in a lobby receive `MatchStarted` with identical `startAt`.
- Unauthorized clients are rejected