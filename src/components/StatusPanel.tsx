import React from 'react';
import { Shield, Backpack } from 'lucide-react';

interface StatusPanelProps {
    face: number;
    inventory: string[];
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ face, inventory }) => {
    const isLowFace = face < 30;

    return (
        <div className="w-64 border-r border-none md:border-r md:border-zinc-800 bg-zinc-900/50 p-4 flex flex-col gap-6 h-full overflow-y-auto font-mono">
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
            <div className="flex-1">
                <div className="flex items-center gap-2 text-cyber-pink mb-2">
                    <Backpack size={20} />
                    <h2 className="text-lg font-bold tracking-wider">INVENTORY</h2>
                </div>

                <div className="border border-zinc-700 p-3 bg-black/40 min-h-[200px] rounded">
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
        </div>
    );
};
