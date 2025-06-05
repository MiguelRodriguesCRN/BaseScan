const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('@journeyapps/sqlcipher').verbose();

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),  // <-- aqui só o preload.js
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');

  // Para abrir o DevTools e debugar
  // win.webContents.openDevTools();
}


app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('selecionar-arquivo', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite'] }],
      properties: ['openFile']
    });
    if (canceled) {
      return null;
    } else {
      return filePaths[0];
    }
  });

  ipcMain.handle('consultar-db', async (event, { dbPath, senha }) => {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) return reject('Erro ao abrir o banco: ' + err.message);

        db.run(`PRAGMA key = '${senha}';`, (err) => {
          if (err) return reject('Erro na PRAGMA key: ' + err.message);

          db.run(`PRAGMA cipher_compatibility = 3;`, (err) => {
            if (err) return reject('Erro no cipher_compatibility: ' + err.message);

            db.all("SELECT * FROM Lesson WHERE IsSync = 0;", (err, rows) => {
              if (err) return reject('Erro na consulta: ' + err.message);

              db.close();
              resolve(rows);
            });
          });
        });
      });
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
