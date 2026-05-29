import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import apiService from '../services/api';

export default function ProblemBrowserModal({ isOpen, onClose, onAddProblems }) {
    const [problems, setProblems] = useState([]);
    const [selectedProblems, setSelectedProblems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            const fetchProblems = async () => {
                try {
                    const response = await apiService.problems.getAll({ page: 1, pageSize: 100 }); // Fetch a large number of problems for now
                    setProblems(response.data.problems);
                } catch (error) {
                    console.error('Failed to fetch problems:', error);
                }
                setIsLoading(false);
            };
            fetchProblems();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleToggleProblem = (problem) => {
        setSelectedProblems(prev => 
            prev.some(p => p.problemId === problem.problemId) 
                ? prev.filter(p => p.problemId !== problem.problemId) 
                : [...prev, problem]
        );
    };

    const handleAddProblems = () => {
        onAddProblems(selectedProblems);
        setSelectedProblems([]);
        onClose();
    };

    const renderTags = (tagsString) => {
        try {
            const tags = JSON.parse(tagsString);
            if (Array.isArray(tags)) {
                return tags.map(tag => <span key={tag} className="bg-gray-600 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{tag}</span>);
            }
        } catch (e) {
            return <span className="bg-gray-600 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{tagsString}</span>;
        }
        return null;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <X />
                </button>
                <h2 className="text-2xl font-bold text-white mb-6">Browse Problems</h2>
                
                <div className="space-y-2 h-96 overflow-y-auto">
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        problems.map(problem => (
                            <div key={problem.problemId} className={`p-3 rounded-lg cursor-pointer ${selectedProblems.some(p => p.problemId === problem.problemId) ? 'bg-purple-600' : 'bg-slate-700'}`} onClick={() => handleToggleProblem(problem)}>
                                <div className="flex items-center justify-between">
                                    <p className="text-white font-semibold">{problem.title}</p>
                                    <p className="text-sm text-gray-400">{problem.difficultyLevel}</p>
                                </div>
                                <div className="mt-2">
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-300 bg-purple-800/50 mr-2">{problem.category}</span>
                                    {renderTags(problem.tags)}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleAddProblems} 
                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:opacity-90 transition-opacity"
                    >
                        Add Selected Problems
                    </button>
                </div>
            </div>
        </div>
    );
}
