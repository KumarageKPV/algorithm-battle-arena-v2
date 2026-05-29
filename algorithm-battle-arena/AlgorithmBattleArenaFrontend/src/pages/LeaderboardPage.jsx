import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import apiService from '../services/api';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await apiService.statistics.getLeaderboard();
      setLeaderboard(response.data);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-black">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-black">
          <img src="/images/LandingPage.jpg" alt="Arena Background" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        </div>
        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="w-full h-full" style={{backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.5) 2px,rgba(0,0,0,0.5) 4px)'}}></div>
        </div>
        <div className="relative z-10 text-center">
          <div className="text-3xl font-bold text-yellow-300" style={{fontFamily:"'MK4', Impact, Haettenschweiler, 'Arial Black', sans-serif",WebkitTextStroke:'1.5px #ff6b00',textShadow:'3px 3px 0px #ff6b00, 6px 6px 0px #000, 0 0 20px #ffed4e'}}>
            Loading leaderboard...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-black">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-black">
          <img src="/images/LandingPage.jpg" alt="Arena Background" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        </div>
        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="w-full h-full" style={{backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.5) 2px,rgba(0,0,0,0.5) 4px)'}}></div>
        </div>
        <div className="relative z-10 text-center">
          <div className="text-3xl font-bold text-red-500" style={{fontFamily:"'MK4', Impact, Haettenschweiler, 'Arial Black', sans-serif",WebkitTextStroke:'1.5px #ff6b00',textShadow:'3px 3px 0px #ff6b00, 6px 6px 0px #000, 0 0 20px #ffed4e'}}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-black">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-black">
        <img src="/images/LandingPage.jpg" alt="Arena Background" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
      </div>
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="w-full h-full" style={{backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.5) 2px,rgba(0,0,0,0.5) 4px)'}}></div>
      </div>
      {/* Main Content */}
      <div className="relative z-10 w-full max-w-none mx-auto px-4 lg:px-12 py-12 flex flex-col gap-8">
        {/* Back Button */}
        <div className="flex items-center gap-4 mb-2">
          <Link to="/student-dashboard"
            className="aba-nav-btn flex items-center gap-2 px-6 py-3 rounded-xl border-b-4 border-yellow-400 bg-black/80 hover:bg-[#6B0F1A] transition-all shadow-lg"
            style={{fontFamily:"'Courier New', monospace", fontWeight:'bold', fontSize:'1.3rem', letterSpacing:'0.05em', color:'#ffed4e', borderBottom:'3px solid #ffed4e'}}>
            <ArrowLeft className="h-6 w-6 mr-1 text-yellow-600" />
            Back to Home
          </Link>
        </div>
        {/* Title & Subtitle */}
        <div className="text-center mb-6">
          <h1 className="select-none" style={{fontSize:'clamp(3rem,8vw,5rem)',fontFamily:"'MK4', Impact, Haettenschweiler, 'Arial Black', sans-serif",fontWeight:'900',color:'#ffed4e',WebkitTextStroke:'2px #ff6b00',textShadow:'4px 4px 0px #ff6b00, 8px 8px 0px #000, 0 0 30px #ffed4e'}}>
            LEADERBOARD
          </h1>
        </div>
        {/* Card/Table */}
        <div className="rounded-3xl border-4 border-[#ff6b00] bg-black/80 shadow-2xl backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full" style={{ minWidth: '1800px' }}>
              <thead style={{background:'rgba(255,237,78,0.08)'}}>
                  <tr>
                  <th className="px-10 py-6 text-center font-bold uppercase tracking-wider min-w-[140px]" style={{fontFamily:"'Courier New', monospace",fontSize:'1.25rem',letterSpacing:'0.06em'}}>Rank</th>
                  <th className="px-10 py-6 text-center font-bold uppercase tracking-wider min-w-[380px]" style={{fontFamily:"'Courier New', monospace",fontSize:'1.25rem',letterSpacing:'0.06em'}}>Participant</th>
                  <th className="px-10 py-6 text-center font-bold uppercase tracking-wider min-w-[210px]" style={{fontFamily:"'Courier New', monospace",fontSize:'1.25rem',letterSpacing:'0.06em'}}>Total Score</th>
                  <th className="px-10 py-6 text-center font-bold uppercase tracking-wider min-w-[240px]" style={{fontFamily:"'Courier New', monospace",fontSize:'1.25rem',letterSpacing:'0.06em'}}>Problems Completed</th>
                  <th className="px-10 py-6 text-center font-bold uppercase tracking-wider min-w-[210px] hidden sm:table-cell" style={{fontFamily:"'Courier New', monospace",fontSize:'1.25rem',letterSpacing:'0.06em'}}>Matches Played</th>
                  <th className="px-10 py-6 text-center font-bold uppercase tracking-wider min-w-[190px] hidden md:table-cell" style={{fontFamily:"'Courier New', monospace",fontSize:'1.25rem',letterSpacing:'0.06em'}}>Win Rate</th>
                  <th className="px-10 py-6 text-center font-bold uppercase tracking-wider min-w-[210px] hidden lg:table-cell" style={{fontFamily:"'Courier New', monospace",fontSize:'1.25rem',letterSpacing:'0.06em'}}>Last Activity</th>
                  </tr>
                </thead>
              <tbody className="bg-transparent divide-y divide-[#ff6b00]/30">
                {leaderboard.map((entry) => {
                  // Top 3: gold, silver, bronze fill + glow; rest: red fill
                  let fill, border, color, glow;
                  if (entry.rank === 1) {
                    fill = '#FFD700'; border = '3px solid #FFD700'; color = '#222'; glow = '0 0 20px #FFD700';
                  } else if (entry.rank === 2) {
                    fill = '#C0C0C0'; border = '3px solid #C0C0C0'; color = '#222'; glow = '0 0 20px #C0C0C0';
                  } else if (entry.rank === 3) {
                    fill = '#CD7F32'; border = '3px solid #CD7F32'; color = '#222'; glow = '0 0 20px #CD7F32';
                  } else {
                    fill = '#B71C1C'; border = '2px solid #B71C1C'; color = '#fff'; glow = 'none';
                  }
                  return (
                    <tr key={entry.participantEmail} className="hover:bg-[#ff6b00]/10 transition-all">
                      <td className="px-10 py-5 text-center">
                        <span
                          className="inline-flex items-center justify-center w-14 h-14 rounded-full text-3xl font-extrabold shadow-lg"
                          style={{ background: fill, border, color, boxShadow: glow }}
                        >
                          {entry.rank}
                        </span>
                      </td>
                      <td className="px-10 py-5 text-center">
                        <div className="font-bold" style={{fontFamily:'Courier New, monospace',fontSize:'1.2rem',color:'#fff',textShadow:'1px 1px 0px #000'}}>
                          {entry.participantEmail}
                        </div>
                      </td>
                      <td className="px-10 py-5 text-center whitespace-nowrap">
                        <div className="font-bold" style={{fontFamily:'Courier New, monospace',fontSize:'1.2rem',color:'#ffed4e',textShadow:'1px 1px 0px #000'}}>
                          {entry.totalScore}
                        </div>
                      </td>
                      <td className="px-10 py-5 text-center whitespace-nowrap">
                        <div className="font-bold" style={{fontFamily:'Courier New, monospace',fontSize:'1.2rem',color:'#ff3366',textShadow:'1px 1px 0px #000'}}>
                          {entry.problemsCompleted}
                        </div>
                      </td>
                      <td className="px-10 py-5 text-center hidden sm:table-cell whitespace-nowrap">
                        <div className="font-bold" style={{fontFamily:'Courier New, monospace',fontSize:'1.2rem',color:'#ff6b00',textShadow:'1px 1px 0px #000'}}>
                          {entry.matchesPlayed}
                        </div>
                      </td>
                      <td className="px-10 py-5 text-center hidden md:table-cell whitespace-nowrap">
                        <div className="font-bold" style={{fontFamily:'Courier New, monospace',fontSize:'1.2rem',color:'#4ade80',textShadow:'1px 1px 0px #000'}}>
                          {entry.winRate}
                        </div>
                      </td>
                      <td className="px-10 py-5 font-bold text-center hidden lg:table-cell whitespace-nowrap" style={{fontFamily:'Courier New, monospace',fontSize:'1.2rem',color:'#ccc',textShadow:'1px 1px 0px #000'}}>
                        {entry.lastSubmission ? new Date(entry.lastSubmission).toLocaleDateString() : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {leaderboard.length === 0 && (
            <div className="text-center py-8">
              <p className="font-bold" style={{fontFamily:"'Courier New', monospace",fontSize:'1.3rem',color:'#ff3366',textShadow:'1px 1px 0px #000'}}>
                No leaderboard data available yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;