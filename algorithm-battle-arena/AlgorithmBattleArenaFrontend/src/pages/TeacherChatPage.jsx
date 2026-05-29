import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Crown } from 'lucide-react';
import { useAuth } from '../services/auth';
import TeacherContactsSection from '../components/TeacherContactsSection';

export default function TeacherChatPage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      <header className="bg-black/50 backdrop-blur-sm border-b border-purple-500/30 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link to="/teacher" className="text-purple-400 hover:text-purple-300">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <Crown className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-purple-400">Student Chat</h1>
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
          <TeacherContactsSection />
        </div>
      </main>
    </div>
  );
}