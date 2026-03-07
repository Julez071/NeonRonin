import React from 'react';
import { Shield, Backpack } from 'lucide-react';

interface StatusPanelProps {
    face: number;
    inventory: string[];
    completedMissions: string[];
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ face, inventory, completedMissions }) => {
    const isLowFace = face < 30;

    return (
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-900/50 p-4 flex flex-row md:flex-col gap-4 md:gap-6 h-auto md:h-full overflow-y-auto font-mono text-sm md:text-base">
            {/* Face / Health Section */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-neon-green mb-2">
                    <Shield size={20} />
                    <h2 className="text-lg font-bold tracking-wider">STATUS</h2>
                </div>

                <div className="border border-zinc-700 p-3 bg-black/40 rounded">
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>FACE (SOCIAL)</span>
                        <span>{face}/100</span>
                    </div>
                    <div className="w-full h-4 bg-zinc-800 rounded-sm overflow-hidden border border-zinc-600">
                        <div
                            className={`h-full transition-all duration-500 ${isLowFace ? 'bg-warning-red animate-pulse' : 'bg-neon-green'}`}
                            style={{ width: `${Math.max(0, Math.min(100, face))}%` }}
                        />
                    </div>
                    {isLowFace && (
                        <div className="text-warning-red text-xs mt-2 animate-pulse">
                            WARNING: SOCIAL STANDING CRITICAL
                        </div>
                    )}
                </div>
            </div>

            {/* Inventory Section */}
            <div className="flex-1 min-h-[150px]">
                <div className="flex items-center gap-2 text-cyber-pink mb-2">
                    <Backpack size={20} />
                    <h2 className="text-lg font-bold tracking-wider">INVENTORY</h2>
                </div>

                <div className="border border-zinc-700 p-3 bg-black/40 h-[150px] overflow-y-auto rounded">
                    {inventory.length === 0 ? (
                        <div className="text-zinc-600 italic text-sm text-center mt-4">
                            -- EMPTY --
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {inventory.map((item, idx) => (
                                <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                                    <span className="text-cyber-pink shrink-0">[x]</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Mission Status Section */}
            <div className="flex-1 mt-4 md:mt-0 min-h-[150px]">
                <div className="flex items-center gap-2 text-cyber-blue mb-2" style={{ color: '#0FF' }}>
                    {/* Using an inline style or a custom tailwind class if cyan/blue is missing, sticking to standard text-cyan-400 for safety or neon style */}
                    <div className="w-5 h-5 border border-current flex items-center justify-center text-xs">M</div>
                    <h2 className="text-lg font-bold tracking-wider text-cyan-400">MISSION STATUS</h2>
                </div>

                <div className="border border-zinc-700 p-3 bg-black/40 h-[150px] overflow-y-auto rounded">
                    <ul className="space-y-2">
                        {['Ramen Shop', 'Subway', 'Citadel'].map((mission) => {
                            const isCompleted = completedMissions.includes(mission);
                            return (
                                <li key={mission} className={`text-sm flex items-start gap-2 ${isCompleted ? 'text-neon-green' : 'text-zinc-500'}`}>
                                    <span className="shrink-0">{isCompleted ? '[X]' : '[ ]'}</span>
                                    <span>{mission}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};
