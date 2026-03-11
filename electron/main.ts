import { app, BrowserWindow } from "electron"
import path from "path"
import { fileURLToPath } from "url"
import { prisma, seedDatabase } from "./database/prisma.js"
import { createIPCValidationMiddleware, startRateLimitCleanup } from "./middleware/ipc-validation.middleware.js"
import { registerAuthHandlers } from "./ipc/auth.ipc.js"
import { registerUserHandlers } from "./ipc/user.ipc.js"
import "./ipc/rbac.ipc.js"
import { registerCustomerHandlers } from "./ipc/customers.ipc.js"
import { registerOrderHandlers } from "./ipc/orders.ipc.js"
import { registerServiceHandlers } from "./ipc/services.ipc.js"
import { registerPaymentHandlers } from "./ipc/payments.ipc.js"
import { registerExpenseHandlers } from "./ipc/expenses.ipc.js"
import { registerReportHandlers } from "./ipc/reports.ipc.js"
import "./ipc/settings.ipc.js"
import "./ipc/backup.ipc.js"
import "./ipc/license.ipc.js"
import "./ipc/trial.ipc.js"
import "./ipc/audit.ipc.js"
import "./ipc/startup.ipc.js"

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize database and seed data
seedDatabase()

// Initialize IPC validation middleware
createIPCValidationMiddleware()
startRateLimitCleanup()

// Register all IPC handlers (after middleware is set up)
registerAuthHandlers()
registerUserHandlers()
registerCustomerHandlers()
registerOrderHandlers()
registerServiceHandlers()
registerPaymentHandlers()
registerExpenseHandlers()
registerReportHandlers()

// Initialize printer handlers with error handling
async function initializePrinterHandlers() {
  try {
    await import("./ipc/printer.ipc.js")
    console.log("✓ Printer handlers initialized")
  } catch (error) {
    console.warn("⚠ Printer system unavailable:", (error as Error).message)
  }
}

let mainWindow: BrowserWindow

function createWindow() {
  // Check if running from dist folder (development mode)
  const isDev = !app.isPackaged
  
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,  // Keep disabled for now - will test compatibility later
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      enableBlinkFeatures: "",
      disableBlinkFeatures: "",
      // Additional security settings
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      safeDialogs: true,
      safeDialogsMessage: "This app is trying to show a dialog",
      navigateOnDragDrop: false,
      autoplayPolicy: "user-gesture-required",
      // Disable potentially dangerous features
      plugins: false,
      javascript: true,
      images: true,
      textAreasAreResizable: false,
      webgl: false,
    },
    // Window security settings
    show: false, // Don't show until ready
    titleBarStyle: 'default',
  })

  // Maximize window on startup
  mainWindow.maximize()

  // Security: Handle new window attempts
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.warn('Blocked attempt to open new window:', url)
    return { action: 'deny' }
  })

  // Security: Handle navigation attempts
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)
    
    // Allow navigation to localhost in development
    if (isDev && parsedUrl.hostname === 'localhost') {
      return
    }
    
    // Block all other navigation attempts
    console.warn('Blocked navigation attempt to:', navigationUrl)
    event.preventDefault()
  })

  // Security: Handle external link attempts
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Block all external links
    console.warn('Blocked external link:', url)
    return { action: 'deny' }
  })

  // Security: Set Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "img-src 'self' data: blob:; " +
          "font-src 'self' data: https://fonts.gstatic.com; " +
          "connect-src 'self' ws://localhost:* http://localhost:*; " +
          "worker-src 'self' blob:; " +
          "media-src 'none'; " +
          "object-src 'none'; " +
          "frame-src 'none';"
        ]
      }
    })
  })

  // Show window only when ready to prevent visual glitches
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    
    // Focus the window
    if (mainWindow) {
      mainWindow.focus()
    }
  })

  // Always load from Vite dev server in development
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173")
    // Open DevTools in development
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../renderer/dist/index.html"))
  }

  // Log any loading errors
  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error("Failed to load:", errorCode, errorDescription)
  })
}

app.whenReady().then(async () => {
  createWindow()
  // Initialize printer handlers after app is ready
  await initializePrinterHandlers()
})

app.on("window-all-closed", async () => {
  await prisma.$disconnect()
  if (process.platform !== "darwin") {
    app.quit()
  }
})
