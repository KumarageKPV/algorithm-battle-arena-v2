import React, { useState } from 'react';
import { ArrowLeft, Sword, Users, Clock, Trophy, Settings, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HostBattlePage() {
  const [battleConfig, setBattleConfig] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    maxParticipants: 10,
    difficulty: 'medium',
    problemType: 'algorithm'
  });

  const handleInputChange = (field, value) => {
    setBattleConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleStartBattle = () => {
    // Mockup functionality - would integrate with backend
    alert('Battle would be created and started! (Mockup)');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/teacher" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>
        
        <div className="text-center mb-8">
          <Sword className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Host Epic Battle</h1>
          <p className="text-gray-300">Create and launch coding competitions for your warriors</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Battle Configuration */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold">Battle Configuration</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Battle Title</label>
                <input
                  type="text"
                  value={battleConfig.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter battle name..."
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={battleConfig.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the battle challenge..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Time Limit (min)</label>
                  <input
                    type="number"
                    value={battleConfig.timeLimit}
                    onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
                    min="5"
                    max="120"
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Participants</label>
                  <input
                    type="number"
                    value={battleConfig.maxParticipants}
                    onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                    min="2"
                    max="50"
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty Level</label>
                <select
                  value={battleConfig.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
          </div>

          {/* Battle Preview & Actions */}
          <div className="space-y-6">
            {/* Battle Preview */}
            <div className="bg-gradient-to-br from-purple-800/50 to-purple-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-bold">Battle Preview</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Sword className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Title:</span>
                  <span className="text-white">{battleConfig.title || 'Untitled Battle'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">Duration:</span>
                  <span className="text-white">{battleConfig.timeLimit} minutes</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">Max Warriors:</span>
                  <span className="text-white">{battleConfig.maxParticipants}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">Difficulty:</span>
                  <span className={`capitalize font-medium ${
                    battleConfig.difficulty === 'easy' ? 'text-green-400' :
                    battleConfig.difficulty === 'medium' ? 'text-yellow-400' :
                    battleConfig.difficulty === 'hard' ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {battleConfig.difficulty}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all flex items-center justify-center gap-2">
                  <Settings className="w-4 h-4" />
                  Select Problems
                </button>
                
                <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  Invite Students
                </button>
                
                <button className="w-full py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-all flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  Schedule Later
                </button>
              </div>
            </div>

            {/* Start Battle Button */}
            <button
              onClick={handleStartBattle}
              disabled={!battleConfig.title.trim()}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg transition-all flex items-center justify-center gap-3 text-lg font-bold"
            >
              <Play className="w-6 h-6" />
              Launch Battle Arena
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}