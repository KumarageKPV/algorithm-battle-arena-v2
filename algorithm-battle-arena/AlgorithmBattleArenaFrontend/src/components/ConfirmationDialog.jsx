import React from 'react';
import { AlertTriangle, Trophy, Clock } from 'lucide-react';

export default function ConfirmationDialog({ 
    isOpen, 
    onClose, 
    onConfirm, 
    score, 
    problemsCompleted, 
    totalProblems, 
    timeRemaining 
}) {
    if (!isOpen) return null;

    const formatTime = (ms) => {
        if (ms <= 0) return '00:00';
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 w-full max-w-md">
                <div className="flex items-center space-x-3 mb-6">
                    <AlertTriangle className="h-8 w-8 text-yellow-400" />
                    <h2 className="text-2xl font-bold text-white">Leave Match?</h2>
                </div>

                {/* Match Summary */}
                <div className="bg-slate-700 rounded-lg p-4 mb-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-300">Final Score:</span>
                        <span className={`text-xl font-bold ${score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {score}%
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-slate-300">Problems Completed:</span>
                        <span className="text-white font-semibold">
                            {problemsCompleted}/{totalProblems}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-slate-300">Time Remaining:</span>
                        <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span className="text-white font-semibold">
                                {formatTime(timeRemaining)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <p className="text-slate-300">
                        Are you sure you want to leave the match? You still have time remaining to improve your score.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                    <button 
                        onClick={onClose}
                        className="flex-1 px-6 py-3 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors font-medium"
                    >
                        Stay in Match
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="flex-1 px-6 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
                    >
                        Leave Match
                    </button>
                </div>
            </div>
        </div>
    );
}