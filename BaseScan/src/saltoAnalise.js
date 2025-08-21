// src/main/saltoAnalise.js
const sqlite3 = require('@journeyapps/sqlcipher').verbose();

function formatInstant(instant) {
  try {
    if (!instant || typeof instant !== 'string') return null;
    const cleanInstant = instant
      .split('.')[0]
      .replace(/Z|[-+]\d{2}:\d{2}$/, '')
      .trim();

    const [dia, mes, anoHora] = cleanInstant.split('-');
    if (!anoHora) return null;

    const [ano, hora] = anoHora.split(' ');
    if (!ano || !hora) return null;

    const formatted = `${ano}-${mes}-${dia} ${hora}`;
    const d = new Date(formatted);
    return Number.isNaN(d.getTime()) ? null : formatted;
  } catch {
    return null;
  }
}

function segundosParaTempo(segundos) {
  if (typeof segundos !== 'number' || isNaN(segundos)) return '0s';
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segs = Math.floor(segundos % 60);

  const partes = [];
  if (horas > 0) partes.push(`${horas}h`);
  if (minutos > 0 || horas > 0) partes.push(`${minutos}m`);
  partes.push(`${segs}s`);
  return partes.join(' ');
}

function analisarSaltosTempo(dbPath, senha, lessonOid) {
  return new Promise((resolve) => {
    const resultBase = {
      oidEncontrado: false,
      houveSalto: false,
      saltos: [],
      sqlException: null,
      sqlExceptions: [],
    };

    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) return resolve({ ...resultBase, error: `Erro ao abrir o banco: ${err.message}` });

      db.run(`PRAGMA key = '${senha}';`, (errKey) => {
        if (errKey) {
          db.close();
          return resolve({ ...resultBase, error: `Erro na PRAGMA key: ${errKey.message}` });
        }

        db.run(`PRAGMA cipher_compatibility = 3;`, (errCipher) => {
          if (errCipher) {
            db.close();
            return resolve({ ...resultBase, error: `Erro no cipher_compatibility: ${errCipher.message}` });
          }

          db.get(`SELECT 1 FROM Logger WHERE LessonOid = ? LIMIT 1`, [lessonOid], (errCheck, rowCheck) => {
            if (errCheck) {
              db.close();
              return resolve({ ...resultBase, error: `Erro na verificação do LessonOid: ${errCheck.message}` });
            }

            if (!rowCheck) {
              db.close();
              return resolve({ ...resultBase, oidEncontrado: false });
            }

            const sql = `
              SELECT ID, Instant, Text
              FROM Logger
              WHERE LessonOid = ?
              ORDER BY ID
            `;

            db.all(sql, [lessonOid], (errQuery, rows) => {
              if (errQuery) {
                db.close();
                return resolve({ ...resultBase, error: `Erro na consulta: ${errQuery.message}` });
              }

              const out = { ...resultBase, oidEncontrado: true };

              const excRegex = /(sqliteexception|sqlexception)/i;

              for (const row of rows) {
                const txt = typeof row.Text === 'string' ? row.Text : '';
                if (excRegex.test(txt)) {
                  out.sqlExceptions.push({
                    id: row.ID,
                    instant: row.Instant,
                    text: txt,
                  });
                }
              }

              if (out.sqlExceptions.length > 0) {
                out.sqlException = out.sqlExceptions[0].text;
              }

              for (let i = 1; i < rows.length; i++) {
                const fAnt = formatInstant(rows[i - 1].Instant);
                const fAtu = formatInstant(rows[i].Instant);
                if (!fAnt || !fAtu) continue;

                const ant = new Date(fAnt);
                const atu = new Date(fAtu);
                const diffSegundos = (atu.getTime() - ant.getTime()) / 1000;

                if (diffSegundos >= 300) {
                  out.saltos.push({
                    anterior: rows[i - 1].Instant,
                    atual: rows[i].Instant,
                    diferencaSegundos: diffSegundos,
                    diferencaFormatada: segundosParaTempo(diffSegundos),
                  });
                }
              }

              out.houveSalto = out.saltos.length > 0;
              db.close();
              return resolve(out);
            });
          });
        });
      });
    });
  });
}

module.exports = { analisarSaltosTempo, segundosParaTempo };
