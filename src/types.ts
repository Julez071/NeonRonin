export interface GameState {
    face: number;
    inventory: string[];
    history: GameMessage[];
    isGameOver: boolean;
}

export interface GameMessage {
    type: 'narrative' | 'sidekick' | 'user' | 'system';
    content: string;
}

export interface GameResponse {
    narrative: string;
    sidekick_whisper: string | null;
    face_change: number;
    inventory_update: string | null;
    game_over: boolean;
}
