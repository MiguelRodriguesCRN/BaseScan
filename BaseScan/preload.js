const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  abrirTela: (tipo) => ipcRenderer.invoke('abrir-tela', tipo), // Navegação entre telas
  analisarDesligamento: (filePath) => ipcRenderer.invoke('analisar-desligamento', filePath), // Análise de desligamento
  analisarLog: (data) => ipcRenderer.invoke('analisar-log', data), // Análise de logs
  analisarSaltosTempo: (data) => ipcRenderer.invoke('analisar-saltos-tempo', data), // Análise de saltos de tempo
  consultarDB: (data) => ipcRenderer.invoke('consultar-db', data), // Consulta geral no banco
  selecionarArquivo: () => ipcRenderer.invoke('selecionar-arquivo'), // Selecionar arquivo .db
  selecionarArquivoLog: () => ipcRenderer.invoke('selecionar-arquivo-log'), // Selecionar arquivo de log
});
