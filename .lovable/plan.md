

# Chat Modes for the Product AI Assistant

## Overview

Add a mode selector to the product AI chat so advisors can switch between different conversation styles depending on their need -- quick factual lookups vs. sales coaching vs. objection handling practice.

## Three Chat Modes

| Mode | Icon | Purpose | AI Behavior |
|------|------|---------|-------------|
| **Knowledge Q&A** | Search | Quick factual answers about product features, charges, mechanics | Concise, direct answers. Bullet points. No sales fluff. Like a product encyclopedia. |
| **Sales Coach** | TrendingUp | Positioning, target market, closing strategies, talking points | Conversational, actionable. Provides scripts, analogies, and role-play scenarios. |
| **Objection Handling** | Shield | Practice handling client pushbacks and objections | Uses the 4-step framework (Acknowledge, Common Ground, Different Perspective, Safety Valve). Gives the objection, then a reframe. |

## How It Works

- A **toggle group** (pill-style selector) sits between the chat header and the message area
- Switching modes:
  - Clears the conversation and starts fresh with a mode-specific welcome message
  - Updates quick action suggestions to match the mode
  - Changes the input placeholder text
- The selected mode is sent to the backend edge function, which adjusts the system prompt accordingly

## UI Changes

### Mode Selector Component (New)
- A `ToggleGroup` with 3 options, each with an icon and label
- Compact on mobile (icons only), full labels on desktop
- Sits just below the `ChatHeader`

### Quick Actions per Mode
- **Knowledge Q&A**: "What are the fund options?", "What are the charges?", "How does premium pass work?"
- **Sales Coach**: "Give me a 2-minute elevator pitch", "Who is the ideal customer?", "How to position against competitors?"
- **Objection Handling**: "Client says it's too expensive", "Client wants to wait", "Client already has a policy"

### ChatHeader Update
- Shows the current mode name as a subtitle badge (e.g., "Knowledge Q&A")

## Backend Changes

### Edge Function (`product-knowledge-chat/index.ts`)
- Accept a new `mode` parameter from the request body
- Append a mode-specific instruction block to the system prompt:
  - **knowledge**: "Be concise and factual. Use bullet points. Answer directly without sales language. If the answer isn't in your knowledge base, say so."
  - **sales**: "Be a sales coach. Provide scripts, talking points, analogies. Help the advisor sell effectively. Use role-play when helpful."
  - **objections**: "Focus on objection handling using the 4-step framework: Acknowledge, Common Ground, Different Perspective, Safety Valve. Always structure responses as: Objection -> Acknowledgment -> Reframe -> Suggested Response."

## Technical Details

### Files to Create
- `src/components/chat/ChatModeSelector.tsx` -- the toggle group UI component

### Files to Modify
- `src/components/chat/types.ts` -- add `ChatMode` type (`'knowledge' | 'sales' | 'objections'`)
- `src/components/chat/AccessibleAIChat.tsx` -- add mode state, wire mode selector, update quick actions per mode, pass mode to edge function call, reset chat on mode switch
- `src/components/chat/ChatHeader.tsx` -- show current mode badge
- `supabase/functions/product-knowledge-chat/index.ts` -- read `mode` from request body, append mode-specific instructions to system prompt

### Data Flow
1. User taps a mode in the toggle group
2. Chat clears, welcome message updates, quick actions update
3. User sends a message -- the `mode` string is included in the edge function payload
4. Backend appends mode-specific instructions to the existing system prompt
5. AI responds in the appropriate style

