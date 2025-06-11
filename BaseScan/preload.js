const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selecionarArquivo: () => ipcRenderer.invoke('selecionar-arquivo'),
  selecionarArquivoLog: () => ipcRenderer.invoke('selecionar-arquivo-log'),
  consultarDB: (data) => ipcRenderer.invoke('consultar-db', data),
  abrirTela: (tipo) => ipcRenderer.invoke('abrir-tela', tipo),
  analisarLog: (data) => ipcRenderer.invoke('analisar-log', data),
  analisarDesligamento: (filePath) => ipcRenderer.invoke('analisar-desligamento', filePath), // <<< adiciona aqui
  analisarSaltosTempo: (data) => ipcRenderer.invoke('analisar-saltos-tempo', data),
  
});
