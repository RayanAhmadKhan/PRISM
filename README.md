# PRISM
**PRISM** (Presence Real-time Identification & Security Model) is a web-based biometric attendance + authentication system concept.

This repo is split into:
- **`frontend/`**: Vite + React UI
- **`backend/`**: Node.js + Express API (MongoDB via Mongoose)

## Prerequisites
- **Node.js**: LTS recommended (18+)
- **npm**: comes with Node
- **MongoDB**: local install or MongoDB Atlas connection string

## Quick start (after cloning)

### 1) Clone

```bash
git clone <your-repo-url>
cd PRISM
```

### 2) Frontend setup (Vite + React)

```bash
cd frontend
npm install
npm run dev
```

- Vite will print a local URL (commonly `http://localhost:5173`).

### 3) Backend setup (Express)

In a second terminal:

```bash
cd backend
npm install
```

#### Environment variables
Create a `backend/.env` file (or use your preferred secret manager) with at least:

```bash
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/prism
JWT_SECRET=change_me
```

Then start the backend:

```bash
# Recommended during development
npx nodemon server.js

# Or plain node
node server.js
```

## Common scripts

### Frontend (`frontend/`)
- **`npm run dev`**: start dev server
- **`npm run build`**: production build
- **`npm run preview`**: preview production build locally

### Backend (`backend/`)
- **`npx nodemon server.js`**: run dev server with auto-reload

## Troubleshooting

### “JSX syntax extension is not currently enabled”
Make sure you:
- run `npm install` in `frontend/`
- start with `npm run dev`
- keep the React entry as `frontend/src/main.jsx` (not `.js`)

## Project notes
- The current UI pages are available at:
  - `/login`, `/signup`
  - `/dashboard/student`, `/dashboard/teacher`, `/dashboard/admin`
- API routes and backend startup depend on your implementation in `backend/server.js`.
