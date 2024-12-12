const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadUbioData: () => ipcRenderer.invoke('watch-ubio-data')
}); 