/**
 * electron/main.cjs
 *
 * Electron main process — this is the entry point when the desktop app launches.
 * It creates a native window (no browser chrome, no address bar) and loads the
 * built React app (dist/index.html) into it.
 *
 * This file uses .cjs extension because the project's package.json has
 * "type": "module" (needed for Vite), but Electron's main process requires
 * CommonJS (require/module.exports). The .cjs extension tells Node to treat
 * this file as CommonJS regardless of the package.json setting.
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');

/**
 * Creates the main application window with presentation-friendly defaults:
 * - 1400x900 starting size (fits well on 1080p displays)
 * - 1024x700 minimum (prevents the layout from breaking)
 * - No menu bar (clean, app-like appearance)
 * - Context isolation enabled for security (no Node.js access from the renderer)
 */
function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'SureROI',
    icon: path.join(__dirname, '..', 'public', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,    // Don't expose Node.js APIs to the web page
      contextIsolation: true,    // Keep Electron internals separate from app code
    },
  });

  // Remove the File/Edit/View/etc. menu bar for a cleaner look
  win.setMenuBarVisibility(false);

  // Load the production build of the React app
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

// When Electron is ready, create the window
app.whenReady().then(createWindow);

// Quit the app when all windows are closed (standard Windows/Linux behavior)
app.on('window-all-closed', () => {
  app.quit();
});

// On macOS, re-create the window when the dock icon is clicked and no windows exist
// (standard macOS behavior — apps stay "running" even with no windows open)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
