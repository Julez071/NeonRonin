import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GameResponse, GameMessage } from '../types';

const SYSTEM_PROMPT = `
Role: You are the Game Engine & Dungeon Master for "Neon-Ronin: The Way of Polite Speech".
Setting: A futuristic, neon-soaked Neo-Tokyo. It is 2084.
Player: A "Ronin" Courier acting as a mule for a dangerous Data Shard.
Mission: Deliver the Shard to **Director Akira** at the Corporate Citadel. You need the access code **"BLUE LOTUS"** to enter.

Structure - The game moves through 3 Acts:
Act 1: The Neon-Ramen Stand. (Goal: Get food. current Face is 70/100. **Eating Ramen** restores Face to 100. *After eating*, the Chef tells player: "Look for the **Old Salaryman (Informant)** at the Subway. He knows the Citadel codes.").
Act 2: The Cyber-Subway. (Goal: Find the **Old Salaryman**. Build Face with him to get the Access Code **"BLUE LOTUS"**. *Then* buy a ticket to the Citadel).
Act 3: The Corporate Tower. (Goal: Use the code "BLUE LOTUS" and name "Director Akira" to bypass the Reception AI).

Mechanics:
- **Face**: Starts at 70. Max 100.
- **Politeness**:
    - Rude/Informal -> Deduct Face (-10 to -30). Npc refuses. Sidekick 'Kaito' explains why.
    - Polite/Formal -> Add Face (+10). NPC complies.
    - **Recharge**: Eating Ramen sets Face to 100 (Calculate the +30 difference).

Guidelines for Interpretation:
- **Speech vs. Action**: Interpret context. "Eat ramen" is an action. "Can I have ramen?" is speech.
- **Strict Navigation**:
    - Asking about a location (e.g. "Ask about subway") -> NPC provides *information* or *directions*, but DOES NOT move the player.
    - Movement requires explicit action (e.g. "Go to subway", "Enter station"). Only then do you advance the Act.
- **Narrative Depth & Clues**: 
    - Don't just give the item. *Improvise*. The Chef might complain about the rain first.
    - **CRITICAL**: Link every success to the next step of the "Story Bible" (Ramen -> Informant -> Code -> Citadel).
- **Kaito's Help**: If the player asks "What do I do?" or seems stuck (3+ failed inputs), Kaito MUST whisper the exact next step (e.g., "Sir, we need that Code from the Informant.").

Output JSON Format (Strict):
{
  "narrative": "String. Atmospheric description + NPC Dialogue. Follow strict granularity rules.",
  "sidekick_whisper": "String. Kaito's advice. Null if input was perfect.",
  "face_change": Integer,
  "inventory_update": "String. Item name to add (e.g. 'Ramen', 'Access Code: Blue Lotus') or remove. Null if none.",
  "game_over": Boolean
}

Current State: The game begins NOW.
Scene: Act 1. Rain slicks the neon streets. You stand at the 'Neon-Ramen' stand, hungry and weak (Face 70%). The Data Shard represents a dangerous opportunity. A Robot Chef is chopping neon-onions.
(Wait for user input).
`;

export const useVertexGameEngine = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const processInput = async (input: string, history: GameMessage[]): Promise<GameResponse | null> => {
        console.log("[GameEngine] Processing input:", input);
        setIsLoading(true);
        setError(null);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            console.log("[GameEngine] API Key Check:", apiKey ? "Found (Masked)" : "MISSING");

            if (!apiKey) {
                throw new Error("API Key not found. Please set VITE_GEMINI_API_KEY in .env");
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });

            // Construct chat history for context
            // We limit context to last 10 turns to save tokens/keep focus, or send all.
            // Format history for Gemini:
            let chatHistory = history.map(msg => {
                if (msg.type === 'user') return { role: 'user', parts: [{ text: msg.content }] };
                if (msg.type === 'narrative') return { role: 'model', parts: [{ text: JSON.stringify({ narrative: msg.content }) }] };
                return null;
            }).filter(msg => msg !== null) as any[];

            // Gemini Rule: History must start with a User message.
            // If the first message is from Model (Narrative), we must remove it or ensure a User message precedes it.
            // Since the system prompt sets the scenario, we can safely find the first user message.
            const firstUserIndex = chatHistory.findIndex(msg => msg.role === 'user');
            if (firstUserIndex === -1) {
                // No user messages yet? Then history should be empty for the engine.
                chatHistory = [];
            } else {
                chatHistory = chatHistory.slice(firstUserIndex);
            }

            console.log("[GameEngine] Chat History Payload:", chatHistory);

            // Add system prompt to the beginning or use systemInstruction if supported (1.5 Pro/Flash supports it)
            // We'll use systemInstruction in getGenerativeModel for cleaner setup.
            // But passing it here directly is safer for older SDKs, though we installed latest.
            // Let's re-initialize model with systemInstruction.

            const modelWithSystem = genAI.getGenerativeModel({
                model: "gemini-2.0-flash-exp",
                systemInstruction: SYSTEM_PROMPT,
                generationConfig: { responseMimeType: "application/json" }
            });

            console.log("[GameEngine] Sending message to Gemini...");
            const chat = modelWithSystem.startChat({
                history: chatHistory,
            });

            const result = await chat.sendMessage(input);
            const response = result.response;
            const text = response.text();

            console.log("[GameEngine] Raw Response:", text);

            const jsonResponse = JSON.parse(text) as GameResponse;
            console.log("[GameEngine] Parsed JSON:", jsonResponse);

            return jsonResponse;

        } catch (err: any) {
            console.error("[GameEngine] AI Error:", err);
            // Construct a safe error message for the UI
            const errorMessage = err.message || "Unknown error occurred";
            // Log specifically if it looks like a quota or key issue
            if (errorMessage.includes("API key")) {
                console.error("[GameEngine] Critical: Valid API Key is required.");
            }
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { processInput, isLoading, error };
};
