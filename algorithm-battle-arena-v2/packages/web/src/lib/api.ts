import axios from "axios";

/**
 * Centralized Axios API client — mirrors v1 api.js.
 * In dev, Next.js rewrites /api/* → localhost:5000/api/*.
 * In prod, set NEXT_PUBLIC_API_URL to the backend origin.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Request interceptor to add token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as (typeof error.config & { _retry?: boolean });
    const status = error.response?.status;
    const url = (original?.url || "").toLowerCase();
    const isAuthRoute = url.includes("/auth/login") || url.includes("/auth/refresh/token") || url.includes("/auth/logout");

    if (status === 401 && !original?._retry && !isAuthRoute) {
      original._retry = true;
      try {
        await api.get("/Auth/refresh/token");
        return api(original);
      } catch {
        // fall through
      }
    }
    return Promise.reject(error);
  },
);

// ─── Auth ──────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/Auth/login", { email, password }),
  registerStudent: (data: any) => api.post("/Auth/register/student", data),
  registerTeacher: (data: any) => api.post("/Auth/register/teacher", data),
  refreshToken: () => api.get("/Auth/refresh/token"),
  logout: () => api.post("/Auth/logout"),
  getProfile: () => api.get("/Auth/profile"),
};

// ─── Problems ──────────────────────────────────────────────────────
export const problemsApi = {
  getAll: (params?: Record<string, string>) => api.get("/Problems", { params }),
  getById: (id: number) => api.get(`/Problems/${id}`),
  upsert: (data: any) => api.post("/Problems/UpsertProblem", data),
  delete: (id: number) => api.delete(`/Problems/${id}`),
  generate: (data: any) => api.post("/Problems/generate", data),
  getMicroCourse: (id: number, data: any) =>
    api.post(`/Problems/${id}/microcourse`, data),
  getCategories: () => api.get("/Problems/categories"),
  getDifficultyLevels: () => api.get("/Problems/difficulty-levels"),
};

// ─── Lobbies ───────────────────────────────────────────────────────
export const lobbiesApi = {
  getAll: () => api.get("/Lobbies"),
  getById: (id: number) => api.get(`/Lobbies/${id}`),
  create: (data: any) => api.post("/Lobbies", data),
  join: (code: string) => api.post(`/Lobbies/${code}/join`),
  leave: (id: number) => api.post(`/Lobbies/${id}/leave`),
  close: (id: number) => api.post(`/Lobbies/${id}/close`),
  kick: (id: number, email: string) =>
    api.delete(`/Lobbies/${id}/participants/${email}`),
  updatePrivacy: (id: number, isPublic: boolean) =>
    api.put(`/Lobbies/${id}/privacy`, { isPublic }),
  updateDifficulty: (id: number, difficulty: string) =>
    api.put(`/Lobbies/${id}/difficulty`, { difficulty }),
  delete: (id: number) => api.delete(`/Lobbies/${id}`),
};

// ─── Matches ───────────────────────────────────────────────────────
export const matchesApi = {
  start: (lobbyId: number, data: any) =>
    api.post(`/Matches/${lobbyId}/start`, data),
  getProblems: (matchId: number) =>
    api.get(`/Matches/${matchId}/problems`),
  getLeaderboard: (matchId: number) =>
    api.get(`/Matches/${matchId}/leaderboard`),
  getGlobalLeaderboard: () => api.get("/Matches/leaderboard/global"),
};

// ─── Submissions ───────────────────────────────────────────────────
export const submissionsApi = {
  create: (data: any) => api.post("/Submissions", data),
  getUserSubmissions: (matchId: number) =>
    api.get(`/Submissions/match/${matchId}/user`),
};

// ─── Code Execution ────────────────────────────────────────────────
export const codeExecutionApi = {
  runTests: (data: any) => api.post("/CodeExecution/run-tests", data),
};

// ─── Chat ──────────────────────────────────────────────────────────
export const chatApi = {
  getConversations: () => api.get("/Chat/conversations"),
  getMessages: (convId: number, pageSize = 50, offset = 0) =>
    api.get(`/Chat/conversations/${convId}/messages`, {
      params: { pageSize, offset },
    }),
  sendMessage: (convId: number, content: string) =>
    api.post(`/Chat/conversations/${convId}/messages`, { content }),
  createFriendConversation: (data: any) =>
    api.post("/Chat/conversations/friend", data),
  createConversation: (type: string, participantEmails: string[], referenceId: number | null = null) =>
    api.post("/Chat/conversations", { type, participantEmails, referenceId }),
};

// ─── Friends ───────────────────────────────────────────────────────
export const friendsApi = {
  getFriends: () => api.get("/Friends"),
  search: (query: string) => api.get("/Friends/search", { params: { query } }),
  sendRequest: (receiverId: number) =>
    api.post("/Friends/request", { receiverId }),
  getReceived: () => api.get("/Friends/requests/received"),
  getSent: () => api.get("/Friends/requests/sent"),
  accept: (requestId: number) =>
    api.put(`/Friends/requests/${requestId}/accept`),
  reject: (requestId: number) =>
    api.put(`/Friends/requests/${requestId}/reject`),
  remove: (friendId: number) => api.delete(`/Friends/${friendId}`),
};

// ─── Students ──────────────────────────────────────────────────────
export const studentsApi = {
  requestTeacher: (teacherId: number) =>
    api.post("/Students/request", { teacherId }),
  acceptRequest: (requestId: number) =>
    api.put(`/Students/${requestId}/accept`),
  rejectRequest: (requestId: number) =>
    api.put(`/Students/${requestId}/reject`),
  getStudents: () => api.get("/Students"),
  getTeachers: () => api.get("/Students/teachers"),
  getAnalytics: (studentId: number) =>
    api.get(`/Students/${studentId}/analytics`),
  getSubmissions: (studentId: number) =>
    api.get(`/Students/${studentId}/submissions`),
  getDashboardStats: () => api.get("/Students/dashboard-stats"),
};

// ─── Teachers ──────────────────────────────────────────────────────
export const teachersApi = {
  getAll: () => api.get("/Teachers"),
};

// ─── Statistics ────────────────────────────────────────────────────
export const statisticsApi = {
  getUserStats: () => api.get("/Statistics/user"),
  getLeaderboard: () => api.get("/Statistics/leaderboard"),
};

// ─── Admin ─────────────────────────────────────────────────────────
export const adminApi = {
  getUsers: (params?: Record<string, string>) =>
    api.get("/Admin/users", { params }),
  toggleUserActive: (id: string, deactivate: boolean) =>
    api.put(`/Admin/users/${encodeURIComponent(id)}/deactivate`, { deactivate }),
  importProblems: (data: any) => {
    // Support both FormData (file upload) and raw JSON array
    if (data instanceof FormData) {
      return api.post("/Admin/problems/import", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return api.post("/Admin/problems/import", data);
  },
};

export default api;
