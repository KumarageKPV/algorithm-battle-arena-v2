import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './services/auth';
import { SignalRProvider } from './hooks/useSignalR';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherChatPage from './pages/TeacherChatPage';
import AdminDashboard from './pages/AdminDashboard';
import ManageStudentsPage from './pages/ManageStudentsPage';
import HostBattlePage from './pages/HostBattlePage';
import CreateChallengePage from './pages/CreateChallengePage';
import LobbyPage from './pages/LobbyPage';
import LobbyInstancePage from './pages/LobbyInstancePage';
import MatchPage from './pages/MatchPage';
import LeaderboardPage from './pages/LeaderboardPage';

function App() {
  return (
    <AuthProvider>
      <SignalRProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher-chat" element={<TeacherChatPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/manage-students" element={<ManageStudentsPage />} />
          <Route path="/host-battle" element={<HostBattlePage />} />
          <Route path="/create-challenge" element={<CreateChallengePage />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/lobby/:lobbyId" element={<LobbyInstancePage />} />
          <Route path="/match/:matchId" element={<MatchPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </SignalRProvider>
    </AuthProvider>
  );
}

export default App;
