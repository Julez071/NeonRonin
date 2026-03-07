# Neon-Ronin: The Way of Polite Speech
**A Cyberpunk Text Adventure powered by AI & Etiquette**

![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Gemini](https://img.shields.io/badge/AI-Gemini%202.0-orange) ![Vite](https://img.shields.io/badge/Build-Vite-yellow)

## 📌 Project Overview
**Neon-Ronin** is a retro-futuristic text adventure game where **politeness is a mechanic**. The player acts as a "Ronin" courier in Neo-Tokyo (2084), tasked with delivering a dangerous Data Shard. 

Unlike traditional text adventures with hard-coded paths, Neon-Ronin uses a **Large Language Model (Google Gemini)** as a dynamic "Dungeon Master". The Game Engine interprets user input, improvises narrative, and strictly enforces game rules defined in a structured System Prompt.

**Key Features:**
*   **AI Dungeon Master**: Infinite narrative possibilities within a structured 3-Act story.
*   **"Face" Mechanic**: Social standing (HP). Being rude lowers Face; being polite raises it.
*   **Educative Focus**: Teaches Japanese Business Etiquette (Keigo). Correct usage is rewarded.
*   **Retro UI**: A terminal-style interface customized with Tailwind CSS.
*   **Persistence**: Auto-saves state (Face, Inventory, History) to LocalStorage.

---

## 🚀 Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   A Google Gemini API Key (Get it from [Google AI Studio](https://aistudio.google.com/))

### Installation
1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-repo/neon-ronin.git
    cd neon-ronin
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    VITE_GEMINI_API_KEY=your_actual_api_key_here
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

---

## 🏗️ Architecture

The application follows a clean **React + Hooks** architecture, separating UI from Game Logic.

### Core Data Flow
1.  **User Input** (`InputConsole.tsx`) -> Sent to Hook.
2.  **Game Engine Hook** (`useVertexGameEngine.ts`) ->
    *   Constructs Chat History.
    *   Prepends the **System Prompt** (`gamePrompt.ts`).
    *   Sends payload to **Gemini API**.
3.  **AI Response** (JSON) -> Parsed by Hook.
4.  **State Update** (`App.tsx`) -> Updates Face, Inventory, History (and saves to `localStorage`).

### File Structure
```
src/
├── components/
│   ├── InputConsole.tsx    # User text input & loading state
│   ├── StatusPanel.tsx     # Displays Face (HP) & Inventory
│   └── TerminalWindow.tsx  # Scrollable message history (Narrative/User/Whisper)
├── data/
│   └── gamePrompt.ts       # THE BRAIN. The massive System Prompt defining rules & story.
├── hooks/
│   └── useVertexGameEngine.ts # API Logic. Handles Gemini communication & JSON parsing.
├── App.tsx                 # Main Game Loop, State Management, Persistence.
└── types.ts                # TypeScript Interfaces (GameState, GameMessage).
```

---

## 🧠 The Game Engine (AI Logic)

The "Engine" is not code, but a **Prompt** (`src/data/gamePrompt.ts`). 

### The Persona
The AI is instructed to act as an **"Educative Dungeon Master"**.
*   **Output Format**: STRICT JSON.
    ```json
    {
      "narrative": "Voice of the world...",
      "sidekick_whisper": "Advice from Kaito (e.g., 'Say Sumimasen instead')",
      "face_change": -10, // or +10
      "inventory_update": "Item Name",
      "game_over": false
    }
    ```

### The Story Bible (3 Acts)
The Prompt enforces a strict progression:
1.  **Act 1 (Ramen Stand)**: Goal = Eat Ramen (Restores Face to 100).
2.  **Act 2 (Subway)**: Goal = Find "Old Salaryman" -> Get Code "Blue Lotus".
3.  **Act 3 (Citadel)**: Goal = Use Code to enter.

### Mechanics
*   **Face**: Ranges 0-100. Starts at 70.
*   **Speech vs. Action**: The AI distinguishes between "Can I eat?" (Speech) and "Eat ramen" (Action).
*   **Strict Navigation**: Asking "Where is the subway?" yields *text directions*. Saying "Go to subway" *moves the player*.

---

## 💾 Persistence (Save System)

The game uses `localStorage` for simple client-side persistence.
*   **Key**: `neonRoninState`
*   **Trigger**: Auto-saves on *every* state change (Face, Inventory, History).
*   **Resume**: logic in `App.tsx` checks for this key on mount and conditionally renders the "RESUME NEURAL LINK" button.

---

## 🛠️ Customization

### Changing the Story
Edit `src/data/gamePrompt.ts`. You can change the setting, characters, or rules here without touching the TypeScript code.

### Styling
Styles are handled via **Tailwind CSS**. 
*   Custom colors (`terminal-bg`, `neon-green`) are defined in `tailwind.config.js`.

---

## 📄 License
MIT
