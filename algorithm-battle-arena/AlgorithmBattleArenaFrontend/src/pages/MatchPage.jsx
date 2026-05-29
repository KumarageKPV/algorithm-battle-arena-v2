import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Clock, LogOut, Play, Send, ChevronDown, ChevronRight, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import apiService from '../services/api';
import { useAuth } from '../services/auth';
import codeExecutor from '../services/codeExecutor';
import ResultsModal from '../components/ResultsModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useChat } from '../hooks/useChat';

const MatchChatWindow = ({ conversationId, currentUserEmail, onSendMessage, messages }) => {
  const [newMessage, setNewMessage] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };
  
    return (
        <div 
                className="flex-1 flex flex-col rounded-lg overflow-hidden"
        style={{
            background: 'rgba(30, 30, 30, 0.8)',
            border: '2px solid #666',
        }}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div 
              className="flex items-center justify-center h-full"
              style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '1.2rem',
                  color: '#888',
              }}
          >
            <p>No messages yet. Chat with your opponents!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`flex ${message.senderEmail === currentUserEmail ? 'justify-end' : 'justify-start'}`}>
              <div 
                  className="max-w-xs px-4 py-2 rounded-xl shadow-lg"
                  style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: '1.2rem',
                      background: message.senderEmail === currentUserEmail 
                          ? 'linear-gradient(90deg, #ff6b00, #ff4d4d)' 
                          : 'rgba(40, 40, 40, 0.9)',
                      color: '#fff',
                      border: message.senderEmail === currentUserEmail ? 'none' : '1px solid #666',
                  }}
              >
                {message.senderEmail !== currentUserEmail && (
                  <div style={{ fontSize: '1rem', color: '#ffed4e', marginBottom: '4px', fontWeight: 'bold' }}>
                      {message.senderName || message.senderEmail}
                  </div>
                )}
                <div className="break-words">{message.content}</div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4" style={{ borderTop: '2px solid #666' }}>
        <div className="flex space-x-3">
                    <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
                        className="flex-1 min-w-0 rounded-xl px-4 py-2 focus:outline-none focus:border-[#ff6b00]"
            style={{
                background: 'rgba(40, 40, 40, 0.8)',
                border: '2px solid #666',
                color: '#fff',
                fontFamily: "'Courier New', monospace",
                fontSize: '1.2rem',
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 rounded-xl transition-all disabled:opacity-50"
            style={{
                background: newMessage.trim() ? 'linear-gradient(90deg, #ff6b00, #ff4d4d)' : '#666',
                border: '2px solid ' + (newMessage.trim() ? '#ff6b00' : '#444'),
                color: '#fff',
            }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>

            
  );
};

function formatCountdown(ms) {
    if (ms <= 0) return '00:00';
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function MatchPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const match = location.state?.match;

    const [remaining, setRemaining] = useState(null);
    const [code, setCode] = useState('// Write your code here\nconsole.log("Hello World");');
    const [language, setLanguage] = useState('javascript');
    const [problems, setProblems] = useState([]);
    const [activeProblem, setActiveProblem] = useState(null);
    const [expandedProblem, setExpandedProblem] = useState(null);
    const [autoSubmitted, setAutoSubmitted] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [runResults, setRunResults] = useState(null);
    const [submitResults, setSubmitResults] = useState({});
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [currentResults, setCurrentResults] = useState(null);
    const [problemScores, setProblemScores] = useState({});
    const [submissionCounts, setSubmissionCounts] = useState({});
    const [pendingExit, setPendingExit] = useState(false);
    const [microCourse, setMicroCourse] = useState(null);
    const [microCourseLoading, setMicroCourseLoading] = useState(false);
    const [lastMicroCourseRequest, setLastMicroCourseRequest] = useState({}); // { [problemId]: timestamp }
    const [notification, setNotification] = useState(null); // { message: string, type: 'info'|'error'|'success' }

    
    // Chat functionality
    const { messages, joinConversation, sendMessage, leaveConversation, conversations } = useChat();
    const [matchConversationId, setMatchConversationId] = useState(null);

    useEffect(() => {
        if (!match) {
            navigate('/lobby');
            return;
        }

        const fetchProblems = async () => {
            const problemDetails = await Promise.all(match.problemIds.map(id => apiService.problems.getById(id)));
            const problemsData = problemDetails.map(res => res.data);
            setProblems(problemsData);
            setActiveProblem(problemsData[0]);
            setExpandedProblem(problemsData[0]?.problemId);
        };

        const fetchSubmissions = async () => {
            try {
                const response = await apiService.submissions.getUserSubmissions(match.matchId);
                const submissions = response.data;
                const counts = {};
                submissions.forEach(sub => {
                    counts[sub.problemId] = (counts[sub.problemId] || 0) + 1;
                });
                setSubmissionCounts(counts);
            } catch (error) {
                console.error('Failed to fetch submissions:', error);
            }
        };

        fetchProblems();
        fetchSubmissions();

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const start = new Date(match.startAtUtc).getTime();
            const duration = match.durationSec * 1000;
            const remainingTime = start + duration - now;
            setRemaining(remainingTime > 0 ? remainingTime : 0);
        }, 1000);

        return () => {
            clearInterval(interval);
            if (matchConversationId) {
                leaveConversation(matchConversationId);
            }
        };
    }, [match, navigate, matchConversationId, leaveConversation]);
    
    // Find and join match conversation
    useEffect(() => {
        const matchConv = conversations.find(c => c.type === 'Match' && c.referenceId === match?.matchId);
        if (matchConv && matchConv.conversationId !== matchConversationId) {
            setMatchConversationId(matchConv.conversationId);
            joinConversation(matchConv.conversationId);
        }
    }, [conversations, match?.matchId, matchConversationId, joinConversation]);
    
    const handleSendChatMessage = async (content) => {
        if (matchConversationId) {
            await sendMessage(matchConversationId, content);
        }
    };

    useEffect(() => {
        if (remaining === 0 && !autoSubmitted) {
            setAutoSubmitted(true);
            handleSubmit(true).then(() => {
                setTimeout(() => {
                    handleBackToDashboard();
                }, 2000);
            });
        }
    }, [remaining, autoSubmitted]);

    const handleRun = async () => {
        if (!activeProblem || isRunning) return;
        
        setIsRunning(true);
        setRunResults(null);
        
        try {
            // Get sample test cases only
            const sampleTestCases = activeProblem.testCases?.filter(tc => tc.isSample) || [];
            
            if (sampleTestCases.length === 0) {
                setRunResults({ error: 'No sample test cases available' });
                return;
            }
            
            const results = await codeExecutor.runSample(code, sampleTestCases);
            setRunResults(results);
        } catch (error) {
            setRunResults({ error: error.message });
        } finally {
            setIsRunning(false);
        }
    };

    // Clear run results when switching problems
    useEffect(() => {
        setRunResults(null);
    }, [activeProblem?.problemId]);

    const handleSubmit = async (isAutoSubmit = false, showModal = false) => {
        if (!activeProblem || isSubmitting) return;
        
        setIsSubmitting(true);
        
        try {
            // Run against all test cases
            const allTestCases = activeProblem.testCases || [];
            const results = await codeExecutor.runSubmission(code, allTestCases);
            
            // Submit to server
            await apiService.submissions.create({ 
                matchId: match.matchId, 
                problemId: activeProblem.problemId, 
                language, 
                code,
                score: results.score,
                status: results.allPassed ? 'Accepted' : 'Wrong Answer'
            });
            
            // Store results for display
            setSubmitResults(prev => ({
                ...prev,
                [activeProblem.problemId]: results
            }));
            
            // Update problem scores
            setProblemScores(prev => ({
                ...prev,
                [activeProblem.problemId]: results.score
            }));
            
            // Update submission count
            setSubmissionCounts(prev => ({
                ...prev,
                [activeProblem.problemId]: (prev[activeProblem.problemId] || 0) + 1
            }));
            
            if (!isAutoSubmit && showModal) {
                // Show results modal
                setCurrentResults(results);
                setShowResultsModal(true);
            }
        } catch (error) {
            console.error('Failed to submit solution:', error);
            setCurrentResults({ error: 'Failed to submit solution.' });
            setShowResultsModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackToDashboard = () => {
        switch (user.role) {
            case 'Admin':
                navigate('/admin');
                break;
            case 'Teacher':
                navigate('/teacher');
                break;
            case 'Student':
                navigate('/student-dashboard');
                break;
            default:
                navigate('/dashboard');
        }
    };

    const handleSubmitAndExit = async () => {
        if (!activeProblem || isSubmitting) return;
        
        setIsSubmitting(true);
        
        try {
            // Submit current solution silently
            const allTestCases = activeProblem.testCases || [];
            const results = await codeExecutor.runSubmission(code, allTestCases);
            
            await apiService.submissions.create({ 
                matchId: match.matchId, 
                problemId: activeProblem.problemId, 
                language, 
                code,
                score: results.score,
                status: results.allPassed ? 'Accepted' : 'Wrong Answer'
            });
            
            // Update states
            setSubmitResults(prev => ({
                ...prev,
                [activeProblem.problemId]: results
            }));
            
            setProblemScores(prev => ({
                ...prev,
                [activeProblem.problemId]: results.score
            }));
            
            setSubmissionCounts(prev => ({
                ...prev,
                [activeProblem.problemId]: (prev[activeProblem.problemId] || 0) + 1
            }));
        } catch (error) {
            console.error('Failed to submit solution:', error);
        } finally {
            setIsSubmitting(false);
        }
        
        // Show confirmation dialog directly
        setPendingExit(true);
        setShowConfirmDialog(true);
    };
    
    const handleConfirmExit = () => {
        setShowConfirmDialog(false);
        setPendingExit(false);
        handleBackToDashboard();
    };
    
    const handleCancelExit = () => {
        setShowConfirmDialog(false);
        setPendingExit(false);
    };
    
    const handleCloseResultsModal = () => {
        setShowResultsModal(false);
        setCurrentResults(null);
    };
    
    const handleSubmitAgain = () => {
        setShowResultsModal(false);
        setCurrentResults(null);
        // User can immediately submit again
    };

    if (!match || !activeProblem) return null;

    return (
        <div className="relative min-h-screen w-full bg-black text-white flex flex-col">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 bg-black">
                <img src="/images/LandingPage.jpg" alt="Arena Background" className="w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
            </div>
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="w-full h-full" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.5) 2px,rgba(0,0,0,0.5) 4px)' }}></div>
            </div>

            <div className="relative z-10 flex flex-col h-screen p-4 lg:p-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h1
                    className="select-none"
                    style={{
                        fontFamily: "'MK4', Impact, Haettenschweiler, 'Arial Black', sans-serif",
                        fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                        color: '#ffed4e',
                        WebkitTextStroke: '1.5px #ff6b00',
                        textShadow: '3px 3px 0px #ff6b00, 6px 6px 0px #000, 0 0 20px #ffed4e',
                    }}
                >
                    ALGORITHM BATTLE ARENA
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                    <div 
                        className="flex items-center space-x-2 px-4 py-2 rounded-xl"
                        style={{
                            background: '#B71C1C',
                            border: '2px solid #8B0000',
                            boxShadow: '0 0 15px rgba(183, 28, 28, 0.5)',
                        }}
                    >
                        <Clock className="h-6 w-6" style={{ color: '#ffed4e' }} />
                        <span 
                            style={{
                                fontFamily: "'Courier New', monospace",
                                fontSize: '1.4rem',
                                fontWeight: 'bold',
                                color: '#ffed4e',
                            }}
                        >
                            {remaining !== null ? formatCountdown(remaining) : '...'}
                        </span>
                    </div>
                    <button
                        onClick={async () => {
                            if (!activeProblem) return;
                            const pid = activeProblem.problemId;
                            const now = Date.now();
                            const last = lastMicroCourseRequest[pid] || 0;
                            // cooldown 60 seconds per problem
                            if (now - last < 60000) {
                                setNotification({ message: 'Please wait before requesting another micro-course for this problem.', type: 'info' });
                                setTimeout(() => setNotification(null), 3000);
                                return;
                            }
                            setMicroCourseLoading(true);
                            try {
                                const resp = await apiService.problems.getMicroCourse(pid, { 
                                    timeLimitSeconds: match.durationSec, 
                                    remainingSec: Math.floor(remaining/1000), 
                                    language: language 
                                });
                                setMicroCourse(resp.data);
                                setLastMicroCourseRequest(prev => ({ ...prev, [pid]: Date.now() }));
                            } catch (err) {
                                console.error('Failed to fetch micro-course', err);
                                if (err?.response) {
                                    console.error('Server responded with:', err.response.status, err.response.data);
                                } else {
                                    console.error('Network or other error:', err.message);
                                }
                            } finally {
                                setMicroCourseLoading(false);
                            }
                        }}
                        className="rounded-xl flex items-center justify-center space-x-2 transition-transform duration-200 hover:scale-105"
                        style={{
                            fontFamily: "'Courier New', monospace",
                            fontWeight: 'bold',
                            letterSpacing: '0.05em',
                            padding: '10px 16px',
                            color: '#000',
                            backgroundImage: 'linear-gradient(90deg, #ffed4e, #ff9f43)',
                            border: '2px solid #ffed4e',
                            boxShadow: '0 0 12px rgba(255, 237, 78, 0.5)',
                        }}
                    >
                        <Play className="h-4 w-4" />
                        <span>{microCourseLoading ? 'Loading...' : 'Get Quick Course'}</span>
                    </button>
                    <button
                        onClick={handleSubmitAndExit}
                        className="rounded-xl flex items-center justify-center space-x-2 transition-transform duration-200 hover:scale-105"
                        style={{
                            fontFamily: "'Courier New', monospace",
                            fontWeight: 'bold',
                            letterSpacing: '0.05em',
                            padding: '10px 16px',
                            color: '#fff',
                            background: '#B71C1C',
                            border: '2px solid #8B0000',
                            boxShadow: '0 0 10px rgba(183, 28, 28, 0.4)',
                        }}
                    >
                        <LogOut className="h-6 w-6" />
                        <span>Submit and Exit</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 overflow-hidden">
                <div 
                    className="md:col-span-4 col-span-1 p-4 rounded-lg max-h-[60vh] md:max-h-none overflow-y-auto"
                    style={{
                        background: 'rgba(20, 20, 20, 0.85)',
                        border: '2px solid #ff6b00',
                        boxShadow: '0 0 18px rgba(255, 107, 0, 0.35)',
                    }}
                >
                    <h2 
                        className="mb-4"
                        style={{
                            fontFamily: "'MK4', Impact, sans-serif",
                            fontSize: '1.8rem',
                            color: '#ffed4e',
                            textShadow: '0 0 10px rgba(255, 237, 78, 0.5), 2px 2px 0px #000',
                            letterSpacing: '0.05em',
                        }}
                    >
                        Problems
                    </h2>
                    <div className="space-y-2">
                        {problems.map(p => {
                            const isExpanded = expandedProblem === p.problemId;
                            const isActive = activeProblem?.problemId === p.problemId;
                            const hasSubmission = submitResults[p.problemId];
                            
                            return (
                                <div 
                                    key={p.problemId} 
                                    className="rounded-lg"
                                    style={{
                                        border: '2px solid #666',
                                    }}
                                >
                                    <div 
                                        onClick={() => {
                                            setActiveProblem(p);
                                            setExpandedProblem(isExpanded ? null : p.problemId);
                                        }}
                                        className="p-3 cursor-pointer flex items-center justify-between rounded-lg transition-all"
                                        style={{
                                            background: isActive ? 'linear-gradient(90deg, #ff6b00, #ff4d4d)' : 'rgba(30, 30, 30, 0.8)',
                                            fontFamily: "'Courier New', monospace",
                                            fontSize: '1.3rem',
                                        }}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <span style={{ fontWeight: 'bold', color: '#fff' }}>{p.title}</span>
                                            {submissionCounts[p.problemId] > 0 && (
                                                <span 
                                                    className="text-xs px-2 py-0.5 rounded-md"
                                                    style={{
                                                        backgroundImage: 'linear-gradient(90deg, #ffed4e, #ff9f43)',
                                                        color: '#000',
                                                        border: '1px solid #ff6b00',
                                                        fontFamily: "'Courier New', monospace",
                                                        fontWeight: 'bold',
                                                        boxShadow: '0 0 8px rgba(255, 107, 0, 0.35)'
                                                    }}
                                                >
                                                    {submissionCounts[p.problemId]}
                                                </span>
                                            )}
                                            {hasSubmission && (
                                                hasSubmission.allPassed ? 
                                                        <CheckCircle className="h-3.5 w-3.5" style={{ color: '#4ade80' }} /> :
                                                        <XCircle className="h-3.5 w-3.5" style={{ color: '#ff4d4d' }} />
                                            )}
                                        </div>
                                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </div>
                                    
                                    {isExpanded && (
                                        <div 
                                            className="p-4"
                                            style={{
                                                background: 'rgba(10, 10, 10, 0.9)',
                                                borderTop: '2px solid #666',
                                            }}
                                        >
                                            <div className="mb-3">
                                                <h4 
                                                    className="mb-1"
                                                    style={{
                                                        fontFamily: "'Courier New', monospace",
                                                        fontSize: '1.2rem',
                                                        color: '#ffed4e',
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    Description
                                                </h4>
                                                <p style={{ fontFamily: "'Courier New', monospace", fontSize: '1.1rem', color: '#ccc' }}>{p.description}</p>
                                            </div>
                                            
                                            {p.testCases?.filter(tc => tc.isSample).length > 0 && (
                                                <div className="mb-3">
                                                    <h4 
                                                        className="mb-2"
                                                        style={{
                                                            fontFamily: "'Courier New', monospace",
                                                            fontSize: '1.2rem',
                                                            color: '#ffed4e',
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        Sample Test Cases
                                                    </h4>
                                                    {p.testCases.filter(tc => tc.isSample).map((tc, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            className="mb-2 p-2 rounded"
                                                            style={{
                                                                background: 'rgba(30, 30, 30, 0.8)',
                                                                border: '1px solid #666',
                                                            }}
                                                        >
                                                            <div className="mb-1">
                                                                <span style={{ color: '#4ade80', fontFamily: "'Courier New', monospace", fontSize: '1.1rem' }}>Input:</span>
                                                                <pre style={{ color: '#ccc', fontFamily: "'Courier New', monospace", fontSize: '1rem' }} className="mt-1 whitespace-pre-wrap break-words max-w-full">{tc.inputData}</pre>
                                                            </div>
                                                            <div>
                                                                <span style={{ color: '#ffed4e', fontFamily: "'Courier New', monospace", fontSize: '1.1rem' }}>Output:</span>
                                                                <pre style={{ color: '#ccc', fontFamily: "'Courier New', monospace", fontSize: '1rem' }} className="mt-1 whitespace-pre-wrap break-words max-w-full">{tc.expectedOutput}</pre>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {runResults && isActive && (
                                                <div className="mb-3">
                                                    <h4 
                                                        className="mb-2"
                                                        style={{
                                                            fontFamily: "'Courier New', monospace",
                                                            fontSize: '1.2rem',
                                                            color: '#ffed4e',
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        Run Results
                                                    </h4>
                                                    <div 
                                                        className="p-2 rounded"
                                                        style={{
                                                            background: 'rgba(30, 30, 30, 0.8)',
                                                            border: '1px solid #666',
                                                            fontFamily: "'Courier New', monospace",
                                                            fontSize: '1.1rem',
                                                        }}
                                                    >
                                                        {runResults.error ? (
                                                            <div style={{ color: '#ff3366' }}>{runResults.error}</div>
                                                        ) : (
                                                            <div>
                                                                <div style={{ color: '#4ade80' }} className="mb-1">
                                                                    Passed: {runResults.passedCount}/{runResults.totalCount}
                                                                </div>
                                                                {runResults.results.map((result, idx) => (
                                                                    <div key={idx} className="mb-1" style={{ color: result.passed ? '#4ade80' : '#ff3366' }}>
                                                                        Test {idx + 1}: {result.passed ? '✓' : '✗'}
                                                                        {!result.passed && (
                                                                            <div style={{ color: '#888' }} className="ml-2">
                                                                                Expected: {result.expectedOutput}<br/>
                                                                                Got: {result.actualOutput}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="md:col-span-6 col-span-1 flex flex-col">
                    <div 
                        className="flex-1 rounded-lg overflow-hidden"
                        style={{
                            border: '2px solid #ff6b00',
                            boxShadow: '0 0 18px rgba(255, 107, 0, 0.35)',
                        }}
                    >
                        <Editor
                            height="100%"
                            language={language}
                            theme="vs-dark"
                            value={code}
                            onChange={setCode}
                        />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span 
                                className="hidden sm:inline"
                                style={{
                                    fontFamily: "'Courier New', monospace",
                                    fontSize: '1.1rem',
                                    color: '#ffed4e',
                                }}
                            >
                                Language:
                            </span>
                            <select 
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="rounded-lg p-2 focus:outline-none focus:border-[#ff6b00]"
                                style={{
                                    background: 'rgba(30, 30, 30, 0.8)',
                                    border: '2px solid #666',
                                    color: '#fff',
                                    fontFamily: "'Courier New', monospace",
                                    fontSize: '1.1rem',
                                }}
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="csharp">C#</option>
                            </select>
                        </div>
                        <div className="flex flex-wrap justify-end gap-3">
                        <button 
                            onClick={handleRun}
                            disabled={isRunning || !activeProblem}
                            className="rounded-xl flex items-center space-x-2 transition-transform duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                fontFamily: "'Courier New', monospace",
                                fontWeight: 'bold',
                                letterSpacing: '0.05em',
                                padding: '10px 20px',
                                color: '#ff6b00',
                                background: '#000',
                                border: '2px solid #ff6b00',
                                boxShadow: '0 0 10px rgba(255, 107, 0, 0.35)',
                            }}
                        >
                            <Play className="h-4 w-4" />
                            <span>{isRunning ? 'Running...' : 'Run'}</span>
                        </button>
                        <button 
                            onClick={() => handleSubmit(false, true)}
                            disabled={isSubmitting || !activeProblem}
                            className="rounded-xl flex items-center space-x-2 transition-transform duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                fontFamily: "'Courier New', monospace",
                                fontWeight: 'bold',
                                letterSpacing: '0.05em',
                                padding: '10px 20px',
                                color: '#000',
                                backgroundImage: 'linear-gradient(90deg, #ffed4e, #ff9f43, #ff4d4d)',
                                border: '2px solid #ffed4e',
                                boxShadow: '0 0 12px rgba(255, 237, 78, 0.5)',
                            }}
                        >
                            <Send className="h-4 w-4" />
                            <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                        </button>
                        </div>
                    </div>
                </div>
                
                {/* Chat Column */}
                <div 
                    className="md:col-span-2 col-span-1 p-4 rounded-lg flex flex-col max-h-[60vh] md:max-h-none overflow-y-auto"
                    style={{
                        background: 'rgba(20, 20, 20, 0.85)',
                        border: '2px solid #ff6b00',
                        boxShadow: '0 0 18px rgba(255, 107, 0, 0.35)',
                    }}
                >
                    <h2 
                        className="mb-4 flex items-center"
                        style={{
                            fontFamily: "'MK4', Impact, sans-serif",
                            fontSize: '1.8rem',
                            color: '#ffed4e',
                            textShadow: '0 0 10px rgba(255, 237, 78, 0.5), 2px 2px 0px #000',
                            letterSpacing: '0.05em',
                        }}
                    >
                        <MessageCircle className="mr-2" style={{ color: '#ff6b00' }} />
                        Match Chat
                    </h2>
                    
                    {matchConversationId ? (
                        <MatchChatWindow
                            conversationId={matchConversationId}
                            currentUserEmail={user?.email}
                            onSendMessage={handleSendChatMessage}
                            messages={messages[matchConversationId] || []}
                        />
                    ) : (
                        <div 
                            className="flex-1 flex items-center justify-center"
                            style={{
                                fontFamily: "'Courier New', monospace",
                                fontSize: '1.3rem',
                                color: '#888',
                            }}
                        >
                            <p>Loading chat...</p>
                        </div>
                    )}
                </div>
            </div>
            </div>
            
            {/* Results Modal */}
            <ResultsModal 
                isOpen={showResultsModal}
                onClose={handleCloseResultsModal}
                results={currentResults}
                onSubmitAgain={handleSubmitAgain}
            />
            
            {/* Exit Confirmation Dialog */}
            <ConfirmationDialog 
                isOpen={showConfirmDialog}
                onClose={handleCancelExit}
                onConfirm={handleConfirmExit}
                score={Object.values(problemScores).length > 0 
                    ? Math.round(Object.values(problemScores).reduce((a, b) => a + b, 0) / Object.values(problemScores).length)
                    : 0}
                problemsCompleted={Object.keys(submitResults).length}
                totalProblems={problems.length}
                timeRemaining={remaining || 0}
            />
            
            {/* Micro-course modal */}
            {microCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white text-black rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800">📚 Quick Micro-Course</h2>
                            <button 
                                onClick={() => setMicroCourse(null)} 
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="mb-6">
                                <p className="text-lg font-medium text-gray-700 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                                    {microCourse.summary}
                                </p>
                            </div>
                            
                            <div className="space-y-4">
                                {microCourse.steps && microCourse.steps.map((s, idx) => (
                                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                                                    {idx + 1}
                                                </span>
                                                {s.title}
                                            </h3>
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                                {s.durationSec}s
                                            </span>
                                        </div>
                                        
                                        <p className="text-gray-700 mb-3 leading-relaxed">{s.content}</p>
                                        
                                        {s.example && (
                                            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 mb-3 rounded-r">
                                                <div className="flex items-center mb-1">
                                                    <span className="text-amber-600 font-medium text-sm">💡 Example:</span>
                                                </div>
                                                <p className="text-amber-800 text-sm">{s.example}</p>
                                            </div>
                                        )}
                                        
                                        {s.resources && s.resources.length > 0 && (
                                            <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-r">
                                                <div className="flex items-center mb-2">
                                                    <span className="text-purple-600 font-medium text-sm">📖 Resources:</span>
                                                </div>
                                                <ul className="space-y-1">
                                                    {s.resources.map((resource, ridx) => (
                                                        <li key={ridx} className="text-purple-700 text-sm flex items-center">
                                                            <span className="text-purple-400 mr-2">•</span>
                                                            {resource}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {microCourse.disclaimer && (
                            <div className="p-4 bg-gray-100 border-t border-gray-200 rounded-b-xl">
                                <p className="text-xs text-gray-600 text-center italic">
                                    ⚠️ {microCourse.disclaimer}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Notification Modal */}
            {notification && (
                <div className="fixed top-4 right-4 z-50 animate-fade-in">
                    <div 
                        className="rounded-xl px-6 py-4 shadow-2xl flex items-center space-x-3"
                        style={{
                            background: notification.type === 'error' ? 'linear-gradient(90deg, #B71C1C, #8B0000)' : 
                                       notification.type === 'success' ? 'linear-gradient(90deg, #4ade80, #22c55e)' :
                                       'linear-gradient(90deg, #ff6b00, #ff9f43)',
                            border: '2px solid ' + (notification.type === 'error' ? '#8B0000' : notification.type === 'success' ? '#4ade80' : '#ffed4e'),
                            boxShadow: '0 0 20px rgba(255, 107, 0, 0.6)',
                        }}
                    >
                        <div 
                            style={{
                                fontFamily: "'Courier New', monospace",
                                fontSize: '1.3rem',
                                color: '#fff',
                                fontWeight: 'bold',
                            }}
                        >
                            {notification.message}
                        </div>
                        <button 
                            onClick={() => setNotification(null)}
                            style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}
                            className="hover:opacity-80"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}