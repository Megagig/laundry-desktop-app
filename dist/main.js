import { app, BrowserWindow } from "electron";
import path from "path";
let mainWindow;
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800
    });
    mainWindow.loadURL("https://google.com");
}
app.whenReady().then(createWindow);
//# sourceMappingURL=main.js.map