const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { selecionarArquivo, consultarDB } = require('./src/db');
const { abrirTela } = require('./src/navigation');

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

  ipcMain.handle('consultar-db', (event, { dbPath, senha }) => consultarDB(dbPath, senha));

  ipcMain.handle('abrir-tela', (event, tipo) => abrirTela(win, tipo));
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
