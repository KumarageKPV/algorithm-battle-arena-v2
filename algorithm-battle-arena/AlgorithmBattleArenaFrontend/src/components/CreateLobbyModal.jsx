import React, { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';

export default function CreateLobbyModal({ isOpen, onClose, onCreate }) {
    const [name, setName] = useState('New Lobby');
    const [maxPlayers, setMaxPlayers] = useState(10);
    const [mode, setMode] = useState('1v1');

    useEffect(() => {
        if (mode === '1v1') {
            setMaxPlayers(2);
        }
    }, [mode]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (name.trim() === '') return;
        onCreate({ name, maxPlayers, mode, difficulty: 'Medium' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div
                className="relative w-full"
                style={{
                    background: 'rgba(20, 20, 20, 0.95)',
                    border: '3px solid #ff6b00',
                    borderRadius: '8px',
                    boxShadow: '0 0 30px rgba(255, 107, 0, 0.5)',
                    maxWidth: '640px',
                    padding: '24px',
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

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 hover:opacity-80 p-2"
                    style={{ color: '#ff3366' }}
                    aria-label="Close"
                >
                    <X />
                </button>

                <div className="relative z-10 mb-4 flex items-center gap-3">
                    <Users className="h-6 w-6" style={{ color: '#ffed4e' }} />
                    <h2
                        style={{
                            fontFamily: "'MK4', Impact, sans-serif",
                            fontSize: 'clamp(1.4rem, 4vw, 1.8rem)',
                            color: '#ffed4e',
                            textShadow: '0 0 10px rgba(255, 237, 78, 0.5), 2px 2px 0px #000',
                            letterSpacing: '0.05em',
                        }}
                    >
                        CREATE NEW LOBBY
                    </h2>
                </div>

                <div className="space-y-4 relative z-10">
                    <div>
                        <label
                            className="mb-2 block"
                            style={{ fontFamily: "'Courier New', monospace", fontSize: '1.3rem', color: '#ccc' }}
                        >
                            Lobby Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label
                                className="mb-2 block"
                                style={{ fontFamily: "'Courier New', monospace", fontSize: '1.3rem', color: '#ccc' }}
                            >
                                Mode
                            </label>
                            <select
                                value={mode}
                                onChange={(e) => setMode(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'rgba(30, 30, 30, 0.8)',
                                    border: '2px solid #666',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontFamily: "'Courier New', monospace",
                                    fontSize: '1.3rem',
                                }}
                                className="focus:outline-none focus:border-[#ff6b00]"
                            >
                                <option value="1v1">1v1</option>
                                <option value="Team">Team</option>
                                <option value="FreeForAll">Free For All</option>
                            </select>
                        </div>
                        <div>
                            <label
                                className="mb-2 block"
                                style={{ fontFamily: "'Courier New', monospace", fontSize: '1.3rem', color: '#ccc' }}
                            >
                                Max Players
                            </label>
                            <input
                                type="number"
                                value={maxPlayers}
                                onChange={(e) => setMaxPlayers(parseInt(e.target.value, 10))}
                                min="2"
                                max="20"
                                disabled={mode === '1v1'}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: 'rgba(30, 30, 30, 0.8)',
                                    border: '2px solid #666',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontFamily: "'Courier New', monospace",
                                    fontSize: '1.3rem',
                                }}
                                className="focus:outline-none focus:border-[#ff6b00] disabled:opacity-70"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 relative z-10">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto"
                        style={{
                            background: 'rgba(40, 40, 40, 0.8)',
                            border: '2px solid #666',
                            color: '#ffed4e',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            fontFamily: "'Courier New', monospace",
                            fontSize: '1.3rem',
                            fontWeight: 'bold',
                            letterSpacing: '0.05em',
                            transition: 'opacity 0.2s',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="w-full sm:w-auto hover:opacity-90"
                        style={{
                            background: '#6B0F1A',
                            border: '2px solid #4a0a0e',
                            color: '#fff',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            fontFamily: "'Courier New', monospace",
                            fontSize: '1.3rem',
                            fontWeight: 'bold',
                            letterSpacing: '0.05em',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#8B1538';
                            e.currentTarget.style.boxShadow = '0 0 15px rgba(139, 21, 56, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#6B0F1A';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        Create Lobby
                    </button>
                </div>
            </div>
        </div>
    );
}