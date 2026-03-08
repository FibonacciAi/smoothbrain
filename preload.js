const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("smoothbrain", {
  // File system
  writeFile: (filePath, content) => ipcRenderer.invoke("fs:writeFile", filePath, content),
  readFile: (filePath) => ipcRenderer.invoke("fs:readFile", filePath),
  mkdir: (dirPath) => ipcRenderer.invoke("fs:mkdir", dirPath),
  readDir: (dirPath) => ipcRenderer.invoke("fs:readDir", dirPath),
  exists: (filePath) => ipcRenderer.invoke("fs:exists", filePath),
  deleteFile: (filePath) => ipcRenderer.invoke("fs:deleteFile", filePath),

  // Dialog
  pickDirectory: () => ipcRenderer.invoke("dialog:pickDirectory"),

  // Project dir
  getProjectDir: () => ipcRenderer.invoke("project:getDir"),
  setProjectDir: (dir) => ipcRenderer.invoke("project:setDir", dir),
  openInFinder: (dir) => ipcRenderer.invoke("shell:openPath", dir),

  // Platform check
  isElectron: true,
});
