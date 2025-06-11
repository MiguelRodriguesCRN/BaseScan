const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { selecionarArquivo, selecionarArquivoLog, consultarDB } = require('./src/db');
const { abrirTela } = require('./src/navigation');
const { analisarLog } = require('./src/logAnalise');
const { analisarDesligamento } = require('./src/desligamentoAnalise');
const { analisarSaltosTempo } = require('./src/saltoAnalise');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('pages/inicio.html');
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('selecionar-arquivo', selecionarArquivo);
  ipcMain.handle('selecionar-arquivo-log', selecionarArquivoLog);
  ipcMain.handle('consultar-db', (event, { dbPath, senha }) => consultarDB(dbPath, senha));
  ipcMain.handle('abrir-tela', (event, tipo) => abrirTela(win, tipo));
  ipcMain.handle('analisar-log', (event, { caminho, cpf, uf }) => analisarLog(caminho, cpf, uf));
  ipcMain.handle('analisar-desligamento', (event, filePath) => analisarDesligamento(filePath));
  ipcMain.handle('analisar-saltos-tempo', (event, { dbPath, senha, lessonOid }) => {
  return analisarSaltosTempo(dbPath, senha, lessonOid);
  
});
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});