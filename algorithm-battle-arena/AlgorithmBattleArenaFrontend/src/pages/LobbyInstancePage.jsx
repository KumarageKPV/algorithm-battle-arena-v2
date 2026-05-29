import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, Users, Crown, Play, Loader2, LogOut, UserPlus, XCircle, Shield, Copy, Trash2, CheckCircle, Info } from 'lucide-react';
import apiService from '../services/api';
import { useSignalR } from '../hooks/useSignalR';
import { useAuth } from '../services/auth';
import ProblemBrowserModal from '../components/ProblemBrowserModal';
import { MessageCircle, Send } from 'lucide-react';
import { useChat } from '../hooks/useChat';

const SimpleChatWindow = ({ currentUserEmail, onSendMessage, messages }) => {
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
            className="flex flex-col rounded-lg max-h-[55vh] md:h-96 overflow-y-auto"
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
            <p>No messages yet. Start the conversation!</p>
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
            className="flex-1 rounded-xl px-4 py-2 focus:outline-none focus:border-[#ff6b00]"
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

const PlayerCard = ({ player, isHost, onKick }) => (
    <div 
        className="rounded-lg flex items-center justify-between"
        style={{
            background: 'rgba(30, 30, 30, 0.8)',
            border: '2px solid #666',
            borderRadius: '6px',
            padding: '14px',
        }}
    >
        <div className="flex items-center space-x-2">
            {player.role === 'Host' && <Crown className="h-5 w-5" style={{ color: '#ffed4e' }} />}
            <p style={{ color: '#fff', fontFamily: "'Courier New', monospace", fontSize: '1.3rem', fontWeight: 'bold' }}>
                {player.participantEmail}
            </p>
        </div>
        {isHost && player.role !== 'Host' && (
            <button 
                onClick={() => onKick(player.participantEmail)} 
                style={{ color: '#ff3366' }}
                className="hover:opacity-80 p-1"
                title="Kick player"
            >
                <XCircle className="h-5 w-5" />
            </button>
        )}
    </div>
);

const Toggle = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-orange-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
    </label>
);

export default function LobbyInstancePage() {
    const { lobbyId } = useParams();
    const navigate = useNavigate();
    const signalRService = useSignalR();
    const { user } = useAuth();

    const [lobby, setLobby] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isBrowserOpen, setIsBrowserOpen] = useState(false);
    const [selectedProblems, setSelectedProblems] = useState([]);

    const [language, setLanguage] = useState('Python');
    const [maxProblems, setMaxProblems] = useState(5);
    const [durationSec, setDurationSec] = useState(600);
    const [showMatchStart, setShowMatchStart] = useState(false);
    const matchNavigateTimerRef = useRef(null);
    const hasNavigatedRef = useRef(false);
    
    // Chat functionality
    const { messages, joinConversation, sendMessage, leaveConversation, conversations } = useChat();
    const [lobbyConversationId, setLobbyConversationId] = useState(null);

    const isHost = useMemo(() => lobby?.hostEmail === user?.email, [lobby, user]);
    const isParticipant = useMemo(() => lobby?.participants.some(p => p.participantEmail === user?.email), [lobby, user]);

    useEffect(() => {
        const fetchLobby = async () => {
            try {
                const response = await apiService.lobbies.getById(lobbyId);
                setLobby(response.data);
            } catch (error) {
                console.error('Failed to fetch lobby:', error);
                navigate('/lobby');
            }
            setIsLoading(false);
        };

        fetchLobby();

        // Ensure SignalR connection and join lobby
        const joinLobbyAsync = async () => {
            try {
                await signalRService.joinLobby(lobbyId);
            } catch (error) {
                console.error('Failed to join SignalR lobby:', error);
            }
        };
        joinLobbyAsync();

        const unsubscribeLobbyUpdated = signalRService.onLobbyUpdated(updatedLobby => {
            if (updatedLobby.lobbyId.toString() === lobbyId) {
                setLobby({ ...updatedLobby });
            }
        });

        const unsubscribeMatchStarted = signalRService.onMatchStarted(match => {
            console.log('MatchStarted event received:', match);
            setShowMatchStart(true);
            if (!hasNavigatedRef.current) {
                if (matchNavigateTimerRef.current) clearTimeout(matchNavigateTimerRef.current);
                // Give users time to see the success modal
                matchNavigateTimerRef.current = setTimeout(() => {
                    hasNavigatedRef.current = true;
                    navigate(`/match/${match.matchId}`, { state: { match } });
                }, 1800);
            }
        });

        const unsubscribeLobbyDeleted = signalRService.onLobbyDeleted(() => {
            navigate('/lobby');
        });

        return () => {
            signalRService.leaveLobby(lobbyId);
            unsubscribeLobbyUpdated();
            unsubscribeMatchStarted();
            unsubscribeLobbyDeleted();
            if (lobbyConversationId) {
                leaveConversation(lobbyConversationId);
            }
            if (matchNavigateTimerRef.current) clearTimeout(matchNavigateTimerRef.current);
        };
    }, [lobbyId, navigate, signalRService, lobbyConversationId, leaveConversation]);
    
    // Find and join lobby conversation
    useEffect(() => {
        const lobbyConv = conversations.find(c => c.type === 'Lobby' && c.referenceId === parseInt(lobbyId));
        if (lobbyConv && lobbyConv.conversationId !== lobbyConversationId) {
            setLobbyConversationId(lobbyConv.conversationId);
            joinConversation(lobbyConv.conversationId);
        }
    }, [conversations, lobbyId, lobbyConversationId, joinConversation]);
    
    const handleSendMessage = async (content) => {
        if (lobbyConversationId) {
            await sendMessage(lobbyConversationId, content);
        }
    };

    const handleStartGame = async () => {
        if (!isHost) {
            console.log('Not host, cannot start game');
            return;
        }
        if (selectedProblems.length === 0) {
            console.log('No problems selected');
            alert('Please select problems before starting the match');
            return;
        }
        
        console.log('Starting match with:', { 
            lobbyId, 
            problemIds: selectedProblems.map(p => p.problemId), 
            durationSec 
        });
        
        try {
            const response = await apiService.matches.start(lobbyId, { 
                problemIds: selectedProblems.map(p => p.problemId), 
                durationSec,
                preparationBufferSec: 5
            });
            console.log('Match start response:', response.data);
            // Show success modal and delay navigation for host as well
            setShowMatchStart(true);
            if (!hasNavigatedRef.current) {
                if (matchNavigateTimerRef.current) clearTimeout(matchNavigateTimerRef.current);
                matchNavigateTimerRef.current = setTimeout(() => {
                    hasNavigatedRef.current = true;
                    navigate(`/match/${response.data.matchId}`, { state: { match: response.data } });
                }, 1800);
            }
        } catch (error) {
            console.error('Failed to start match:', error);
            const errorMessage = error.response?.data?.message || error.response?.data || error.message;
            alert('Failed to start match: ' + errorMessage);
        }
    };

    const handleGenerateProblems = async () => {
        if (!isHost) return;
        try {
            const response = await apiService.problems.generate({ language, difficulty: lobby.difficulty, maxProblems });
            if (response.data.length === 0) {
                alert('No problems found for the selected criteria.');
            }
            setSelectedProblems(response.data);
        } catch (error) {
            console.error('Error generating problems:', error);
        }
    };

    const handleAddProblems = (problems) => {
        setSelectedProblems(prev => [...prev, ...problems]);
    };

    const handleRemoveProblem = (problemId) => {
        setSelectedProblems(prev => prev.filter(p => p.problemId !== problemId));
    };

    const handleJoinLobby = async () => {
        try {
            await apiService.lobbies.join(lobby.lobbyCode);
        } catch (error) {
            console.error('Failed to join lobby:', error);
            const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to join lobby';
            alert(errorMessage);
        }
    };

    const handleLeaveLobby = async () => {
        try {
            await apiService.lobbies.leave(lobbyId);
            navigate('/lobby', { replace: true });
        } catch (error) {
            console.error('Failed to leave lobby:', error);
        }
    };

    const handleKickPlayer = async (email) => {
        if (!isHost) return;
        try {
            await apiService.lobbies.kickParticipant(lobbyId, email);
        } catch (error) {
            console.error('Failed to kick player:', error);
        }
    };

    const handlePrivacyChange = async () => {
        if (!isHost) return;
        try {
            await apiService.lobbies.updatePrivacy(lobbyId, !lobby.isPublic);
        } catch (error) {
            console.error('Failed to update lobby privacy:', error);
        }
    };

    const handleDifficultyChange = async (e) => {
        if (!isHost) return;
        const newDifficulty = e.target.value;
        const oldLobby = lobby;
        setLobby(prevLobby => ({ ...prevLobby, difficulty: newDifficulty }));
        try {
            await apiService.lobbies.updateDifficulty(lobbyId, newDifficulty);
        } catch (error) {
            console.error('Failed to update lobby difficulty:', error);
            setLobby(oldLobby);
        }
    };

    const handleDeleteLobby = async () => {
        if (!isHost) return;
        if (window.confirm('Are you sure you want to delete this lobby?')) {
            try {
                await apiService.lobbies.delete(lobbyId);
                navigate('/lobby');
            }
            catch (error) {
                console.error('Failed to delete lobby:', error);
            }
        }
    };

    const copyLobbyCode = () => {
        navigator.clipboard.writeText(lobby.lobbyCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderTags = (tagsString) => {
        try {
            const tags = JSON.parse(tagsString);
            if (Array.isArray(tags)) {
                return tags.map(tag => <span key={tag} className="bg-gray-600 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{tag}</span>);
            }
        } catch {
            return <span className="bg-gray-600 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{tagsString}</span>;
        }
        return null;
    };

    if (isLoading || !lobby) {
        return (
            <div className="relative min-h-screen w-full bg-black text-white flex items-center justify-center">
                <div className="absolute inset-0 bg-black">
                    <img src="/images/LandingPage.jpg" alt="Arena Background" className="w-full h-full object-cover opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
                </div>
                <div className="absolute inset-0 pointer-events-none opacity-10">
                    <div className="w-full h-full" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.5) 2px,rgba(0,0,0,0.5) 4px)' }}></div>
                </div>
                <Loader2 className="w-12 h-12 relative z-10 animate-spin" style={{ color: '#ffed4e' }} />
            </div>
        );
    }

    return (
        <>
            <div className="relative min-h-screen w-full bg-black text-white">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 bg-black">
                    <img src="/images/LandingPage.jpg" alt="Arena Background" className="w-full h-full object-cover opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
                </div>
                {/* Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none opacity-10">
                    <div className="w-full h-full" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.5) 2px,rgba(0,0,0,0.5) 4px)' }}></div>
                </div>

                <div className="relative z-10 w-full max-w-none mx-auto px-4 lg:px-8 py-10">
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <Shield className="h-10 w-10" style={{ color: '#ffed4e' }} />
                            <h1
                                className="select-none"
                                style={{
                                    fontFamily: "'MK4', Impact, Haettenschweiler, 'Arial Black', sans-serif",
                                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                                    color: '#ffed4e',
                                    WebkitTextStroke: '1.5px #ff6b00',
                                    textShadow: '3px 3px 0px #ff6b00, 6px 6px 0px #000, 0 0 20px #ffed4e',
                                }}
                            >
                                {lobby.lobbyName}
                            </h1>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
                        {/* Left Column: Settings */}
                        <div 
                            className="lg:col-span-1 col-span-1 space-y-5"
                            style={{
                                background: 'rgba(20, 20, 20, 0.85)',
                                border: '2px solid #ff6b00',
                                borderRadius: '8px',
                                padding: '24px',
                                boxShadow: '0 0 18px rgba(255, 107, 0, 0.35)',
                            }}
                        >
                            <h2 
                                className="flex items-center"
                                style={{
                                    fontFamily: "'MK4', Impact, sans-serif",
                                    fontSize: '1.8rem',
                                    color: '#ffed4e',
                                    textShadow: '0 0 10px rgba(255, 237, 78, 0.5), 2px 2px 0px #000',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                <Settings className="mr-3" style={{ color: '#ff6b00' }} /> 
                                Settings
                            </h2>
                            
                            <div>
                                <label style={{ fontFamily: "'Courier New', monospace", fontSize: '1.3rem', color: '#ccc', fontWeight: 'bold' }}>
                                    Lobby Code
                                </label>
                                <div className="flex items-center space-x-2 mt-2">
                                    <p 
                                        className="w-full rounded-lg"
                                        style={{
                                            background: 'rgba(30, 30, 30, 0.8)',
                                            border: '2px solid #666',
                                            padding: '10px 12px',
                                            fontFamily: "'Courier New', monospace",
                                            fontSize: '1.3rem',
                                            color: '#ffed4e',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {lobby.lobbyCode}
                                    </p>
                                    <button 
                                        onClick={copyLobbyCode} 
                                        className="p-2 rounded-lg hover:opacity-80"
                                        style={{
                                            background: 'rgba(30, 30, 30, 0.8)',
                                            border: '2px solid #666',
                                        }}
                                    >
                                        {copied ? <CheckCircle className="h-5 w-5" style={{ color: '#4ade80' }} /> : <Copy className="h-5 w-5" style={{ color: '#ffed4e' }} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label style={{ fontFamily: "'Courier New', monospace", fontSize: '1.3rem', color: '#ccc', fontWeight: 'bold' }}>
                                    Mode
                                </label>
                                <p 
                                    className="w-full rounded-lg mt-2"
                                    style={{
                                        background: 'rgba(30, 30, 30, 0.8)',
                                        border: '2px solid #666',
                                        padding: '10px 12px',
                                        fontFamily: "'Courier New', monospace",
                                        fontSize: '1.3rem',
                                        color: '#fff',
                                    }}
                                >
                                    {lobby.mode}
                                </p>
                            </div>

                            <div>
                                <label style={{ fontFamily: "'Courier New', monospace", fontSize: '1.3rem', color: '#ccc', fontWeight: 'bold' }}>
                                    Difficulty
                                </label>
                                {isHost ? (
                                    <select 
                                        value={lobby.difficulty}
                                        onChange={handleDifficultyChange}
                                        className="w-full rounded-lg mt-2 focus:outline-none focus:border-[#ff6b00]"
                                        style={{
                                            background: 'rgba(30, 30, 30, 0.8)',
                                            border: '2px solid #666',
                                            padding: '10px 12px',
                                            fontFamily: "'Courier New', monospace",
                                            fontSize: '1.3rem',
                                            color: '#fff',
                                        }}
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                        <option value="Mixed">Mixed</option>
                                    </select>
                                ) : (
                                    <p 
                                        className="w-full rounded-lg mt-2"
                                        style={{
                                            background: 'rgba(30, 30, 30, 0.8)',
                                            border: '2px solid #666',
                                            padding: '10px 12px',
                                            fontFamily: "'Courier New', monospace",
                                            fontSize: '1.3rem',
                                            color: '#fff',
                                        }}
                                    >
                                        {lobby.difficulty}
                                    </p>
                                )}
                            </div>

                            {isHost && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <label style={{ fontFamily: "'Courier New', monospace", fontSize: '1.3rem', color: '#ccc', fontWeight: 'bold' }}>
                                            Public Lobby
                                        </label>
                                        <Toggle checked={lobby.isPublic} onChange={handlePrivacyChange} />
                                    </div>
                                    
                                    <div style={{ borderTop: '2px solid #666', margin: '20px 0' }}></div>

                                    <h3
                                        style={{
                                            fontFamily: "'MK4', Impact, sans-serif",
                                            fontSize: '1.6rem',
                                            color: '#ffed4e',
                                            textShadow: '0 0 10px rgba(255, 237, 78, 0.5), 2px 2px 0px #000',
                                            letterSpacing: '0.05em',
                                        }}
                                    >
                                        Problem Selection
                                    </h3>

                                    <div>
                                        <label style={{ fontFamily: "'Courier New', monospace", fontSize: '1.3rem', color: '#ccc', fontWeight: 'bold' }}>
                                            Language
                                        </label>
                                        <select 
                                            value={language} 
                                            onChange={(e) => setLanguage(e.target.value)} 
                                            className="w-full rounded-lg mt-2 focus:outline-none focus:border-[#ff6b00]"
                                            style={{
                                                background: 'rgba(30, 30, 30, 0.8)',
                                                border: '2px solid #666',
                                                padding: '10px 12px',
                                                fontFamily: "'Courier New', monospace",
                                                fontSize: '1.3rem',
                                                color: '#fff',
                                            }}
                                        >
                                            <option>Python</option>
                                            <option>C</option>
                                            <option>C++</option>
                                            <option>Java</option>
                                            <option>JavaScript</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontFamily: "'Courier New', monospace", fontSize: '1.3rem', color: '#ccc', fontWeight: 'bold' }}>
                                            Max Problems
                                        </label>
                                        <input 
                                            type="number" 
                                            value={maxProblems} 
                                            onChange={(e) => setMaxProblems(parseInt(e.target.value, 10))} 
                                            className="w-full rounded-lg mt-2 focus:outline-none focus:border-[#ff6b00]"
                                            style={{
                                                background: 'rgba(30, 30, 30, 0.8)',
                                                border: '2px solid #666',
                                                padding: '10px 12px',
                                                fontFamily: "'Courier New', monospace",
                                                fontSize: '1.3rem',
                                                color: '#fff',
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontFamily: "'Courier New', monospace", fontSize: '1.3rem', color: '#ccc', fontWeight: 'bold' }}>
                                            Match Duration (seconds)
                                        </label>
                                        <input 
                                            type="number" 
                                            value={durationSec} 
                                            onChange={(e) => setDurationSec(parseInt(e.target.value, 10))} 
                                            className="w-full rounded-lg mt-2 focus:outline-none focus:border-[#ff6b00]"
                                            style={{
                                                background: 'rgba(30, 30, 30, 0.8)',
                                                border: '2px solid #666',
                                                padding: '10px 12px',
                                                fontFamily: "'Courier New', monospace",
                                                fontSize: '1.3rem',
                                                color: '#fff',
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col space-y-3">
                                        <div className="relative">
                                            <button 
                                                onClick={handleGenerateProblems} 
                                                className="w-full rounded-xl flex items-center justify-center space-x-2 transition-transform duration-200 hover:scale-105"
                                                style={{
                                                    fontFamily: "'Courier New', monospace",
                                                    fontWeight: 'bold',
                                                    letterSpacing: '0.05em',
                                                    padding: '10px 16px',
                                                    color: '#000',
                                                    backgroundImage: 'linear-gradient(90deg, #ffed4e, #ff9f43)',
                                                    border: '2px solid #ffed4e',
                                                    boxShadow: '0 0 10px rgba(255, 237, 78, 0.4)',
                                                }}
                                            >
                                                <span>Generate Random</span>
                                                <div className="group relative">
                                                    <Info className="h-5 w-5" />
                                                    <div 
                                                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 text-xs rounded-lg p-2 invisible group-hover:visible shadow-lg z-50"
                                                        style={{
                                                            background: 'rgba(20, 20, 20, 0.95)',
                                                            border: '2px solid #666',
                                                            color: '#fff',
                                                            fontFamily: "'Courier New', monospace",
                                                        }}
                                                    >
                                                        Problems are randomly selected based on the chosen language and difficulty. If difficulty is "Mixed", it will select from all difficulties.
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => setIsBrowserOpen(true)} 
                                            className="w-full rounded-xl transition-transform duration-200 hover:scale-105"
                                            style={{
                                                fontFamily: "'Courier New', monospace",
                                                fontWeight: 'bold',
                                                letterSpacing: '0.05em',
                                                padding: '10px 16px',
                                                color: '#000',
                                                backgroundImage: 'linear-gradient(90deg, #ffed4e, #ff9f43)',
                                                border: '2px solid #ffed4e',
                                                boxShadow: '0 0 10px rgba(255, 237, 78, 0.4)',
                                            }}
                                        >
                                            Browse
                                        </button>
                                    </div>

                                    <div style={{ borderTop: '2px solid #666', margin: '20px 0' }}></div>

                                    <button 
                                        onClick={handleDeleteLobby} 
                                        className="w-full rounded-xl flex items-center justify-center space-x-2 transition-transform duration-200 hover:scale-105"
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
                                        <Trash2 className="h-5 w-5" />
                                        <span>Delete Lobby</span>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Middle Column: Players & Controls */}
                        <div 
                            className="lg:col-span-2 col-span-1"
                            style={{
                                background: 'rgba(20, 20, 20, 0.85)',
                                border: '2px solid #ff6b00',
                                borderRadius: '8px',
                                padding: '24px',
                                boxShadow: '0 0 18px rgba(255, 107, 0, 0.35)',
                            }}
                        >
                            <h2 
                                className="flex items-center mb-4"
                                style={{
                                    fontFamily: "'MK4', Impact, sans-serif",
                                    fontSize: '1.8rem',
                                    color: '#ffed4e',
                                    textShadow: '0 0 10px rgba(255, 237, 78, 0.5), 2px 2px 0px #000',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                <Users className="mr-3" style={{ color: '#ff6b00' }} /> 
                                Participants ({lobby.participants.length}/{lobby.maxPlayers})
                            </h2>
                            
                            <div className="space-y-3 mb-6">
                                {lobby.participants.map(p => (
                                    <PlayerCard key={p.participantEmail} player={p} isHost={isHost} onKick={handleKickPlayer} />
                                ))}
                            </div>

                            {selectedProblems.length > 0 && (
                                <div className="mb-6">
                                    <h3 
                                        className="mb-4"
                                        style={{
                                            fontFamily: "'MK4', Impact, sans-serif",
                                            fontSize: '1.6rem',
                                            color: '#ffed4e',
                                            textShadow: '0 0 10px rgba(255, 237, 78, 0.5), 2px 2px 0px #000',
                                            letterSpacing: '0.05em',
                                        }}
                                    >
                                        Selected Problems
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedProblems.map(p => (
                                            <div 
                                                key={p.problemId} 
                                                className="flex items-center justify-between rounded-lg"
                                                style={{
                                                    background: 'rgba(30, 30, 30, 0.8)',
                                                    border: '2px solid #666',
                                                    padding: '12px',
                                                }}
                                            >
                                                <div>
                                                    <p style={{ color: '#fff', fontFamily: "'Courier New', monospace", fontSize: '1.3rem', fontWeight: 'bold' }}>
                                                        {p.title}
                                                    </p>
                                                    <p style={{ color: '#888', fontFamily: "'Courier New', monospace", fontSize: '1.1rem' }}>
                                                        {p.difficultyLevel}
                                                    </p>
                                                    <div className="mt-2">{renderTags(p.tags)}</div>
                                                </div>
                                                <button 
                                                    onClick={() => handleRemoveProblem(p.problemId)} 
                                                    style={{ color: '#ff3366' }}
                                                    className="hover:opacity-80"
                                                >
                                                    <XCircle className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3">
                                {!isParticipant && lobby.status === 'Open' && (
                                    <button 
                                        onClick={handleJoinLobby} 
                                        className="flex-1 rounded-xl flex items-center justify-center space-x-2 transition-transform duration-200 hover:scale-105"
                                        style={{
                                            fontFamily: "'Courier New', monospace",
                                            fontWeight: 'bold',
                                            letterSpacing: '0.05em',
                                            padding: '14px 20px',
                                            color: '#000',
                                            backgroundImage: 'linear-gradient(90deg, #4ade80, #22c55e)',
                                            border: '2px solid #4ade80',
                                            boxShadow: '0 0 12px rgba(74, 222, 128, 0.5)',
                                        }}
                                    >
                                        <UserPlus className="h-6 w-6" />
                                        <span>Join Lobby</span>
                                    </button>
                                )}
                                {isParticipant && !isHost && (
                                    <button 
                                        onClick={handleLeaveLobby} 
                                        className="flex-1 rounded-xl flex items-center justify-center space-x-2 transition-transform duration-200 hover:scale-105"
                                        style={{
                                            fontFamily: "'Courier New', monospace",
                                            fontWeight: 'bold',
                                            letterSpacing: '0.05em',
                                            padding: '14px 20px',
                                            color: '#fff',
                                            background: '#B71C1C',
                                            border: '2px solid #8B0000',
                                            boxShadow: '0 0 12px rgba(183, 28, 28, 0.4)',
                                        }}
                                    >
                                        <LogOut className="h-6 w-6" />
                                        <span>Leave Lobby</span>
                                    </button>
                                )}
                                {isHost && (
                                    <button 
                                        onClick={handleStartGame} 
                                        disabled={selectedProblems.length === 0} 
                                        className="flex-1 rounded-xl flex items-center justify-center space-x-2 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                                        style={{
                                            fontFamily: "'Courier New', monospace",
                                            fontWeight: 'bold',
                                            letterSpacing: '0.05em',
                                            padding: '14px 20px',
                                            color: '#000',
                                            backgroundImage: 'linear-gradient(90deg, #ffed4e, #ff9f43, #ff4d4d)',
                                            border: '2px solid #ffed4e',
                                            boxShadow: '0 0 12px rgba(255, 237, 78, 0.5)',
                                        }}
                                    >
                                        <Play className="h-6 w-6" />
                                        <span>Start Game</span>
                                    </button>
                                )}
                            </div>
                            {lobby.status !== 'Open' && (
                                <p 
                                    className="text-center mt-4"
                                    style={{
                                        fontFamily: "'Courier New', monospace",
                                        fontSize: '1.3rem',
                                        color: '#ffed4e',
                                    }}
                                >
                                    The lobby is {lobby.status.toLowerCase()}.
                                </p>
                            )}
                        </div>
                        
                        {/* Right Column: Chat */}
                        <div 
                            className="lg:col-span-1 col-span-1"
                            style={{
                                background: 'rgba(20, 20, 20, 0.85)',
                                border: '2px solid #ff6b00',
                                borderRadius: '8px',
                                padding: '24px',
                                boxShadow: '0 0 18px rgba(255, 107, 0, 0.35)',
                            }}
                        >
                            <h2 
                                className="flex items-center mb-4"
                                style={{
                                    fontFamily: "'MK4', Impact, sans-serif",
                                    fontSize: '1.8rem',
                                    color: '#ffed4e',
                                    textShadow: '0 0 10px rgba(255, 237, 78, 0.5), 2px 2px 0px #000',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                <MessageCircle className="mr-2" style={{ color: '#ff6b00' }} /> 
                                Lobby Chat
                            </h2>
                            
                            {lobbyConversationId ? (
                                <SimpleChatWindow
                                    conversationId={lobbyConversationId}
                                    currentUserEmail={user?.email}
                                    onSendMessage={handleSendMessage}
                                    messages={messages[lobbyConversationId] || []}
                                />
                            ) : (
                                <div 
                                    className="flex-1 max-h-[45vh] md:h-96 flex items-center justify-center"
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
            </div>
            <ProblemBrowserModal 
                isOpen={isBrowserOpen} 
                onClose={() => setIsBrowserOpen(false)} 
                onAddProblems={handleAddProblems} 
            />

            {/* Match Started Success Modal */}
            {showMatchStart && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />

                    {/* Modal card */}
                    <div
                        role="dialog"
                        aria-modal="true"
                        style={{
                            background: 'rgba(20, 20, 20, 0.95)',
                            border: '6px solid #4ade80',
                            borderRadius: '16px',
                            boxShadow: '0 0 60px rgba(74, 222, 128, 0.5)',
                        }}
                        className="relative z-10 w-full max-w-md mx-4 p-16 flex flex-col items-center gap-8"
                    >
                        <div
                            style={{
                                width: '160px',
                                height: '160px',
                                background: '#4ade80',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 0 40px rgba(74, 222, 128, 0.8)',
                            }}
                        >
                            <CheckCircle className="w-20 h-20 text-black" />
                        </div>

                        <h2
                            className="text-center"
                            style={{
                                fontFamily: "'MK4', Impact, Haettenschweiler, 'Arial Black', sans-serif",
                                fontSize: '3rem',
                                color: '#4ade80',
                                letterSpacing: '0.1em',
                                textShadow: '0 0 20px rgba(74, 222, 128, 0.8), 4px 4px 0px #000',
                            }}
                        >
                            MATCH STARTED!
                        </h2>
                        <p
                            className="text-center"
                            style={{
                                fontFamily: "'Courier New', monospace",
                                fontSize: '1.8rem',
                                color: '#ccc',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                            }}
                        >
                            Get Ready... Entering the Arena
                        </p>
                        <p
                            className="text-center"
                            style={{
                                fontFamily: "'Courier New', monospace",
                                fontSize: '1.4rem',
                                color: '#999',
                                letterSpacing: '0.08em',
                            }}
                        >
                            Navigating in a moment…
                        </p>
                    </div>
                </div>
            )}

        </>
    );
}
