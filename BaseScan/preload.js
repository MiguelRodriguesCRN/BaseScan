const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selecionarArquivo: () => ipcRenderer.invoke('selecionar-arquivo'),
  selecionarArquivoLog: () => ipcRenderer.invoke('selecionar-arquivo-log'),
  consultarDB: (dbPath, senha) => ipcRenderer.invoke('consultar-db', { dbPath, senha }),
  abrirTela: (tela) => ipcRenderer.invoke('abrir-tela', tela),
  analisarLog: (dados) => ipcRenderer.invoke('analisar-log', dados)
});
