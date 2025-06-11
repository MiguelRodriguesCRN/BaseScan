const sqlite3 = require('@journeyapps/sqlcipher').verbose();

function analisarSaltosTempo(dbPath, senha, lessonOid) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject('Erro ao abrir o banco: ' + err.message);

      db.run(`PRAGMA key = '${senha}';`, (err) => {
        if (err) return reject('Erro na PRAGMA key: ' + err.message);

        db.run(`PRAGMA cipher_compatibility = 3;`, (err) => {
          if (err) return reject('Erro no cipher_compatibility: ' + err.message);

          db.all(
            `SELECT Instant FROM Logger WHERE LessonOID = ? ORDER BY datetime(substr(Instant, 7, 4) || '-' || substr(Instant, 4, 2) || '-' || substr(Instant, 1, 2) || ' ' || substr(Instant, 12))`,
            [lessonOid],
            (err, rows) => {
              if (err) return reject('Erro na consulta: ' + err.message);

              const desligamentosLongos = [];

              for (let i = 1; i < rows.length; i++) {
                const atual = new Date(formatInstant(rows[i].Instant));
                const anterior = new Date(formatInstant(rows[i - 1].Instant));
                const diffSegundos = (atual - anterior) / 1000;

                if (diffSegundos >= 300) {  // >= 5 minutos
                  desligamentosLongos.push({
                    anterior: rows[i - 1].Instant,
                    atual: rows[i].Instant,
                    diferencaMinutos: Math.floor(diffSegundos / 60),
                    diferencaSegundos: diffSegundos
                  });
                }
              }

              db.close();

              resolve({
                houveDesligamentoLongo: desligamentosLongos.length > 0,
                desligamentosLongos
              });
            }
          );
        });
      });
    });
  });
}

function formatInstant(instant) {
  const [dia, mes, anoHora] = instant.split('-');
  const [ano, hora] = anoHora.split(' ');
  return `${ano}-${mes}-${dia} ${hora}`;
}

module.exports = { analisarSaltosTempo };
