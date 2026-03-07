import { useState, useEffect } from 'react';
import { StatusPanel } from './components/StatusPanel';
import { TerminalWindow } from './components/TerminalWindow';
import { InputConsole } from './components/InputConsole';
import { useVertexGameEngine } from './hooks/useVertexGameEngine';
import type { GameMessage } from './types';

function App() {
  const { processInput, isLoading, error } = useVertexGameEngine();

  const [face, setFace] = useState(70);
  const [inventory, setInventory] = useState<string[]>(['The Shard']);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const kaitoHelpMessage = `I am Kaito, your neural link assistant. Here to help you navigate Neo-Tokyo. Try typing actions like "look around", or speak to people by typing your exact words like "Hello, what do you sell?". If you ever need these instructions again, just type "help".`;

  const [history, setHistory] = useState<GameMessage[]>([
    { type: 'narrative', content: "You stand before the 'Neon-Ramen' stand. steam rises from the vents, mixing with the holographic rain. A grumpy robot chef with a rusted eye stares at you.\n\n\"WHAT DO YOU WANT?\" he buzzes mechanically." },
    { type: 'sidekick', content: kaitoHelpMessage }
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

    if (msg.trim().toLowerCase() === 'help') {
      const helpResponse: GameMessage = { type: 'sidekick', content: kaitoHelpMessage };
      setHistory([...newHistory, helpResponse]);
      return;
    }

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
        updates.push({ type: 'system', content: "MISSION ACCOMPLISHED - CONNECTION TERMINATED" });
        setIsGameOver(true);
      }

      setHistory(prev => [...prev, ...updates]);

      // Update Stats
      if (response.face_change !== 0) {
        setFace(prev => Math.max(0, Math.min(100, prev + response.face_change)));
      }

      if (response.inventory_update) {
        setInventory(prev => {
          if (!response.inventory_update) return prev;

          // If the item starts with '-', remove it. e.g "-The Shard"
          if (response.inventory_update.startsWith('-')) {
            const itemToRemove = response.inventory_update.substring(1).trim();
            return prev.filter(i => i !== itemToRemove);
          }

          // Otherwise add it
          const itemToAdd = response.inventory_update.trim();
          if (prev.includes(itemToAdd)) return prev; // No duplicates
          return [...prev, itemToAdd];
        });
      }

      if (response.mission_stage_update) {
        setCompletedMissions(prev => {
          if (!response.mission_stage_update) return prev;
          if (prev.includes(response.mission_stage_update)) return prev;
          return [...prev, response.mission_stage_update];
        });
      }
    }
  };

  // Load State from LocalStorage on mount
  const [hasSavedGame, setHasSavedGame] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('neonRoninState');
    if (saved) {
      setHasSavedGame(true);
    }
  }, []);

  const loadGame = () => {
    const saved = localStorage.getItem('neonRoninState');
    if (saved) {
      const state = JSON.parse(saved);
      setFace(state.face);
      setInventory(state.inventory);
      setCompletedMissions(state.completedMissions || []);
      setHistory(state.history);
      setShowIntro(false);
    }
  };

  const startNewGame = () => {
    // Clear specific state if needed, but default state is already set
    localStorage.removeItem('neonRoninState');
    setShowIntro(false);
  };

  // Auto-save on every state change (debounced effectively by react render cycle, but we can just save directly)
  useEffect(() => {
    if (!showIntro) {
      const state = { face, inventory, completedMissions, history };
      localStorage.setItem('neonRoninState', JSON.stringify(state));
    }
  }, [face, inventory, completedMissions, history, showIntro]);

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
            </div>

            <div className="flex flex-col gap-3 justify-center pt-4">
              {hasSavedGame && (
                <button
                  onClick={loadGame}
                  className="px-8 py-3 bg-zinc-800 border border-neon-green text-neon-green font-bold hover:bg-neon-green hover:text-black transition-colors"
                >
                  RESUME NEURAL LINK
                </button>
              )}
              <button
                onClick={startNewGame}
                className="px-8 py-3 bg-neon-green text-black font-bold hover:bg-white transition-colors"
              >
                INITIALIZE NEW LINK
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Status Panel (Responsive: Top on mobile, Side on desktop) */}
      <StatusPanel face={face} inventory={inventory} completedMissions={completedMissions} />

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
