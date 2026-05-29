import axios from 'axios';
import { getToken } from './tokenStorage';

// Automatically detect environment and use appropriate API URL
const BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000'  // Local development
  : 'https://algorithmbattlearena-dwdmb7a6c0a7hqdc.southindia-01.azurewebsites.net'; // Production

console.log('API Base URL:', BASE_URL);

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Set token on initialization if available
    const token = getToken();
    if (token) {
      this.setAuthToken(token);
    }
  }

  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  auth = {
    login: (email, password) => this.client.post('/api/Auth/login', { email, password }),
    registerStudent: (data) => this.client.post('/api/Auth/register/student', data),
    registerTeacher: (data) => this.client.post('/api/Auth/register/teacher', data),
    refreshToken: () => this.client.get('/api/Auth/refresh/token'),
    getProfile: () => this.client.get('/api/Auth/profile')
  };

  matches = {
    start: (lobbyId, data) => this.client.post(`/api/Matches/${lobbyId}/start`, data),
    getLeaderboard: (matchId) => this.client.get(`/api/Matches/${matchId}/leaderboard`),
    getGlobalLeaderboard: () => this.client.get('/api/Matches/leaderboard/global')
  };

  problems = {
    getAll: (filters) => this.client.get('/api/Problems', { params: filters }),
    getById: (id) => this.client.get(`/api/Problems/${id}`),
    create: (data) => this.client.post('/api/Problems', data),
    generate: (data) => this.client.post('/api/Problems/generate', data),
    getMicroCourse: (id, data) => {
      console.log('Calling getMicroCourse with:', { id, data });
      return this.client.post(`/api/Problems/${id}/microcourse`, data);
    },
    update: (id, data) => this.client.put(`/api/Problems/${id}`, data),
    delete: (id) => this.client.delete(`/api/Problems/${id}`)
  };

  submissions = {
    create: (data) => this.client.post('/api/Submissions', data),
    getUserSubmissions: (matchId) => this.client.get(`/api/Submissions/match/${matchId}/user`)
  };

  students = {
    getByStatus: (status) => this.client.get(`/api/Students?status=${status}`),
    acceptRequest: (requestId) => this.client.put(`/api/Students/${requestId}/accept`),
    rejectRequest: (requestId) => this.client.put(`/api/Students/${requestId}/reject`),
    requestTeacher: (teacherId) => this.client.post('/api/Students/request', teacherId),
    getAcceptedTeachers: () => this.client.get('/api/Students/teachers'),
    getAnalytics: (studentId) => this.client.get(`/api/Students/${studentId}/analytics`),
    getSubmissionHistory: (studentId) => this.client.get(`/api/Students/${studentId}/submissions`),
    getDashboardStats: () => this.client.get('/api/Students/dashboard-stats')
  };

  teachers = {
    getAll: () => this.client.get('/api/Teachers')
  };

  statistics = {
    getLeaderboard: () => this.client.get('/api/statistics/leaderboard'),
    getUserStatistics: () => this.client.get('/api/statistics/user')
  };

  lobbies = {
    getAll: () => this.client.get('/api/Lobbies'),
    getById: (id) => this.client.get(`/api/Lobbies/${id}`),
    create: (data) => this.client.post('/api/Lobbies', data),
    join: (lobbyCode) => this.client.post(`/api/Lobbies/${lobbyCode}/join`),
    leave: (id) => this.client.post(`/api/Lobbies/${id}/leave`),
    close: (id) => this.client.post(`/api/Lobbies/${id}/close`),
    kickParticipant: (id, email) => this.client.delete(`/api/Lobbies/${id}/participants/${email}`),
    updatePrivacy: (id, isPublic) => this.client.put(`/api/Lobbies/${id}/privacy`, { isPublic }),
    updateDifficulty: (id, difficulty) => this.client.put(`/api/Lobbies/${id}/difficulty`, { difficulty }),
    delete: (id) => this.client.delete(`/api/Lobbies/${id}`)
  };

  friends = {
    getFriends: () => this.client.get('/api/Friends'),
    searchStudents: (query) => this.client.get('/api/Friends/search', { params: { query } }),
    sendFriendRequest: (receiverId) => this.client.post('/api/Friends/request', { receiverId }),
    getReceivedRequests: () => this.client.get('/api/Friends/requests/received'),
    getSentRequests: () => this.client.get('/api/Friends/requests/sent'),
    acceptFriendRequest: (requestId) => this.client.put(`/api/Friends/requests/${requestId}/accept`),
    rejectFriendRequest: (requestId) => this.client.put(`/api/Friends/requests/${requestId}/reject`),
    removeFriend: (friendId) => this.client.delete(`/api/Friends/${friendId}`)
  };

  admin = {
    getUsers: ({ q, role, page = 1, pageSize = 25 }) => 
      this.client.get('/api/Admin/users', { params: { q, role, page, pageSize } }),
    toggleUserActive: (prefixedId, deactivate) => 
      this.client.put(`/api/Admin/users/${encodeURIComponent(prefixedId)}/deactivate`, { deactivate }),
    importProblems: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return this.client.post('/api/Admin/problems/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
  };

  chat = {
    getConversations: () => this.client.get('/api/Chat/conversations'),
    getMessages: (conversationId, pageSize = 50, offset = 0) => 
      this.client.get(`/api/Chat/conversations/${conversationId}/messages?pageSize=${pageSize}&offset=${offset}`),
    createConversation: (type, participantEmails, referenceId = null) => 
      this.client.post('/api/Chat/conversations', { type, participantEmails, referenceId }),
    sendMessage: (conversationId, content) => 
      this.client.post(`/api/Chat/conversations/${conversationId}/messages`, { content }),
    createFriendConversation: (friendId, friendEmail) => 
      this.client.post('/api/Chat/conversations/friend', { friendId, friendEmail })
  };
}

export default new ApiService();
