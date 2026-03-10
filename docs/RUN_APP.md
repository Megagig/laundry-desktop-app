# Running the Laundry Desktop Application

## Quick Start

### Terminal 1: Start the Frontend Dev Server
```bash
cd renderer
npm run dev
```
This will start Vite dev server on http://localhost:5173

### Terminal 2: Run the Electron App
```bash
# From the root directory
npm run dev
```

The application window should open and load the React frontend.

## Development Workflow

### First Time Setup
1. Install dependencies:
```bash
npm install
cd renderer && npm install && cd ..
```

2. Generate Prisma Client:
```bash
npx prisma generate
```

3. Run migrations (if needed):
```bash
npx prisma migrate dev
```

### Running the App (Development Mode)

**Option 1: Two Terminal Windows (Recommended)**

Terminal 1 - Frontend:
```bash
cd renderer
npm run dev
```

Terminal 2 - Electron:
```bash
npm run dev
```

**Option 2: Production Build**

Build everything first:
```bash
cd renderer && npm run build && cd ..
npm run build
NODE_ENV=production npm run dev
```

### Making Changes

**Frontend Changes (React/UI):**
- The Vite dev server has hot reload
- Changes appear instantly in the Electron window
- No need to restart Electron

**Backend Changes (Electron/Services):**
- Stop Electron (Ctrl+C in Terminal 2)
- Run `npm run build`
- Run `npm run dev` again

## Troubleshooting

### Prisma Errors
If you see Prisma-related errors:
```bash
npx prisma generate
npm run build
npm run dev
```

### Database Issues
The database is located at `prisma/laundry.db`. If you need to reset:
```bash
rm prisma/laundry.db
npx prisma migrate dev
npm run dev
```

### Port Already in Use
If port 5173 is in use:
```bash
# Kill the process using port 5173
lsof -ti:5173 | xargs kill -9
```

If Electron won't start:
```bash
pkill -f electron
```

### Blank Window
If the Electron window is blank:
1. Make sure Vite dev server is running (Terminal 1)
2. Check that it's on http://localhost:5173
3. Open DevTools in Electron (Ctrl+Shift+I) to see errors

### __dirname Errors
These are fixed now. If you see them:
```bash
npm run build
```

## File Structure
```
laundry-desktop-app/
├── electron/           # Electron main process (backend)
│   ├── main.ts        # Entry point
│   ├── preload.ts     # Preload script
│   ├── database/      # Prisma client
│   ├── services/      # Business logic
│   └── ipc/           # IPC handlers
├── renderer/          # React frontend
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── components/# Reusable components
│   │   └── store/     # Zustand state management
│   └── dist/          # Built frontend (for production)
├── prisma/
│   ├── schema.prisma  # Database schema
│   ├── migrations/    # Database migrations
│   └── laundry.db     # SQLite database
└── dist/              # Compiled Electron code
    └── electron/      # Compiled TypeScript
```

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Compile Electron TypeScript |
| `npm run dev` | Run Electron app |
| `cd renderer && npm run dev` | Start Vite dev server |
| `cd renderer && npm run build` | Build frontend for production |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma studio` | Open Prisma Studio (database GUI) |
| `npx prisma migrate dev` | Create and apply migrations |

## Development Tips

1. **Keep Vite Running**: Leave the Vite dev server running in Terminal 1 for hot reload
2. **Check Console**: Open DevTools in Electron (Ctrl+Shift+I) to see frontend errors
3. **Check Terminal**: Backend errors appear in Terminal 2
4. **Database GUI**: Use `npx prisma studio` to view/edit database directly

## Notes

- The app uses SQLite database stored in `prisma/laundry.db`
- Frontend is built with React + Vite + Mantine UI
- Backend uses Electron + Prisma ORM (v5.22.0)
- State management with Zustand
- TypeScript throughout
- ES Modules (not CommonJS)

## Production Build (Future)

For production builds, you'll need to configure electron-builder:
```bash
npm install --save-dev electron-builder
```

Then add build scripts to package.json and configure electron-builder.
