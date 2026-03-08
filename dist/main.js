import { app, BrowserWindow } from "electron";
import path from "path";
let mainWindow;
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900
    });
    mainWindow.loadURL("https://google.com");
}
app.whenReady().then(createWindow);
//# sourceMappingURL=main.js.map