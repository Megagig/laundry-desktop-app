import { app, BrowserWindow, ipcMain } from "electron"
import path from "path"
import { db } from "./database/sqlite.js"


ipcMain.handle("add-customer", (event, customer) => {
  const stmt = db.prepare(`
    INSERT INTO customers (name, phone)
    VALUES (?, ?)
  `)

  stmt.run(customer.name, customer.phone)

  return { success: true }
})
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