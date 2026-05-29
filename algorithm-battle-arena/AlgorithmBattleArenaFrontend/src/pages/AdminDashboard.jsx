import React, { useState } from 'react';
import { Shield, Users, Trophy, Settings, BarChart3, Crown, FileText } from 'lucide-react';
import { useAuth } from '../services/auth';
import AdminUsersPanel from '../components/AdminUsersPanel';
import AdminProblemsPanel from '../components/AdminProblemsPanel';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black text-white">
      <header className="bg-black/50 backdrop-blur-sm border-b border-red-500/30 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-400" />
            <h1 className="text-2xl font-bold text-red-400">Guardian Command</h1>
          </div>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Arena Control Center</h2>
          
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'overview' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'users' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              Manage Users
            </button>
            <button
              onClick={() => setActiveTab('problems')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'problems' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              Manage Problems
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <>
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-red-800/50 to-red-900/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-6">
                  <Users className="w-8 h-8 text-red-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Total Warriors</h3>
                  <p className="text-3xl font-bold text-red-400">1,247</p>
                </div>
                <div className="bg-gradient-to-br from-purple-800/50 to-purple-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
                  <Crown className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Masters</h3>
                  <p className="text-3xl font-bold text-purple-400">89</p>
                </div>
                <div className="bg-gradient-to-br from-blue-800/50 to-blue-900/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
                  <Trophy className="w-8 h-8 text-blue-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Active Battles</h3>
                  <p className="text-3xl font-bold text-blue-400">23</p>
                </div>
                <div className="bg-gradient-to-br from-green-800/50 to-green-900/50 backdrop-blur-sm border border-green-500/30 rounded-xl p-6">
                  <BarChart3 className="w-8 h-8 text-green-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Battles Today</h3>
                  <p className="text-3xl font-bold text-green-400">156</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-red-500/50 transition-all">
                  <Users className="w-12 h-12 text-red-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Manage Users</h3>
                  <p className="text-gray-300 mb-4">Control warriors and masters</p>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className="w-full py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-all"
                  >
                    Access
                  </button>
                </div>
                
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all">
                  <Trophy className="w-12 h-12 text-purple-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Battle Oversight</h3>
                  <p className="text-gray-300 mb-4">Monitor all arena activities</p>
                  <button className="w-full py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-all">
                    Monitor
                  </button>
                </div>

                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all">
                  <FileText className="w-12 h-12 text-blue-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Problem Library</h3>
                  <p className="text-gray-300 mb-4">Import and manage challenges</p>
                  <button 
                    onClick={() => setActiveTab('problems')}
                    className="w-full py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && <AdminUsersPanel />}
          {activeTab === 'problems' && <AdminProblemsPanel />}
        </div>
      </main>
    </div>
  );
}