import { useState, useEffect } from 'react';
import { StatusPanel } from './components/StatusPanel';
import { TerminalWindow } from './components/TerminalWindow';
import { InputConsole } from './components/InputConsole';
import { useVertexGameEngine } from './hooks/useVertexGameEngine';
import type { GameMessage } from './types';

function App() {
  const { processInput, isLoading, error } = useVertexGameEngine();

  const [face, setFace] = useState(70);
  const [inventory, setInventory] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [history, setHistory] = useState<GameMessage[]>([
    { type: 'narrative', content: "You stand before the 'Neon-Ramen' stand. steam rises from the vents, mixing with the holographic rain. A grumpy robot chef with a rusted eye stares at you.\n\n\"WHAT DO YOU WANT?\" he buzzes mechanically." }
  ]);

  // Display errors in the terminal
  useEffect(() => {
    if (error) {
      setHistory(prev => [...prev, { type: 'system', content: `ERROR: ${error}` }]);
    }
  }, [error]);

  const [showIntro, setShowIntro] = useState(true);

  const handleSendMessage = async (msg: string) => {
    // Optimistic User Update
    const userMsg: GameMessage = { type: 'user', content: msg };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);

    // Call Engine
    const response = await processInput(msg, newHistory);

    if (response) {
      const updates: GameMessage[] = [];

      // Narrative
      updates.push({ type: 'narrative', content: response.narrative });

      // Sidekick
      if (response.sidekick_whisper) {
        updates.push({ type: 'sidekick', content: response.sidekick_whisper });
      }

      // Game Over
      if (response.game_over) {
        updates.push({ type: 'system', content: "GAME OVER - CONNECTION TERMINATED" });
        setIsGameOver(true);
      }

      setHistory(prev => [...prev, ...updates]);

      // Update Stats
      if (response.face_change !== 0) {
        setFace(prev => Math.max(0, Math.min(100, prev + response.face_change)));
      }

      if (response.inventory_update) {
        // Simple toggle logic or add/remove based on string content?
        // Prompt says: "Item name to add/remove".
        // We'll assume if it's already there, remove it? Or just add.
        // Let's assume add for now, or use logic.
        // If the string starts with "-" maybe?
        // For MVP, if it's "Ramen Bowl", we add it.
        setInventory(prev => {
          if (!response.inventory_update) return prev;
          if (prev.includes(response.inventory_update)) return prev; // No duplicates for now
          return [...prev, response.inventory_update];
        });
      }
    }
  };

  return (

    <div className="flex flex-col md:flex-row h-[100dvh] w-screen bg-terminal-bg text-neon-green overflow-hidden relative">
      {/* Intro Overlay */}
      {showIntro && (
        <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="max-w-xl border border-neon-green p-8 bg-zinc-900 shadow-[0_0_20px_rgba(0,255,65,0.3)] text-center space-y-6">
            <h1 className="text-3xl font-bold tracking-widest text-neon-green glitch-effect">NEON-RONIN</h1>
            <div className="text-zinc-300 space-y-4 font-mono text-sm leading-relaxed">
              <p>It is 2084. Neo-Tokyo is a fortress of etiquette and steel.</p>
              <p>You hold the <strong>SHARD</strong>. You must deliver it to the <strong>CORPORATE CITADEL</strong> (Shibuya Distinct). Be careful not to lose "Face" through bad etiquette.</p>
              <p><strong>MISSION:</strong><br />1. Eat at the Ramen Stand to recharge.<br />2. Take the Subway to Shibuya.<br />3. Infiltrate the Citadel.</p>
              <p className="text-xs text-zinc-500 pt-4">I am <strong>KAITO</strong>, your AI assistant. I will guide your <em>speech</em>. You must choose your <em>actions</em>.</p>
            </div>
            <button
              onClick={() => setShowIntro(false)}
              className="px-8 py-3 bg-neon-green text-black font-bold hover:bg-white transition-colors"
            >
              INITIALIZE LINK
            </button>
          </div>
        </div>
      )}

      {/* Status Panel (Responsive: Top on mobile, Side on desktop) */}
      <StatusPanel face={face} inventory={inventory} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        <TerminalWindow history={history} />

        <InputConsole
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isGameOver={isGameOver}
        />
      </div>
    </div>
  );
}

export default App;
