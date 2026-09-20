# Notes App — Hierarchical Notes with Rich Text

A full-stack notes-taking web app with unlimited-depth folder nesting, rich text editing, shareable read-only links, and a soft pink/dark theme.

## Tech Stack

- **Frontend:** React 18 + Vite + Tiptap Editor
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on `mongodb://localhost:27017`

## Quick Start

### 1. Start MongoDB

Make sure MongoDB is running locally. Default connection: `mongodb://localhost:27017/notes-app`.

### 2. Install & Start the Backend

```bash
cd server
npm install
npm run dev
```

The server starts on **http://localhost:3001**.

### 3. Install & Start the Frontend

```bash
cd client
npm install
npm run dev
```

The app opens on **http://localhost:5173**. The Vite dev server proxies `/api` requests to the backend.

## Features

### Folder & Note Hierarchy
- Create folders and notes with unlimited nesting depth
- Expand/collapse folders in the sidebar tree
- Inline rename (double-click any title)
- Deep copy folders (duplicates everything inside with new IDs)
- Delete folders cascades to all children

### Rich Text Editor (Tiptap)
- Bold, italic, underline, strikethrough
- Headings (H1, H2, H3)
- Bullet lists, ordered lists
- Blockquotes, code blocks
- Tables (3×3 with header row)
- Horizontal rules
- Paste from Word/Google Docs preserves formatting
- **Autosave** — saves 1 second after you stop typing

### Sharing
- Share any folder or note via an unguessable link
- Folder shares show the full recursive tree (read-only)
- Note shares show the single note (read-only)
- Share links: `/share/:token`
- Copied folders get new share tokens (never reused)

### Theme
- **Light mode:** Soft pink & off-white ("study aesthetic")
- **Dark mode:** Deep plum/charcoal with pink accents
- Toggle in the top navigation bar
- Persisted across reloads via `localStorage`

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/folders/tree` | Full nested tree |
| POST | `/api/folders` | Create folder |
| PATCH | `/api/folders/:id` | Rename folder |
| DELETE | `/api/folders/:id` | Delete folder + descendants |
| POST | `/api/folders/:id/copy` | Deep copy folder |
| POST | `/api/folders/:id/share` | Get/create share token |
| GET | `/api/notes/:id` | Get note |
| POST | `/api/notes` | Create note |
| PATCH | `/api/notes/:id` | Update note (autosave) |
| DELETE | `/api/notes/:id` | Delete note |
| POST | `/api/notes/:id/share` | Get/create share token |
| GET | `/api/share/:token` | Public read-only shared view |

## Data Model

### Folders
```
{ title, parentId, ancestors: [ObjectId], shareToken }
```

### Notes
```
{ title, content (HTML), parentId, ancestors: [ObjectId], shareToken }
```

The `ancestors` array enables fast hierarchical queries: `find({ ancestors: folderId })` returns all descendants in a single indexed query.

## Project Structure

```
notes-app/
├── server/
│   ├── src/
│   │   ├── index.js          # Express entry point
│   │   ├── db.js             # MongoDB connection
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API routes
│   │   └── middleware/       # Error handler
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.jsx           # Routes
│   │   ├── api/              # Axios API client
│   │   ├── hooks/            # useDebounce, useTree
│   │   ├── context/          # ThemeContext
│   │   ├── components/       # UI components
│   │   ├── pages/            # HomePage, SharePage
│   │   └── styles/           # CSS themes
│   └── package.json
└── README.md
```
