import { app, BrowserWindow } from "electron"
import path from "path"

let mainWindow: BrowserWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800
  })

  mainWindow.loadURL("https://google.com")
}

app.whenReady().then(createWindow)