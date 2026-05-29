import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, PlusSquare, Swords, Loader2, ArrowLeft } from 'lucide-react';
import apiService from '../services/api';
import CreateLobbyModal from '../components/CreateLobbyModal';
import { useAuth } from '../services/auth';

const LobbyItem = ({ lobby, onJoin }) => (
  <div
    className="rounded-2xl flex items-center justify-between"
    style={{
      background: 'rgba(20,20,20,0.85)',
      border: '2px solid #ff6b00',
      padding: '18px 20px',
      boxShadow: '0 0 18px rgba(255, 107, 0, 0.35)'
    }}
  >
    <Link to={`/lobby/${lobby.lobbyId}`} className="flex-grow">
      <div>
        <p style={{ fontFamily: "'Courier New', monospace", fontSize: '1.3rem', color: '#fff', fontWeight: 'bold', letterSpacing: '0.04em' }}>{lobby.lobbyName}</p>
        <p style={{ fontFamily: "'Courier New', monospace", fontSize: '1.1rem', color: '#ff3366' }}>{lobby.mode}</p>
      </div>
    </Link>
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Users className="h-6 w-6" style={{ color: '#ffed4e' }} />
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: '1.2rem', color: '#ffed4e', fontWeight: 'bold' }}>{lobby.participants.length}/{lobby.maxPlayers}</span>
      </div>
      <button
        onClick={() => onJoin(lobby.lobbyCode)}
        className="rounded-xl transition-transform duration-200 hover:scale-105"
        style={{
          fontFamily: "'Courier New', monospace",
          fontWeight: 'bold',
          letterSpacing: '0.05em',
          padding: '10px 18px',
          color: '#000',
          backgroundImage: 'linear-gradient(90deg,#ffed4e,#ff9f43,#ff4d4d)',
          border: '2px solid #ffed4e',
          boxShadow: '0 0 10px rgba(255,237,78,0.5)'
        }}
      >
        Join
      </button>
    </div>
  </div>
);

export default function LobbyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lobbies, setLobbies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    const fetchLobbies = async () => {
      setIsLoading(true);
      console.log('Fetching lobbies...');
      try {
        const response = await apiService.lobbies.getAll();
        console.log('Lobbies fetched successfully:', response.data);
        setLobbies(response.data);
      } catch (error) {
        console.error('Failed to fetch lobbies:', error);
        console.error('Error details:', error.response);
      }
      setIsLoading(false);
    };

    fetchLobbies();
  }, []);

  // Refresh lobbies when component becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const fetchLobbies = async () => {
          try {
            const response = await apiService.lobbies.getAll();
            setLobbies(response.data);
          } catch (error) {
            console.error('Failed to fetch lobbies:', error);
          }
        };
        fetchLobbies();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleCreateLobby = async (lobbyData) => {
    try {
      const response = await apiService.lobbies.create(lobbyData);
      setIsModalOpen(false);
      navigate(`/lobby/${response.data.lobbyId}?new=true`);
    } catch (error) {
      console.error('Failed to create lobby:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create lobby';
      alert(errorMessage);
    }
  };

  const handleJoinLobby = async (lobbyCode) => {
    console.log('Attempting to join lobby with code:', lobbyCode);
    try {
      const response = await apiService.lobbies.join(lobbyCode);
      console.log('Join lobby response:', response.data);
      navigate(`/lobby/${response.data.lobbyId}`);
    } catch (error) {
      console.error('Failed to join lobby:', error);
      console.error('Error details:', error.response);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to join lobby';
      alert(errorMessage);
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

  return (
    <>
      <div className="relative min-h-screen w-full bg-black text-white">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-black">
          <img src="/images/LandingPage.jpg" alt="Arena Background" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        </div>
        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="w-full h-full" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.5) 2px,rgba(0,0,0,0.5) 4px)' }}></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-none mx-auto px-4 lg:px-12 py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Swords className="h-12 w-12" style={{ color: '#ffed4e' }} />
              <h1
                className="select-none"
                style={{
                  fontFamily: "'MK4', Impact, Haettenschweiler, 'Arial Black', sans-serif",
                  fontSize: 'clamp(2.5rem,6vw,4rem)',
                  color: '#ffed4e',
                  WebkitTextStroke: '2px #ff6b00',
                  textShadow: '4px 4px 0px #ff6b00, 8px 8px 0px #000, 0 0 30px #ffed4e'
                }}
              >
                LOBBIES
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="rounded-xl transition-transform duration-200 hover:scale-105 flex items-center gap-2"
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  padding: '12px 18px',
                  color: '#000',
                  backgroundImage: 'linear-gradient(90deg,#ffed4e,#ff9f43,#ff4d4d)',
                  border: '2px solid #ffed4e',
                  boxShadow: '0 0 12px rgba(255,237,78,0.5)'
                }}
              >
                <PlusSquare className="h-6 w-6" />
                <span>Create New Lobby</span>
              </button>
              <button
                onClick={handleBackToDashboard}
                className="aba-nav-btn rounded-xl flex items-center gap-2 hover:opacity-80"
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  padding: '12px 18px',
                  color: '#ffed4e',
                  background: 'rgba(20,20,20,0.9)',
                  borderBottom: '3px solid #ffed4e',
                  borderTop: '3px solid transparent',
                  borderLeft: '3px solid transparent',
                  borderRight: '3px solid transparent'
                }}
              >
                <ArrowLeft className="h-6 w-6" style={{ color: '#ff6b00' }} />
                <span>Dashboard</span>
              </button>
            </div>
          </div>

          {/* Join Private Lobby */}
          <div className="mb-8">
            <h2
              className="mb-3 select-none"
              style={{
                fontFamily: "'MK4', Impact, Haettenschweiler, 'Arial Black', sans-serif",
                fontSize: 'clamp(1.6rem,4vw,2.2rem)',
                color: '#ffed4e',
                textShadow: '0 0 15px rgba(255, 237, 78, 0.6), 3px 3px 0px #000',
                letterSpacing: '0.08em'
              }}
            >
              JOIN A PRIVATE LOBBY
            </h2>
            <div
              className="flex items-center gap-3 rounded-2xl"
              style={{ background: 'rgba(20,20,20,0.85)', border: '2px solid #ff6b00', padding: '10px', boxShadow: '0 0 18px rgba(255, 107, 0, 0.35)' }}
            >
              <input
                type="text"
                placeholder="Enter lobby code..."
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="w-full rounded-lg outline-none"
                style={{ background: 'transparent', color: '#fff', fontFamily: "'Courier New', monospace", fontSize: '1.2rem', padding: '10px 12px' }}
              />
              <button
                onClick={() => handleJoinLobby(joinCode)}
                className="rounded-xl transition-transform duration-200 hover:scale-105"
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  padding: '10px 18px',
                  color: '#000',
                  backgroundImage: 'linear-gradient(90deg,#ffed4e,#ff9f43,#ff4d4d)',
                  border: '2px solid #ffed4e',
                  boxShadow: '0 0 10px rgba(255,237,78,0.5)'
                }}
              >
                Join
              </button>
            </div>
          </div>

          {/* Available Lobbies */}
          <div className="space-y-4">
            <h2
              className="select-none"
              style={{
                fontFamily: "'MK4', Impact, Haettenschweiler, 'Arial Black', sans-serif",
                fontSize: 'clamp(1.6rem,4vw,2.2rem)',
                color: '#ffed4e',
                textShadow: '0 0 15px rgba(255, 237, 78, 0.6), 3px 3px 0px #000',
                letterSpacing: '0.08em'
              }}
            >
              AVAILABLE LOBBIES
            </h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="w-12 h-12 animate-spin" style={{ color: '#ffed4e' }} />
              </div>
            ) : lobbies.length > 0 ? (
              lobbies.map(lobby => <LobbyItem key={lobby.lobbyId} lobby={lobby} onJoin={handleJoinLobby} />)
            ) : (
              <p className="text-center" style={{ fontFamily: "'Courier New', monospace", fontSize: '1.2rem', color: '#ccc' }}>
                No lobbies available. Why not create one?
              </p>
            )}
          </div>
        </div>
      </div>

      <CreateLobbyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateLobby}
      />
    </>
  );
}
