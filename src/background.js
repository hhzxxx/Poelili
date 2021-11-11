"use strict";
import { app, protocol, BrowserWindow } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
const localShortcut = require("electron-localshortcut");

// import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== "production";
const server = require("./server");
import store from "./store";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: { secure: true, standard: true, corsEnabled: true },
  },
]);

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      nodeIntegrationInWorker: true,
    },
  });
  win.removeMenu();
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
  localShortcut.register("F5", () => {
    console.log("F5 is pressed, setAlwaysOnTop(true)");
    win.setOpacity(win.getOpacity() === 1 ? 0.4 : win.getOpacity());
	win.setIgnoreMouseEvents(true)
    win.setAlwaysOnTop(true);
  });
  localShortcut.register("F6", () => {
    console.log("F6 is pressed, setAlwaysOnTop(false), setOpacity(1)");
    win.setOpacity(1);
	win.setIgnoreMouseEvents(false)
    win.setAlwaysOnTop(false);
  });
  localShortcut.register("PageUp", () => {
    console.log("PageUp is pressed, setOpacity(+ 0.05)");
    win.setOpacity(win.getOpacity() + 0.05);
  });
  localShortcut.register("PageDown", () => {
    if (win.getOpacity() <= 0.4) {
      return;
    }
    console.log("PageDown is pressed, setOpacity(- 0.05)");
    win.setOpacity(win.getOpacity() - 0.05);
  });
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // try {
    //   await installExtension(VUEJS3_DEVTOOLS)
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
