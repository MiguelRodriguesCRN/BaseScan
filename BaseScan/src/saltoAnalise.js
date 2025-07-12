const sqlite3 = require('@journeyapps/sqlcipher').verbose();

function formatInstant(instant) {
  try {
    // Remove milissegundos, fusos horários ou caracteres extras
    const cleanInstant = instant.split('.')[0].replace(/Z|[-+]\d{2}:\d{2}$/, '').trim();
    // Divide a string no formato DD-MM-YYYY HH:MM:SS
    const [dia, mes, anoHora] = cleanInstant.split('-');
    if (!anoHora) throw new Error('Formato de ano/hora inválido');
    const [ano, hora] = anoHora.split(' ');
    if (!ano || !hora) throw new Error('Formato de ano ou hora inválido');

    // Formata como YYYY-MM-DD HH:MM:SS (sem Z, para interpretar no fuso local)
    const formatted = `${ano}-${mes}-${dia} ${hora}`;

    // Valida a data
    const date = new Date(formatted);
    if (isNaN(date.getTime())) {
      throw new Error(`Formato de data inválido: ${instant}`);
    }
    return formatted;
  } catch (error) {
    throw new Error(`Erro ao formatar Instant: ${instant} - ${error.message}`);
  }
}

function analisarSaltosTempo(dbPath, senha, lessonOid) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject('Erro ao abrir o banco: ' + err.message);

      db.run(`PRAGMA key = '${senha}';`, (err) => {
        if (err) return reject('Erro na PRAGMA key: ' + err.message);

        db.run(`PRAGMA cipher_compatibility = 3;`, (err) => {
          if (err) return reject('Erro no cipher_compatibility: ' + err.message);

          db.all(
            `SELECT ID, Instant FROM Logger WHERE LessonOID = ? ORDER BY ID`,
            [lessonOid],
            (err, rows) => {
              if (err) return reject('Erro na consulta: ' + err.message);

              if (rows.length === 0) {
                db.close();
                return resolve({
                  oidEncontrado: false,
                  houveSalto: false,
                  saltos: [],
                  houveRegressao: false
                });
              }

              const saltos = [];
              let houveRegressao = false;

              for (let i = 1; i < rows.length; i++) {
                try {
                  const instantAtual = rows[i].Instant;
                  const instantAnterior = rows[i - 1].Instant;
                  const idAtual = rows[i].ID;
                  const idAnterior = rows[i - 1].ID;

                  // Valida se as entradas são strings válidas
                  if (!instantAtual || !instantAnterior || typeof instantAtual !== 'string' || typeof instantAnterior !== 'string') {
                    continue;
                  }

                  // Verifica se os IDs são crescentes
                  if (idAtual <= idAnterior) {
                    continue;
                  }

                  const formattedAtual = formatInstant(instantAtual);
                  const formattedAnterior = formatInstant(instantAnterior);
                  const atual = new Date(formattedAtual);
                  const anterior = new Date(formattedAnterior);

                  const diffSegundos = (atual.getTime() - anterior.getTime()) / 1000;

                  if (isNaN(diffSegundos)) {
                    continue;
                  }

                  if (diffSegundos < 0) {
                    db.close();
                    return resolve({
                      oidEncontrado: true,
                      houveSalto: false,
                      saltos: [],
                      houveRegressao: true
                    });
                  }

                  if (diffSegundos >= 300) {
                    saltos.push({
                      anterior: instantAnterior,
                      atual: instantAtual,
                      diferencaMinutos: Math.floor(diffSegundos / 60),
                      diferencaSegundos: diffSegundos
                    });
                  }
                } catch (error) {
                  continue;
                }
              }

              db.close();

              resolve({
                oidEncontrado: true,
                houveSalto: saltos.length > 0,
                saltos: saltos,
                houveRegressao: houveRegressao
              });
            }
          );
        });
      });
    });
  });
}

module.exports = { analisarSaltosTempo };