const { contextBridge, ipcRenderer } = require('electron');

const ELECTRON_API = {
  startAutoLocating: () => ipcRenderer.send('start-auto-locating'),
  stopAutoLocating: () => ipcRenderer.send('stop-auto-locating'),
  getLeagueClient: () => ipcRenderer.invoke('get-league-client'),
  sendLeagueClientReady: () => ipcRenderer.send('league-client-ready'),
  onClientNotFound: (stopLocatingFunc) => ipcRenderer.on('client-not-found', stopLocatingFunc),
  waitForToastNotification: (f) => ipcRenderer.on('toast-notification', (_, ...args) => f(...args)),
  sendToastNotification: (type, message) =>
    ipcRenderer.invoke('send-toast-notification', type, message),
  calculateHash: async (imageSrc) => ipcRenderer.invoke('calculate-hash', imageSrc),
  sendHashResponse: (hash) => ipcRenderer.invoke('send-hash-response', hash),
  sendHashRequest: () => ipcRenderer.send('send-hash-request'),
  waitForHashResponse: () =>
    new Promise((resolve) => {
      const listener = (_, message) => {
        ipcRenderer.removeListener('hash-message', listener);
        resolve(message);
      };
      ipcRenderer.on('hash-message', listener);
    }),
  waitForHashRequest: (f) => ipcRenderer.on('hash-requested', (_, ...args) => f(...args))
};

contextBridge.exposeInMainWorld('electronAPI', ELECTRON_API);
