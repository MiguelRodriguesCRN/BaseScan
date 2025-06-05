const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selecionarArquivo: () => ipcRenderer.invoke('selecionar-arquivo'),
  consultarDB: (dbPath, senha) => ipcRenderer.invoke('consultar-db', { dbPath, senha })
});
