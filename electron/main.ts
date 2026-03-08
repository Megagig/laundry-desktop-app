import { app, BrowserWindow } from "electron"
import "./database/sqlite.js"

let mainWindow: BrowserWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false
    }
  })

  mainWindow.loadURL("http://localhost:5174")
}

app.whenReady().then(createWindow)