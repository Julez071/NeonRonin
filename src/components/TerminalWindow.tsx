import React, { useEffect, useRef } from 'react';
import type { GameMessage } from '../types';

interface TerminalWindowProps {
    history: GameMessage[];
}

export const TerminalWindow: React.FC<TerminalWindowProps> = ({ history }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    return (
        <div className="flex-1 overflow-y-auto p-6 font-mono space-y-4">
            <div className="text-zinc-500 mb-8 text-center text-sm border-b border-zinc-800 pb-4">
                WELCOME TO NEON-TOKYO SIMULATION v1.0<br />
                -------------------------------------<br />
                INITIALIZING LINGUISTIC PROTOCOLS...<br />
                CONNECTED TO GAME ENGINE.
            </div>

            {history.map((msg, idx) => (
                <div key={idx} className={`animate-in fade-in slide-in-from-bottom-2 duration-300 leading-relaxed`}>
                    {/* User Message */}
                    {msg.type === 'user' && (
                        <div className="text-neon-green font-bold mb-1">
                            {'>'} {msg.content}
                        </div>
                    )}

                    {/* Narrative Message */}
                    {msg.type === 'narrative' && (
                        <div className="text-zinc-100 whitespace-pre-wrap">
                            {msg.content}
                        </div>
                    )}

                    {/* Sidekick Whisper */}
                    {msg.type === 'sidekick' && (
                        <div className="text-cyber-pink italic mt-1 ml-4 border-l-2 border-cyber-pink pl-3 py-1 bg-cyber-pink/5 rounded-r">
                            <span className="font-bold not-italic text-xs block mb-1">[🤖 KAITO]:</span>
                            "{msg.content}"
                        </div>
                    )}

                    {/* System Message (Game Over etc) */}
                    {msg.type === 'system' && (
                        <div className="text-warning-red font-bold text-center border border-warning-red p-4 mt-4">
                            !!! {msg.content} !!!
                        </div>
                    )}
                </div>
            ))}

            <div ref={bottomRef} className="h-4" />
        </div>
    );
};
