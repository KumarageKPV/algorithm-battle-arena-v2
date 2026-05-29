import React from 'react';
import { X, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ResultsModal({ isOpen, onClose, results, onSubmitAgain }) {
    if (!isOpen || !results) return null;

    const { score, passedCount, totalCount, results: testResults, error } = results;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Submission Results</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {error ? (
                    <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4">
                        <p className="text-red-200">Error: {error}</p>
                    </div>
                ) : (
                    <>
                        {/* Score Summary */}
                        <div className="bg-slate-700 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-lg font-semibold text-white">Overall Score</span>
                                <span className={`text-2xl font-bold ${score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {score}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-600 rounded-full h-3">
                                <div 
                                    className={`h-3 rounded-full transition-all duration-500 ${score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${score}%` }}
                                ></div>
                            </div>
                            <p className="text-slate-300 mt-2">
                                {passedCount} of {totalCount} test cases passed
                            </p>
                        </div>

                        {/* Test Cases Results */}
                        <div className="space-y-3 mb-6">
                            <h3 className="text-lg font-semibold text-white">Test Cases</h3>
                            {testResults?.map((result, index) => (
                                <div key={index} className={`border rounded-lg p-3 ${result.passed ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            {result.passed ? (
                                                <CheckCircle className="h-5 w-5 text-green-400" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-400" />
                                            )}
                                            <span className="font-medium text-white">Test Case {index + 1}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-slate-300">
                                            <Clock className="h-4 w-4" />
                                            <span className="text-sm">{result.executionTime}ms</span>
                                        </div>
                                    </div>
                                    
                                    {!result.passed && (
                                        <div className="text-sm space-y-1">
                                            <div className="text-slate-300">
                                                <span className="font-medium">Expected:</span> {result.expectedOutput}
                                            </div>
                                            <div className="text-slate-300">
                                                <span className="font-medium">Got:</span> {result.actualOutput || 'No output'}
                                            </div>
                                            {result.error && (
                                                <div className="text-red-300">
                                                    <span className="font-medium">Error:</span> {result.error}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                    <div className="text-slate-400 text-sm">
                        Submission saved! You can continue working.
                    </div>
                    <div className="flex space-x-4">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                        >
                            Close
                        </button>
                        {!error && onSubmitAgain && (
                            <button 
                                onClick={onSubmitAgain}
                                className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
                            >
                                Submit Another Solution
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}