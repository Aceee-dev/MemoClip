import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getClipboardHistory: () => ipcRenderer.invoke('get-clipboard-history')
});
