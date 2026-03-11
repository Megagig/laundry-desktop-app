import { app, BrowserWindow } from "electron"
import path from "path"
import { fileURLToPath } from "url"
import { prisma, seedDatabase } from "./database/prisma.js"
import { registerAuthHandlers } from "./ipc/auth.ipc.js"
import { registerUserHandlers } from "./ipc/user.ipc.js"
import { registerCustomerHandlers } from "./ipc/customers.ipc.js"
import { registerOrderHandlers } from "./ipc/orders.ipc.js"
import { registerServiceHandlers } from "./ipc/services.ipc.js"
import { registerPaymentHandlers } from "./ipc/payments.ipc.js"
import { registerExpenseHandlers } from "./ipc/expenses.ipc.js"
import { registerReportHandlers } from "./ipc/reports.ipc.js"
import "./ipc/settings.ipc.js"
import "./ipc/backup.ipc.js"

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize database and seed data
seedDatabase()

// Register all IPC handlers
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
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false  // Disable sandbox to allow ES modules in preload
    }
  })

  // Maximize window on startup
  mainWindow.maximize()

  // Always load from Vite dev server in development
  // Check if running from dist folder (development mode)
  const isDev = !app.isPackaged
  
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
