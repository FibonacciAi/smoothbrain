const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const http = require("http");
const fs = require("fs");
const os = require("os");

let mainWindow;
let lanServer = null;
const LAN_PORT = 3777;

// ─── PROJECT DIRECTORY ───
const SETTINGS_PATH = path.join(os.homedir(), ".smoothbrain", "settings.json");
const DEFAULT_PROJECT_DIR = path.join(os.homedir(), "Desktop", "Smoothbrain", "Projects");

function loadSettings() {
  try { return JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8")); } catch { return {}; }
}
function saveSettings(data) {
  const dir = path.dirname(SETTINGS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2));
}
function getProjectDir() {
  const s = loadSettings();
  return s.projectDir || DEFAULT_PROJECT_DIR;
}

// ─── IPC: FILE SYSTEM ───
ipcMain.handle("fs:writeFile", async (_, filePath, content) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  return { ok: true, path: filePath };
});

ipcMain.handle("fs:readFile", async (_, filePath) => {
  if (!fs.existsSync(filePath)) return { ok: false, error: "not found" };
  return { ok: true, content: fs.readFileSync(filePath, "utf8") };
});

ipcMain.handle("fs:mkdir", async (_, dirPath) => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  return { ok: true };
});

ipcMain.handle("fs:readDir", async (_, dirPath) => {
  if (!fs.existsSync(dirPath)) return { ok: true, entries: [] };
  const entries = [];
  function walk(dir, prefix) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.isDirectory()) {
        entries.push({ name: rel, type: "dir" });
        walk(path.join(dir, item.name), rel);
      } else {
        const stat = fs.statSync(path.join(dir, item.name));
        entries.push({ name: rel, type: "file", size: stat.size });
      }
    }
  }
  walk(dirPath, "");
  return { ok: true, entries };
});

ipcMain.handle("fs:exists", async (_, filePath) => {
  return fs.existsSync(filePath);
});

ipcMain.handle("fs:deleteFile", async (_, filePath) => {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  return { ok: true };
});

// ─── IPC: DIALOG ───
ipcMain.handle("dialog:pickDirectory", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory", "createDirectory"],
    title: "Choose Project Directory",
  });
  if (result.canceled || !result.filePaths.length) return null;
  return result.filePaths[0];
});

// ─── IPC: PROJECT DIR ───
ipcMain.handle("project:getDir", () => getProjectDir());

ipcMain.handle("project:setDir", (_, dir) => {
  const s = loadSettings();
  s.projectDir = dir;
  saveSettings(s);
  return dir;
});

ipcMain.handle("shell:openPath", (_, dir) => {
  shell.openPath(dir);
});

// ─── LAN SERVER ───
function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "127.0.0.1";
}

function startLanServer() {
  if (lanServer) return;
  const htmlPath = path.join(__dirname, "smoothbrain.html");
  lanServer = http.createServer((req, res) => {
    fs.readFile(htmlPath, "utf8", (err, data) => {
      if (err) { res.writeHead(500); res.end("Error"); return; }
      const mobile = data.replace(
        "</head>",
        `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
<style>
  body { padding-top: env(safe-area-inset-top); }
  .app-header { padding-top: env(safe-area-inset-top); }
  .input-row { padding-bottom: env(safe-area-inset-bottom); }
</style>
</head>`
      );
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(mobile);
    });
  });
  lanServer.listen(LAN_PORT, "0.0.0.0", () => {
    const url = `http://${getLocalIP()}:${LAN_PORT}`;
    console.log(`LAN server: ${url}`);
    showLanBanner(url);
  });
}

function stopLanServer() {
  if (!lanServer) return;
  lanServer.close();
  lanServer = null;
  mainWindow?.webContents.executeJavaScript(`
    document.getElementById('lanBanner')?.remove();
  `);
}

function showLanBanner(url) {
  mainWindow?.webContents.executeJavaScript(`
    document.getElementById('lanBanner')?.remove();
    const b = document.createElement('div');
    b.id = 'lanBanner';
    b.style.cssText = 'position:fixed;bottom:72px;left:50%;transform:translateX(-50%);z-index:9999;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.25);backdrop-filter:blur(12px);border-radius:10px;padding:8px 16px;display:flex;align-items:center;gap:10px;font-family:var(--font-mono);font-size:11px;color:rgba(255,255,255,0.8);animation:fadeIn 0.3s ease';
    b.innerHTML = '<span style="color:#10b981;font-size:8px">●</span> Phone: <a href="${url}" style="color:#10b981;text-decoration:none;font-weight:600" onclick="event.preventDefault()">${url}</a> <button onclick="navigator.clipboard.writeText(\\'${url}\\');this.textContent=\\'Copied!\\';setTimeout(()=>this.textContent=\\'Copy\\',1500)" style="background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3);color:#10b981;border-radius:5px;padding:2px 8px;cursor:pointer;font-size:10px;font-family:inherit">Copy</button> <button onclick="this.parentElement.remove()" style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:14px;padding:0 0 0 4px">×</button>';
    document.body.appendChild(b);
  `);
}

// ─── WINDOW ───
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 600,
    minHeight: 500,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    vibrancy: "under-window",
    visualEffectState: "active",
    backgroundColor: "#06060a",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: path.join(__dirname, "preload.js"),
    },
    show: false,
  });

  mainWindow.loadFile("smoothbrain.html");

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ─── MENU ───
const template = [
  {
    label: app.name,
    submenu: [
      { role: "about" },
      { type: "separator" },
      {
        label: "Settings",
        accelerator: "Cmd+,",
        click: () => mainWindow?.webContents.executeJavaScript("toggleSettings()"),
      },
      { type: "separator" },
      { role: "hide" },
      { role: "hideOthers" },
      { role: "unhide" },
      { type: "separator" },
      { role: "quit" },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "selectAll" },
    ],
  },
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  },
  {
    label: "Chat",
    submenu: [
      {
        label: "New Chat",
        accelerator: "Cmd+K",
        click: () => mainWindow?.webContents.executeJavaScript("originalClear()"),
      },
      {
        label: "Export Chat",
        accelerator: "Cmd+E",
        click: () => mainWindow?.webContents.executeJavaScript("exportChat()"),
      },
      {
        label: "Reload Page",
        accelerator: "Cmd+Shift+R",
        click: () => mainWindow?.webContents.reload(),
      },
      { type: "separator" },
      {
        label: "Toggle Claude",
        accelerator: "Cmd+1",
        click: () => mainWindow?.webContents.executeJavaScript("toggleAgent('claude')"),
      },
      {
        label: "Toggle Codex",
        accelerator: "Cmd+2",
        click: () => mainWindow?.webContents.executeJavaScript("toggleAgent('codex')"),
      },
      {
        label: "Toggle Gemini",
        accelerator: "Cmd+3",
        click: () => mainWindow?.webContents.executeJavaScript("toggleAgent('gemini')"),
      },
      {
        label: "Toggle Grok",
        accelerator: "Cmd+4",
        click: () => mainWindow?.webContents.executeJavaScript("toggleAgent('grok')"),
      },
      { type: "separator" },
      {
        label: "API Keys...",
        click: () => mainWindow?.webContents.executeJavaScript("toggleSettings();switchSettingsTab('keys',document.querySelector('.settings-tab:nth-child(3)'))"),
      },
      { type: "separator" },
      {
        label: "Phone Access (LAN)",
        accelerator: "Cmd+L",
        type: "checkbox",
        checked: false,
        click: (menuItem) => {
          if (menuItem.checked) startLanServer();
          else stopLanServer();
        },
      },
    ],
  },
  {
    label: "Project",
    submenu: [
      {
        label: "Open Project Folder",
        accelerator: "Cmd+Shift+O",
        click: () => {
          const dir = getProjectDir();
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          shell.openPath(dir);
        },
      },
      {
        label: "Change Project Folder...",
        click: async () => {
          const result = await dialog.showOpenDialog(mainWindow, {
            properties: ["openDirectory", "createDirectory"],
            title: "Choose Project Directory",
          });
          if (!result.canceled && result.filePaths.length) {
            const s = loadSettings();
            s.projectDir = result.filePaths[0];
            saveSettings(s);
            mainWindow?.webContents.executeJavaScript(`
              projectDir = "${result.filePaths[0].replace(/"/g, '\\"')}";
              updateProjectUI();
            `);
          }
        },
      },
      { type: "separator" },
      {
        label: "Apply All Workspace Files",
        accelerator: "Cmd+Shift+A",
        click: () => mainWindow?.webContents.executeJavaScript("applyAllToProject()"),
      },
    ],
  },
  {
    label: "Window",
    submenu: [
      { role: "minimize" },
      { role: "zoom" },
      { type: "separator" },
      { role: "front" },
    ],
  },
];

app.whenReady().then(() => {
  // Ensure default project dir exists
  const dir = getProjectDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
