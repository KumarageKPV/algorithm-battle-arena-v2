import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Users, BookOpen, Plus, Trophy, Sword, MessageCircle, User, BarChart } from 'lucide-react';
import { useAuth } from '../services/auth';
import ChatButton from '../components/ChatButton';
import ChatWindow from '../components/ChatWindow';
import TeacherContactsSection from '../components/TeacherContactsSection';
import StudentAnalyticsPanel from '../components/StudentAnalyticsPanel';
import apiService from '../services/api';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ students: 0, problems: 0, matches: 0 });
  const [dashboardStats, setDashboardStats] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchStats();
    fetchDashboardStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiService.auth.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const studentsResponse = await apiService.students.getByStatus('accepted');
      setStats({
        students: studentsResponse.data?.length || 0,
        problems: 23, // Placeholder
        matches: 89   // Placeholder
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await apiService.students.getDashboardStats();
      setDashboardStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      <header className="bg-black/50 backdrop-blur-sm border-b border-purple-500/30 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-purple-400">Master's Sanctum</h1>
          </div>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-center">Training Grounds</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'analytics'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <BarChart className="w-4 h-4" />
                Analytics
              </button>
            </div>
          </div>
          {activeTab === 'dashboard' && (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-800/50 to-purple-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
                  <Users className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">My Students</h3>
                  <p className="text-3xl font-bold text-purple-400">{dashboardStats?.totalStudents || stats.students}</p>
                  <p className="text-sm text-gray-300 mt-1">{dashboardStats?.activeStudents || 0} active this week</p>
                </div>
                <div className="bg-gradient-to-br from-blue-800/50 to-blue-900/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
                  <BookOpen className="w-8 h-8 text-blue-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Total Submissions</h3>
                  <p className="text-3xl font-bold text-blue-400">{dashboardStats?.totalSubmissions || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-green-800/50 to-green-900/50 backdrop-blur-sm border border-green-500/30 rounded-xl p-6">
                  <Trophy className="w-8 h-8 text-green-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
                  <p className="text-3xl font-bold text-green-400">{dashboardStats?.overallSuccessRate?.toFixed(1) || 0}%</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="/create-challenge" className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all block">
                  <Plus className="w-12 h-12 text-purple-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Create Challenge</h3>
                  <p className="text-gray-300 mb-4">Forge new coding trials</p>
                  <div className="w-full py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-all text-center">
                    Create
                  </div>
                </Link>
                
                <Link to="/manage-students" className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all block">
                  <Users className="w-12 h-12 text-blue-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Manage Students</h3>
                  <p className="text-gray-300 mb-4">Guide your students</p>
                  <div className="w-full py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all text-center">
                    Manage
                  </div>
                </Link>

                <Link to="/host-battle" className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-green-500/50 transition-all block">
                  <Sword className="w-12 h-12 text-green-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Host Battle</h3>
                  <p className="text-gray-300 mb-4">Start epic competitions</p>
                  <div className="w-full py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-all text-center">
                    Host
                  </div>
                </Link>
                
                <Link 
                  to="/teacher-chat"
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all block"
                >
                  <MessageCircle className="w-12 h-12 text-purple-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Chat with Students</h3>
                  <p className="text-gray-300 mb-4">Connect with your students</p>
                  <div className="w-full py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-all text-center">
                    Open Chat
                  </div>
                </Link>

              </div>
            </>
          )}

          {activeTab === 'analytics' && (
            <StudentAnalyticsPanel />
          )}
        </div>
        </main>
        

      </div>
    );
  }