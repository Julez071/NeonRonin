import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GameResponse, GameMessage } from '../types';

import { SYSTEM_PROMPT } from '../data/gamePrompt';

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
                model: "gemini-2.0-flash",
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
