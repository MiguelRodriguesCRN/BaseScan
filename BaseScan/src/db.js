const { dialog } = require('electron');
const sqlite3 = require('@journeyapps/sqlcipher').verbose();

async function selecionarArquivo() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite'] }],
    properties: ['openFile']
  });
  return canceled ? null : filePaths[0];
}

function consultarDB(dbPath, senha) {
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
}

module.exports = {
  selecionarArquivo,
  consultarDB
};
