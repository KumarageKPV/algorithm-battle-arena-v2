import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, User, Users, Trophy, Swords, PlayCircle, LogOut, TrendingUp, UserPlus, Calendar, Settings, Home, Medal, Search, X, Check } from 'lucide-react';
import apiService from '../services/api';
import { useAuth } from '../services/auth';
import ContactsSection from '../components/ContactsSection';
import ChatIcon from '../components/ChatIcon';

const StatCard = ({ icon, label, value }) => (
  <div
    style={{
      background: 'rgba(20, 20, 20, 0.85)',
      border: '2px solid #ff6b00',
      borderRadius: '6px',
      padding: '20px',
      boxShadow: '0 0 15px rgba(255, 107, 0, 0.3)',
    }}
    className="flex items-center space-x-4"
  >
    <div style={{ color: '#ffed4e' }}>{icon}</div>
    <div>
      <p
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '1.3rem',
          color: '#ccc',
          letterSpacing: '0.1em',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "'MK4', Impact, sans-serif",
          fontSize: '2.8rem',
          color: '#ffed4e',
          textShadow: '0 0 10px rgba(255, 237, 78, 0.5), 2px 2px 0px #000',
        }}
      >
        {value}
      </p>
    </div>
  </div>
);

const FriendListItem = ({ friend, onRemove, onChatStart }) => (
  <div 
    style={{
      background: 'rgba(30, 30, 30, 0.8)',
      border: '1px solid #666',
      borderRadius: '4px',
      padding: '12px',
    }}
    className="flex items-center justify-between"
  >
    <div className="flex items-center space-x-3">
      <User className="h-10 w-10" style={{ color: '#ffed4e' }} />
      <div>
        <p style={{ color: '#fff', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
          {friend.fullName}
        </p>
        <p style={{ color: '#888', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
          {friend.email}
        </p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <div 
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: friend.isOnline ? '#4ade80' : '#666',
          boxShadow: friend.isOnline ? '0 0 8px #4ade80' : 'none',
        }}
      />
      <ChatIcon 
        user={friend} 
        onChatStart={onChatStart}
        className="w-8 h-8"
      />
      <button 
        onClick={() => onRemove(friend.studentId)}
        style={{ color: '#ff3366' }}
        className="hover:opacity-80 p-1"
        title="Remove friend"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  </div>
);

export default function StudentDashboard() {
  const { logout } = useAuth();
  const [stats, setStats] = useState({ rank: 0, matchesPlayed: 0, winRate: 0 });
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [hoveredNav, setHoveredNav] = useState(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  
  // Friends state
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState({ received: [], sent: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(false);

  useEffect(() => {
    fetchUserStats();
    fetchProfile();
    fetchLeaderboard();
    fetchTeachers();
    fetchFriends();
    fetchFriendRequests();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await apiService.statistics.getUserStatistics();
      setStats({
        rank: response.data.rank || 0,
        matchesPlayed: response.data.matchesPlayed || 0,
        winRate: Math.round(response.data.winRate || 0)
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await apiService.auth.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await apiService.statistics.getLeaderboard();
      setLeaderboard(Array.isArray(response.data) ? response.data.slice(0, 5) : []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await apiService.teachers.getAll();
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleRequestTeacher = async (teacherId) => {
    try {
      await apiService.students.requestTeacher(teacherId);
      alert('Teacher request sent successfully!');
      setShowTeacherModal(false);
    } catch (error) {
      console.error('Error requesting teacher:', error);
      alert('Failed to send teacher request.');
    }
  };

  // Friends functions
  const fetchFriends = async () => {
    try {
      const response = await apiService.friends.getFriends();
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const [received, sent] = await Promise.all([
        apiService.friends.getReceivedRequests(),
        apiService.friends.getSentRequests()
      ]);
      setFriendRequests({ received: received.data, sent: sent.data });
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const searchStudents = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setFriendsLoading(true);
    try {
      const response = await apiService.friends.searchStudents(query);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching students:', error);
    } finally {
      setFriendsLoading(false);
    }
  };

  const sendFriendRequest = async (receiverId) => {
    try {
      await apiService.friends.sendFriendRequest(receiverId);
      alert('Friend request sent!');
      fetchFriendRequests();
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request.');
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      await apiService.friends.acceptFriendRequest(requestId);
      fetchFriends();
      fetchFriendRequests();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const rejectFriendRequest = async (requestId) => {
    try {
      await apiService.friends.rejectFriendRequest(requestId);
      fetchFriendRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  const removeFriend = async (friendId) => {
    if (confirm('Are you sure you want to remove this friend?')) {
      try {
        await apiService.friends.removeFriend(friendId);
        fetchFriends();
      } catch (error) {
        console.error('Error removing friend:', error);
      }
    }
  };

  const handleChatStart = (conversationId) => {
    // Chat functionality placeholder
    console.log('Chat started:', conversationId);
  };

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'analytics', label: 'STATS', icon: TrendingUp },
    { id: 'battle', label: 'BATTLE', icon: Swords },
    { id: 'contests', label: 'CONTESTS', icon: Calendar },
    { id: 'friends', label: 'CONTACTS', icon: UserPlus }
  ];

  const Card = ({ children }) => (
    <div
      style={{
        background: 'rgba(20, 20, 20, 0.85)',
        border: '2px solid #ff6b00',
        borderRadius: '6px',
        padding: '24px',
        boxShadow: '0 0 15px rgba(255, 107, 0, 0.3)',
      }}
    >
      {children}
    </div>
  );

  const CardTitle = ({ children }) => (
    <h3
      style={{
        fontFamily: "'MK4', Impact, sans-serif",
        fontSize: '2.2rem',
        color: '#ffed4e',
        textShadow: '0 0 10px rgba(255, 237, 78, 0.5), 2px 2px 0px #000',
        letterSpacing: '0.05em',
        marginBottom: '16px',
      }}
    >
      {children}
    </h3>
  );

  const Button = ({ children, onClick, variant = 'primary', className = '', size = 'md' }) => {
    const styles = {
      primary: {
        background: '#6B0F1A',
        border: '2px solid #4a0a0e',
        color: '#fff',
      },
      secondary: {
        background: 'rgba(40, 40, 40, 0.8)',
        border: '2px solid #666',
        color: '#ffed4e',
      },
    };

    const sizeStyles = {
      sm: { padding: '10px 20px', fontSize: '1.3rem' },
      md: { padding: '14px 28px', fontSize: '1.3rem' },
      lg: { padding: '18px 36px', fontSize: '1.4rem' },
      xl: { padding: '28px 56px', fontSize: '1.6rem' },
    };

    return (
      <button
        onClick={onClick}
        style={{
          ...styles[variant],
          padding: sizeStyles[size]?.padding || '14px 28px',
          borderRadius: '6px',
          fontFamily: "'Courier New', monospace",
          fontSize: sizeStyles[size]?.fontSize || '1.3rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          letterSpacing: '0.05em',
          transition: 'all 0.2s',
        }}
        className={`hover:opacity-90 ${className}`}
        onMouseEnter={(e) => {
          if (variant === 'primary') {
            e.currentTarget.style.background = '#8B1538';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(139, 21, 56, 0.5)';
          }
        }}
        onMouseLeave={(e) => {
          if (variant === 'primary') {
            e.currentTarget.style.background = '#6B0F1A';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        {children}
      </button>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            {/* Welcome */}
            <Card>
              <h2
                style={{
                  fontFamily: "'MK4', Impact, sans-serif",
                  fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                  color: '#ffed4e',
                  textShadow: '0 0 15px rgba(255, 237, 78, 0.6), 3px 3px 0px #000',
                  letterSpacing: '0.08em',
                  marginBottom: '8px',
                }}
              >
                WELCOME, {(profile?.fullName || 'WARRIOR').toUpperCase()}!
              </h2>
              <p
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '1.3rem',
                  color: '#ccc',
                  letterSpacing: '0.05em',
                }}
              >
                Ready to prove your skills in the coding arena?
              </p>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard 
                icon={<Trophy className="h-12 w-12" />} 
                label="CURRENT RANK" 
                value={loading ? "..." : `#${stats.rank}`} 
              />
              <StatCard 
                icon={<BarChart className="h-12 w-12" />} 
                label="MATCHES PLAYED" 
                value={loading ? "..." : stats.matchesPlayed} 
              />
              <StatCard 
                icon={<Medal className="h-12 w-12" />} 
                label="WIN RATE" 
                value={loading ? "..." : `${stats.winRate}%`} 
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardTitle>⚡ QUICK BATTLE</CardTitle>
                <div className="flex flex-col items-center justify-center py-4">
                  <div
                    style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(139,21,56,0.7), rgba(255,107,0,0.7))',
                      border: '4px solid #ff6b00',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 24px rgba(255, 107, 0, 0.6)'
                    }}
                  >
                    <Swords className="h-12 w-12" style={{ color: '#ffed4e' }} />
                  </div>
                  <Link to="/lobby" className="mt-6">
                    <Button variant="primary" size="xl" className="inline-flex items-center justify-center">
                      START
                    </Button>
                  </Link>
                </div>
              </Card>

              <Card>
                <CardTitle>🏅 TOP WARRIORS</CardTitle>
                {leaderboard.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {leaderboard.slice(0, 3).map((entry, index) => (
                      <div 
                        key={entry.participantEmail || index}
                        style={{
                          background: 'rgba(30, 30, 30, 0.8)',
                          border: '1px solid #666',
                          borderRadius: '4px',
                          padding: '10px 14px',
                        }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <span
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: index === 0 ? '#ffed4e' : index === 1 ? '#ccc' : '#ff6b00',
                              color: '#000',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: "'Courier New', monospace",
                              fontSize: '1.3rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {index + 1}
                          </span>
                          <p style={{ color: '#fff', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                            {entry.studentName || entry.participantEmail || 'Unknown'}
                          </p>
                        </div>
                        <span style={{ color: '#ffed4e', fontFamily: "'Courier New', monospace", fontSize: '1.3rem', fontWeight: 'bold' }}>
                          {entry.totalScore || entry.score || '0'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#888', textAlign: 'center', padding: '20px', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                    No data available
                  </p>
                )}
                <Button variant="secondary" onClick={() => setActiveTab('analytics')} className="w-full">
                  VIEW ALL
                </Button>
              </Card>
            </div>

            {/* Active Contests */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <CardTitle style={{ marginBottom: '0' }}>🏆 ACTIVE CONTESTS</CardTitle>
                <button
                  onClick={() => setActiveTab('contests')}
                  style={{
                    color: '#ffed4e',
                    fontFamily: "'Courier New', monospace",
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                  }}
                  className="hover:opacity-80"
                >
                  View All →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  style={{
                    background: 'linear-gradient(to right, rgba(139, 21, 56, 0.3), rgba(255, 107, 0, 0.3))',
                    border: '2px solid #ff6b00',
                    borderRadius: '8px',
                    padding: 'clamp(16px, 4vw, 48px)',
                  }}
                >
                  <h4
                    style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: '1.3rem',
                      color: '#fff',
                      fontWeight: 'bold',
                      marginBottom: '12px',
                    }}
                  >
                    Weekly Challenge #12
                  </h4>
                  <p
                    style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: '1.3rem',
                      color: '#ccc',
                      marginBottom: '16px',
                    }}
                  >
                    128 participants • Ends in 2 days
                  </p>
                  <Button variant="primary">
                    Join Contest
                  </Button>
                </div>
                <div
                  style={{
                    background: 'linear-gradient(to right, rgba(139, 21, 56, 0.3), rgba(255, 107, 0, 0.3))',
                    border: '2px solid #ff6b00',
                    borderRadius: '8px',
                    padding: 'clamp(16px, 4vw, 48px)',
                  }}
                >
                  <h4
                    style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: '1.3rem',
                      color: '#fff',
                      fontWeight: 'bold',
                      marginBottom: '12px',
                    }}
                  >
                    Algorithm Masters
                  </h4>
                  <p
                    style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: '1.3rem',
                      color: '#ccc',
                      marginBottom: '16px',
                    }}
                  >
                    256 participants • Ends in 5 days
                  </p>
                  <Button variant="primary">
                    Join Contest
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard icon={<Trophy className="h-12 w-12" />} label="RANK" value={loading ? "..." : `#${stats.rank}`} />
              <StatCard icon={<BarChart className="h-12 w-12" />} label="MATCHES" value={loading ? "..." : stats.matchesPlayed} />
              <StatCard icon={<Swords className="h-12 w-12" />} label="WIN RATE" value={loading ? "..." : `${stats.winRate}%`} />
            </div>
            
            <Card>
              <CardTitle>TOP PERFORMERS</CardTitle>
              {leaderboard.length > 0 ? (
                <>
                  <div className="space-y-3 mb-4">
                    {leaderboard.map((entry, index) => (
                      <div 
                        key={entry.participantEmail || index}
                        style={{
                          background: 'rgba(30, 30, 30, 0.8)',
                          border: '1px solid #666',
                          borderRadius: '4px',
                          padding: '14px',
                        }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <span
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              background: index === 0 ? '#ffed4e' : index === 1 ? '#ccc' : index === 2 ? '#ff6b00' : '#6B0F1A',
                              color: index < 3 ? '#000' : '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: "'Courier New', monospace",
                              fontSize: '1.3rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {index + 1}
                          </span>
                          <div>
                            <p style={{ color: '#fff', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                              {entry.studentName || entry.participantEmail || 'Unknown'}
                            </p>
                            {entry.participantEmail && entry.studentName && (
                              <p style={{ color: '#888', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                                {entry.participantEmail}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p style={{ color: '#ffed4e', fontFamily: "'Courier New', monospace", fontSize: '1.3rem', fontWeight: 'bold' }}>
                            {entry.totalScore || entry.score || '0'} PTS
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link to="/leaderboard" className="block">
                    <Button variant="secondary" className="w-full">
                      View Full Leaderboard
                    </Button>
                  </Link>
                </>
              ) : (
                <p style={{ color: '#888', textAlign: 'center', padding: '24px', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                  No leaderboard data
                </p>
              )}
            </Card>
          </div>
        );

      case 'friends':
        return (
          <div className="space-y-6">
            <Card>
              <div className="flex justify-between items-center mb-4">
                <CardTitle>CONTACTS ({friends.length})</CardTitle>
                <Button onClick={() => setShowAddFriendModal(true)}>
                  <div className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span>ADD</span>
                  </div>
                </Button>
              </div>
              <div className="space-y-3">
                {friends.length > 0 ? (
                  friends.map((friend) => (
                    <FriendListItem key={friend.studentId} friend={friend} onRemove={removeFriend} onChatStart={handleChatStart} />
                  ))
                ) : (
                  <p style={{ color: '#888', textAlign: 'center', padding: '24px', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                    No friends found
                  </p>
                )}
              </div>
            </Card>

            {friendRequests.received.length > 0 && (
              <Card>
                <CardTitle>FRIEND REQUESTS ({friendRequests.received.length})</CardTitle>
                <div className="space-y-3">
                  {friendRequests.received.map((request) => (
                    <div 
                      key={request.requestId}
                      style={{
                        background: 'rgba(30, 30, 30, 0.8)',
                        border: '1px solid #666',
                        borderRadius: '4px',
                        padding: '12px',
                      }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <User className="h-10 w-10" style={{ color: '#ffed4e' }} />
                        <div>
                          <p style={{ color: '#fff', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                            {request.senderName}
                          </p>
                          <p style={{ color: '#888', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                            {request.senderEmail}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => acceptFriendRequest(request.requestId)}
                          style={{ background: '#4ade80', border: '2px solid #000', borderRadius: '4px', padding: '8px' }}
                          className="hover:opacity-80"
                          title="Accept"
                        >
                          <Check className="h-4 w-4" style={{ color: '#000' }} />
                        </button>
                        <button 
                          onClick={() => rejectFriendRequest(request.requestId)}
                          style={{ background: '#ff3366', border: '2px solid #000', borderRadius: '4px', padding: '8px' }}
                          className="hover:opacity-80"
                          title="Reject"
                        >
                          <X className="h-4 w-4" style={{ color: '#000' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card>
              <CardTitle>CHAT CONTACTS</CardTitle>
              <div style={{ marginTop: '48px' }}>
                <ContactsSection studentId={profile?.id} friends={friends} />
              </div>
            </Card>

            <Card>
              <CardTitle>REQUEST TEACHER</CardTitle>
              <p style={{ color: '#ccc', fontFamily: "'Courier New', monospace", fontSize: '1.3rem', marginBottom: '20px' }}>
                Connect with a teacher to get guidance and track your progress.
              </p>
              <Button
                variant="primary"
                onClick={() => setShowTeacherModal(true)}
                className="w-full"
              >
                Browse Teachers
              </Button>
            </Card>

            {/* Add Friend Modal */}
            {showAddFriendModal && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div
                  style={{
                    background: 'rgba(20, 20, 20, 0.95)',
                    border: '3px solid #ff6b00',
                    borderRadius: '8px',
                    boxShadow: '0 0 30px rgba(255, 107, 0, 0.5)',
                    maxWidth: '500px',
                    width: '100%',
                    padding: '24px',
                  }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3
                      style={{
                        fontFamily: "'MK4', Impact, sans-serif",
                        fontSize: '1.6rem',
                        color: '#ffed4e',
                        textShadow: '0 0 10px rgba(255, 237, 78, 0.5), 2px 2px 0px #000',
                        letterSpacing: '0.05em',
                      }}
                    >
                      ADD FRIENDS
                    </h3>
                    <button 
                      onClick={() => {
                        setShowAddFriendModal(false);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      style={{ color: '#ff3366' }}
                      className="hover:opacity-80"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#888' }} />
                      <input
                        type="text"
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          searchStudents(e.target.value);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 10px 10px 40px',
                          background: 'rgba(30, 30, 30, 0.8)',
                          border: '2px solid #666',
                          borderRadius: '4px',
                          color: '#fff',
                          fontFamily: "'Courier New', monospace",
                          fontSize: '1.3rem',
                        }}
                        className="focus:outline-none focus:border-[#ff6b00]"
                      />
                    </div>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {friendsLoading ? (
                      <p style={{ color: '#ccc', textAlign: 'center', padding: '16px', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                        SEARCHING...
                      </p>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((student) => (
                        <div 
                          key={student.studentId}
                          style={{
                            background: 'rgba(30, 30, 30, 0.8)',
                            border: '1px solid #666',
                            borderRadius: '4px',
                            padding: '12px',
                          }}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <User className="h-6 w-6" style={{ color: '#ffed4e' }} />
                            <div>
                              <p style={{ color: '#fff', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                                {student.fullName}
                              </p>
                              <p style={{ color: '#888', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                                {student.email}
                              </p>
                            </div>
                          </div>
                          <Button onClick={() => sendFriendRequest(student.studentId)}>
                            ADD
                          </Button>
                        </div>
                      ))
                    ) : searchQuery.trim() ? (
                      <p style={{ color: '#888', textAlign: 'center', padding: '16px', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                        No results found
                      </p>
                    ) : (
                      <p style={{ color: '#888', textAlign: 'center', padding: '16px', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                        Start typing to search
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Teacher Modal */}
            {showTeacherModal && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div
                  style={{
                    background: 'rgba(20, 20, 20, 0.95)',
                    border: '3px solid #ff6b00',
                    borderRadius: '8px',
                    boxShadow: '0 0 30px rgba(255, 107, 0, 0.5)',
                    maxWidth: '640px',
                    width: '100%',
                    padding: '24px',
                    position: 'relative',
                  }}
                >
                  {/* Modal scanline overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-10">
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.5) 2px, rgba(0, 0, 0, 0.5) 4px)',
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center mb-2 relative z-10">
                    <h3
                      style={{
                        fontFamily: "'MK4', Impact, sans-serif",
                        fontSize: '1.6rem',
                        color: '#ffed4e',
                        textShadow: '0 0 10px rgba(255, 237, 78, 0.5), 2px 2px 0px #000',
                        letterSpacing: '0.05em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <Users className="h-6 w-6" />
                      SELECT TEACHER
                    </h3>
                    <button
                      onClick={() => setShowTeacherModal(false)}
                      style={{ color: '#ff3366' }}
                      className="hover:opacity-80 p-2"
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <p style={{ color: '#ccc', fontFamily: "'Courier New', monospace", fontSize: '1.3rem', marginBottom: '12px' }} className="relative z-10">
                    Choose a teacher to send a request.
                  </p>

                  <div className="space-y-3 max-h-96 overflow-y-auto relative z-10">
                    {teachers.map((teacher) => (
                      <div
                        key={teacher.teacherId}
                        style={{
                          background: 'rgba(30, 30, 30, 0.8)',
                          border: '1px solid #666',
                          borderRadius: '4px',
                          padding: '12px',
                        }}
                        className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0"
                      >
                        <div>
                          <p style={{ color: '#fff', fontFamily: "'Courier New', monospace", fontSize: '1.3rem', fontWeight: 'bold' }}>
                            {teacher.fullName}
                          </p>
                          <p style={{ color: '#888', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                            {teacher.email}
                          </p>
                        </div>
                        <Button onClick={() => handleRequestTeacher(teacher.teacherId)} className="w-full md:w-auto">
                          REQUEST
                        </Button>
                      </div>
                    ))}
                    {teachers.length === 0 && (
                      <p style={{ color: '#888', textAlign: 'center', padding: '24px', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                        No teachers available
                      </p>
                    )}
                  </div>

                  <div className="mt-4 relative z-10">
                    <Button variant="secondary" className="w-full" onClick={() => setShowTeacherModal(false)}>
                      CLOSE
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'contests':
        return (
          <div className="space-y-6">
            <Card>
              <CardTitle>ACTIVE CONTESTS</CardTitle>
              <div className="space-y-3">
                {['Weekly Challenge #12', 'Weekend Sprint', 'Algorithm Masters'].map((name, idx) => (
                  <div 
                    key={idx}
                    style={{
                      background: 'rgba(30, 30, 30, 0.8)',
                      border: '1px solid #666',
                      borderRadius: '4px',
                      padding: '18px',
                    }}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p style={{ color: '#fff', fontFamily: "'Courier New', monospace", fontSize: '1.3rem', fontWeight: 'bold' }}>
                        {name}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Users className="h-5 w-5" style={{ color: '#888' }} />
                        <span style={{ color: '#ccc', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                          {128 + idx * 64} participants
                        </span>
                      </div>
                    </div>
                    <Button>JOIN</Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardTitle>UPCOMING CONTESTS</CardTitle>
              <div className="space-y-3">
                <div
                  style={{
                    background: 'rgba(30, 30, 30, 0.8)',
                    border: '1px solid #666',
                    borderRadius: '4px',
                    padding: '14px',
                  }}
                >
                  <p style={{ color: '#fff', fontFamily: "'Courier New', monospace", fontSize: '1.3rem', fontWeight: 'bold' }}>
                    Monthly Championship
                  </p>
                  <p style={{ color: '#ccc', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                    Starts in 2 days
                  </p>
                </div>
                <div
                  style={{
                    background: 'rgba(30, 30, 30, 0.8)',
                    border: '1px solid #666',
                    borderRadius: '4px',
                    padding: '14px',
                  }}
                >
                  <p style={{ color: '#fff', fontFamily: "'Courier New', monospace", fontSize: '1.3rem', fontWeight: 'bold' }}>
                    Speed Coding Challenge
                  </p>
                  <p style={{ color: '#ccc', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                    Starts in 5 days
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'battle':
        return (
          <div className="space-y-6">
            <Card>
              <CardTitle>START BATTLE</CardTitle>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Button className="py-4 flex items-center justify-center space-x-2">
                  <PlayCircle className="h-5 w-5" />
                  <span>SOLO BATTLE</span>
                </Button>
                <Link to="/lobby" className="block">
                  <Button variant="primary" className="w-full py-4 flex items-center justify-center space-x-2">
                    <Swords className="h-5 w-5" />
                    <span>MULTIPLAYER</span>
                  </Button>
                </Link>
              </div>
            </Card>

            <Card>
              <CardTitle>AVAILABLE LOBBIES</CardTitle>
              <div className="space-y-3">
                {[
                  { name: "Beginner's Arena", players: '8/10' },
                  { name: "Data Structures Duel", players: '4/10' },
                  { name: "DP Dojo", players: '6/10' }
                ].map((lobby, idx) => (
                  <div 
                    key={idx}
                    style={{
                      background: 'rgba(30, 30, 30, 0.8)',
                      border: '1px solid #666',
                      borderRadius: '4px',
                      padding: '18px',
                    }}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p style={{ color: '#fff', fontFamily: "'Courier New', monospace", fontSize: '1.3rem', fontWeight: 'bold' }}>
                        {lobby.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Users className="h-5 w-5" style={{ color: '#888' }} />
                        <span style={{ color: '#ccc', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                          {lobby.players} players
                        </span>
                      </div>
                    </div>
                    <Button>JOIN</Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'profile':
        return (
          <Card>
            <CardTitle>PROFILE</CardTitle>
            {profile ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: '#6B0F1A',
                      border: '2px solid #ff6b00',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 15px rgba(255, 107, 0, 0.5)',
                    }}
                  >
                    <User className="h-8 w-8" style={{ color: '#ffed4e' }} />
                  </div>
                  <div>
                    <h4
                      style={{
                        fontFamily: "'MK4', Impact, sans-serif",
                        fontSize: '1.5rem',
                        color: '#ffed4e',
                        textShadow: '0 0 10px rgba(255, 237, 78, 0.5), 2px 2px 0px #000',
                      }}
                    >
                      {profile.fullName}
                    </h4>
                    <p style={{ color: '#ccc', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                      {profile.email}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    style={{
                      background: 'rgba(30, 30, 30, 0.8)',
                      border: '1px solid #666',
                      borderRadius: '4px',
                      padding: '14px',
                    }}
                  >
                    <p style={{ color: '#888', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                      STUDENT ID
                    </p>
                    <p style={{ color: '#ffed4e', fontFamily: "'Courier New', monospace", fontSize: '1.3rem', fontWeight: 'bold' }}>
                      {profile.id}
                    </p>
                  </div>
                  <div
                    style={{
                      background: 'rgba(30, 30, 30, 0.8)',
                      border: '1px solid #666',
                      borderRadius: '4px',
                      padding: '14px',
                    }}
                  >
                    <p style={{ color: '#888', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                      STATUS
                    </p>
                    <p
                      style={{
                        color: profile.active ? '#4ade80' : '#ff3366',
                        fontFamily: "'Courier New', monospace",
                        fontSize: '1.3rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {profile.active ? 'ACTIVE' : 'INACTIVE'}
                    </p>
                  </div>
                </div>
                <Button className="w-full flex items-center justify-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>EDIT PROFILE</span>
                </Button>
              </div>
            ) : (
              <p style={{ color: '#888', fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}>
                Loading profile...
              </p>
            )}
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0 bg-black">
        <img
          src="/images/LandingPage.jpg"
          alt="Arena Background"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.5) 2px, rgba(0, 0, 0, 0.5) 4px)',
          }}
        ></div>
      </div>

      {/* Top Navigation */}
      <nav
        style={{
          background: 'rgba(20, 20, 20, 0.95)',
          borderBottom: '4px solid #ff6b00',
          boxShadow: '0 0 30px rgba(255, 107, 0, 0.5)',
        }}
        className="relative z-10"
      >
        <style>{`
.aba-nav-btn,
.aba-nav-btn:focus,
.aba-nav-btn:hover,
.aba-nav-btn:active,
.aba-nav-btn:focus-visible {
  outline: none !important;
  box-shadow: none !important;
}
.aba-nav-btn::-moz-focus-inner { border: 0 !important; }
.aba-nav-btn:-moz-focusring { outline: none !important; }
.aba-nav-btn { -webkit-tap-highlight-color: transparent; }
`}</style>
        <div className="w-full px-4 sm:px-8 py-4 sm:py-6">
          {/* Logo - Centered and Prominent */}
          <div className="flex justify-center items-center mb-6">
            <div className="flex items-center space-x-4">
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  background: '#6B0F1A',
                  border: '4px solid #ff6b00',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(255, 107, 0, 0.6)',
                }}
              >
                <Trophy className="h-10 w-10" style={{ color: '#ffed4e' }} />
              </div>
              <div>
                <h1
                  style={{
                    fontFamily: "'MK4', Impact, sans-serif",
                    fontSize: '3rem',
                    color: '#ffed4e',
                    textShadow: '0 0 15px rgba(255, 237, 78, 0.7), 3px 3px 0px #000',
                    letterSpacing: '0.08em',
                  }}
                >
                  ALGORITHM BATTLE ARENA
                </h1>
              </div>
            </div>
          </div>

          {/* Nav Items and User - Centered under title */}
          <div className="grid grid-cols-3 items-center gap-4 justify-center">
            {/* Left spacer (empty) */}
            <div></div>
            {/* Nav Items - Center column, centered */}
            <div className="flex items-center space-x-2 justify-center w-full flex-shrink-0 min-w-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: '1.3rem',
                      fontWeight: 'bold',
                      letterSpacing: '0.05em',
                      padding: '12px 20px',
                      color: activeTab === item.id ? '#ffed4e' : (hoveredNav === item.id ? '#ff3366' : '#ccc'),
                      borderBottom: activeTab === item.id ? '3px solid #ffed4e' : (hoveredNav === item.id ? '3px solid #ff3366' : '3px solid transparent'),
                      borderTop: '3px solid transparent',
                      borderLeft: '3px solid transparent',
                      borderRight: '3px solid transparent',
                      transition: 'all 0.2s',
                      outline: '0',
                      outlineColor: 'transparent',
                      outlineStyle: 'none',
                      outlineWidth: '0px',
                      outlineOffset: '0px',
                      boxShadow: 'none',
                      MozOutlineStyle: 'none',
                      WebkitAppearance: 'none',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    className="aba-nav-btn flex items-center space-x-2 hover:opacity-80 focus:outline-none focus:ring-0"
                    onMouseEnter={(e) => { setHoveredNav(item.id); e.currentTarget.blur(); e.currentTarget.style.outline = '0'; e.currentTarget.style.boxShadow = 'none'; }}
                    onMouseLeave={() => setHoveredNav(null)}
                    onMouseDown={(e) => { e.preventDefault(); }}
                    onFocus={(e) => { e.currentTarget.style.outline = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                    onBlur={(e) => { e.currentTarget.style.outline = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="hidden md:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User & Logout - Right side column */}
            <div className="flex items-center space-x-4 justify-end flex-shrink-0 min-w-[120px]">
              <div className="hidden md:block" aria-hidden="true" style={{ width: '2px', height: '32px', background: '#666' }} />
              {/* Make profile area a reliable, accessible click target */}
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                title="Profile"
                className="aba-nav-btn flex items-center space-x-3 focus:outline-none z-20"
                style={{
                  background: 'transparent',
                  border: '0',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveTab('profile');
                  }
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: '#6B0F1A',
                    border: '3px solid #ff6b00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User className="h-7 w-7" style={{ color: '#ffed4e' }} />
                </div>
                <span
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '1.3rem',
                    color: '#ffed4e',
                    fontWeight: 'bold',
                  }}
                  className="hidden md:inline"
                >
                  {profile?.fullName || 'Warrior'}
                </span>
              </button>
              <button
                onClick={handleLogout}
                style={{ color: '#ff3366' }}
                className="p-2 hover:opacity-80"
                title="Logout"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-8 lg:px-12 py-8 relative z-10">
        {activeTab !== 'home' && (
          <div className="mb-6">
            <h2
              style={{
                fontFamily: "'MK4', Impact, sans-serif",
                fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                color: '#ffed4e',
                textShadow: '0 0 15px rgba(255, 237, 78, 0.6), 3px 3px 0px #000',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {activeTab}
            </h2>
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
}
