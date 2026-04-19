# collab.io — Collaborative Code Editor

A real-time collaborative code editor built with React/Vite + Express/Socket.IO + Monaco. Multiple users join a shared room, see live presence, and edit the same document simultaneously via Yjs CRDTs.

## Features

- **Real-time collaborative editing** via Yjs + `y-monaco`
- **WebSocket sync** via Socket.IO + `y-socket.io`
- **Monaco Editor** with JetBrains Mono font, smooth cursor, and bracket pair guides
- **Multi-language support** — switch between JavaScript, TypeScript, Python, Go, and Rust from the top bar
- **Live presence panel** — colored user avatars with online count in the header and a participant list in the sidebar
- **Username join screen** — no auth, just pick a name and jump in
- **Health check endpoint** on the backend (`/health`)

## Tech Stack

**Frontend**
- React (Vite)
- Monaco Editor (`@monaco-editor/react`)
- Yjs + `y-monaco` + `y-socket.io`
- Tailwind CSS

**Backend**
- Node.js + Express
- Socket.IO + `y-socket.io` (Yjs server sync)

## Project Structure

```
backend/
  server.js          Express + Socket.IO + YSocketIO
  package.json

frontend/
  src/
    App.jsx          Join screen, sidebar, editor, top bar
  package.json
  vite.config.js
  App.css / index.css
```

## How It Works

1. The **backend** starts on port `3000`, serves static files from `public/`, and attaches `YSocketIO` to the Socket.IO server for Yjs document syncing.
2. The **frontend** creates a `Y.Doc` + shared text type (`"monaco"`), connects via `SocketIOProvider`, and binds Yjs to Monaco with `MonacoBinding`.
3. Yjs **awareness** tracks connected users — each gets a randomly assigned color used for their avatar across the header and sidebar.

## Running the Project

You need two terminals.

### 1. Backend

```bash
cd backend
npm install
npm run dev   # or: npm start
```

The server starts on `http://localhost:3000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` (or whatever Vite prints). Append `?username=yourname` to skip the join screen.

## UI Overview

| Area | Description |
|------|-------------|
| **Join screen** | Username entry with animated traffic-light dots |
| **Top bar** | Brand, language switcher, live avatar strip + online count |
| **Sidebar** | Participant list with colored avatars; green sync indicator |
| **Editor** | Monaco with JetBrains Mono, hidden minimap, slim scrollbars, dynamic file tab |