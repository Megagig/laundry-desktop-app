import { app, BrowserWindow } from "electron"
import path from "path"
import { prisma, seedDatabase } from "./database/prisma.js"
import { registerCustomerHandlers } from "./ipc/customers.ipc.js"
import { registerOrderHandlers } from "./ipc/orders.ipc.js"
import { registerServiceHandlers } from "./ipc/services.ipc.js"
import { registerPaymentHandlers } from "./ipc/payments.ipc.js"
import { registerExpenseHandlers } from "./ipc/expenses.ipc.js"
import { registerReportHandlers } from "./ipc/reports.ipc.js"

// Initialize database and seed data
seedDatabase()

// Register all IPC handlers
registerCustomerHandlers()
registerOrderHandlers()
registerServiceHandlers()
registerPaymentHandlers()
registerExpenseHandlers()
registerReportHandlers()

let mainWindow: BrowserWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  })

  mainWindow.loadURL("http://localhost:5173")
}

app.whenReady().then(createWindow)

app.on("window-all-closed", async () => {
  await prisma.$disconnect()
  if (process.platform !== "darwin") {
    app.quit()
  }
})
