import { useState, useRef, useEffect } from 'react';

interface InputConsoleProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    isGameOver: boolean;
}

export const InputConsole: React.FC<InputConsoleProps> = ({ onSendMessage, isLoading, isGameOver }) => {
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input
    useEffect(() => {
        if (!isLoading && !isGameOver) {
            inputRef.current?.focus();
        }
    }, [isLoading, isGameOver]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading && !isGameOver) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="border-t border-zinc-800 bg-black/80 p-4">
            <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
                <div className="text-neon-green shrink-0 animate-pulse">
                    {'>'}
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading || isGameOver}
                    className="w-full bg-transparent border-none outline-none text-neon-green font-mono text-lg placeholder-zinc-700 disabled:opacity-50"
                    placeholder={isGameOver ? "GAME OVER" : isLoading ? "PROCESSING..." : "Enter command..."}
                    autoComplete="off"
                />

                {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <span className="text-neon-green animate-bounce">■</span>
                    </div>
                )}
            </form>
        </div>
    );
};
