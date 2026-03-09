# 🚀 START HERE - Quick Setup Guide

## First Time Setup (Do this once)

```bash
# 1. Install all dependencies
npm install
cd renderer && npm install && cd ..

# 2. Generate Prisma Client
npx prisma generate

# 3. You're ready to run!
```

---

## Running the Application (Every Time)

### ⚡ Quick Start (2 Terminals)

**Terminal 1 - Start Frontend Dev Server:**
```bash
cd renderer
npm run dev
```
Wait until you see: `Local: http://localhost:5173/`

**Terminal 2 - Start Electron App:**
```bash
./start-dev.sh
```

OR manually:
```bash
npm run build
npm run dev
```

---

## 📋 Step-by-Step Instructions

### Step 1: Start the Frontend (Terminal 1)

Open a terminal and run:
```bash
cd renderer
npm run dev
```

You should see output like:
```
VITE v7.3.1  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Keep this terminal running!** Don't close it.

---

### Step 2: Start Electron (Terminal 2)

Open a **NEW** terminal (keep Terminal 1 running) and run:

**Option A - Using the helper script:**
```bash
./start-dev.sh
```

**Option B - Manual commands:**
```bash
npm run build
npm run dev
```

The Electron window should open and display the application.

---

## ✅ What You Should See

1. **Terminal 1**: Vite dev server running, showing "Local: http://localhost:5173/"
2. **Terminal 2**: Electron starting, showing database initialization messages
3. **Electron Window**: Application opens with the Dashboard page

---

## 🐛 Troubleshooting

### Blank Screen in Electron Window

**Problem**: The Electron window opens but shows a blank white screen.

**Solution**: The Vite dev server isn't running.
1. Check Terminal 1 - is Vite running?
2. If not, start it: `cd renderer && npm run dev`
3. Wait for "Local: http://localhost:5173/"
4. Restart Electron (Terminal 2)

---

### Port 5173 Already in Use

**Problem**: Vite says port 5173 is already in use.

**Solution**: Kill the process using that port:
```bash
lsof -ti:5173 | xargs kill -9
```
Then start Vite again.

---

### Prisma Errors

**Problem**: Errors about Prisma Client or database.

**Solution**: Regenerate Prisma Client:
```bash
npx prisma generate
npm run build
```

---

### Database Not Found

**Problem**: Can't find database file.

**Solution**: The database is created automatically on first run. If you deleted it:
```bash
npx prisma migrate dev
```

---

### Electron Won't Start

**Problem**: Electron process won't start or crashes.

**Solution**: Kill any existing Electron processes:
```bash
pkill -f electron
npm run build
npm run dev
```

---

## 🔄 Development Workflow

### Making Frontend Changes (React/UI)
- Just edit files in `renderer/src/`
- Changes appear instantly (hot reload)
- No need to restart anything

### Making Backend Changes (Electron/Services)
1. Edit files in `electron/`
2. Stop Electron (Ctrl+C in Terminal 2)
3. Run `npm run build`
4. Run `npm run dev`

### Database Schema Changes
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_change_name`
3. Run `npx prisma generate`
4. Restart Electron

---

## 📁 Project Structure

```
laundry-desktop-app/
├── electron/              # Backend (Node.js + Electron)
│   ├── main.ts           # Main process entry point
│   ├── preload.ts        # Preload script
│   ├── database/         # Prisma client setup
│   ├── services/         # Business logic
│   └── ipc/              # IPC handlers
│
├── renderer/             # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── store/       # Zustand state management
│   │   └── App.tsx      # Main app component
│   └── package.json     # Frontend dependencies
│
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── laundry.db       # SQLite database (created on first run)
│
└── package.json         # Backend dependencies
```

---

## 🎯 Quick Commands Reference

| Command | What it does |
|---------|-------------|
| `cd renderer && npm run dev` | Start frontend dev server |
| `npm run build` | Compile Electron TypeScript |
| `npm run dev` | Run Electron app |
| `./start-dev.sh` | Helper script to start Electron |
| `npx prisma studio` | Open database GUI |
| `npx prisma generate` | Regenerate Prisma Client |

---

## 💡 Tips

1. **Always start Vite first** (Terminal 1), then Electron (Terminal 2)
2. **Keep Vite running** for hot reload to work
3. **Use Ctrl+Shift+I** in Electron to open DevTools
4. **Check both terminals** for error messages
5. **Use Prisma Studio** to view/edit database: `npx prisma studio`

---

## 🎉 You're Ready!

Follow the steps above and you should have the application running.

If you encounter any issues not covered here, check:
- `RUN_APP.md` for detailed documentation
- `docs/PRISMA_FIX.md` for Prisma-specific issues
- Terminal output for error messages

Happy coding! 🚀
