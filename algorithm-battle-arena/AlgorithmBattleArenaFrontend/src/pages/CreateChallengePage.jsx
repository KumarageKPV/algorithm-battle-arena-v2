import React, { useState } from 'react';
import { ArrowLeft, Plus, Code, CheckCircle, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CreateChallengePage() {
  const [challenge, setChallenge] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    timeLimit: 60,
    category: 'algorithms',
    testCases: [{ input: '', expectedOutput: '' }]
  });

  const handleInputChange = (field, value) => {
    setChallenge(prev => ({ ...prev, [field]: value }));
  };

  const addTestCase = () => {
    setChallenge(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '' }]
    }));
  };

  const updateTestCase = (index, field, value) => {
    setChallenge(prev => ({
      ...prev,
      testCases: prev.testCases.map((tc, i) => 
        i === index ? { ...tc, [field]: value } : tc
      )
    }));
  };

  const handleSaveChallenge = () => {
    alert('Challenge would be saved! (Mockup)');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/teacher" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>
        
        <div className="text-center mb-8">
          <Plus className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Forge New Challenge</h1>
          <p className="text-gray-300">Create coding trials to test your warriors</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Challenge Details */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Code className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold">Challenge Details</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Challenge Title</label>
                <input
                  type="text"
                  value={challenge.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter challenge name..."
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Problem Description</label>
                <textarea
                  value={challenge.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the problem to solve..."
                  rows={6}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                  <select
                    value={challenge.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Time Limit (min)</label>
                  <input
                    type="number"
                    value={challenge.timeLimit}
                    onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
                    min="5"
                    max="180"
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={challenge.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="algorithms">Algorithms</option>
                  <option value="data-structures">Data Structures</option>
                  <option value="dynamic-programming">Dynamic Programming</option>
                  <option value="graphs">Graphs</option>
                  <option value="strings">Strings</option>
                </select>
              </div>
            </div>
          </div>

          {/* Test Cases */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-bold">Test Cases</h2>
              </div>
              <button
                onClick={addTestCase}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-all"
              >
                Add Test
              </button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {challenge.testCases.map((testCase, index) => (
                <div key={index} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Test Case {index + 1}</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Input</label>
                      <textarea
                        value={testCase.input}
                        onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                        placeholder="Enter test input..."
                        rows={2}
                        className="w-full px-2 py-1 bg-gray-800/50 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Expected Output</label>
                      <textarea
                        value={testCase.expectedOutput}
                        onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                        placeholder="Enter expected output..."
                        rows={2}
                        className="w-full px-2 py-1 bg-gray-800/50 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSaveChallenge}
            disabled={!challenge.title.trim() || !challenge.description.trim()}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg transition-all flex items-center justify-center gap-3 text-lg font-bold mx-auto"
          >
            <Save className="w-6 h-6" />
            Save Challenge
          </button>
        </div>
      </div>
    </div>
  );
}