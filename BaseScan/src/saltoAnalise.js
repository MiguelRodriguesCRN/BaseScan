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

    if (Number.isNaN(d.getTime())) return null;

    
    d.setHours(d.getHours() - 3);

    return d;
  } catch {
    return null;
  }
}

/**
 * Retorna HH:mm:ss a partir de Date
 */
function formatTime(date) {
  if (!(date instanceof Date) || isNaN(date)) return null;
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mi}:${ss}`;
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
      totalSegmentos: 0,
      segmentosDetalhes: [],
    };

    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err)
        return resolve({
          ...resultBase,
          error: `Erro ao abrir o banco: ${err.message}`,
        });

      db.run(`PRAGMA key = '${senha}';`, (errKey) => {
        if (errKey) {
          db.close();
          return resolve({
            ...resultBase,
            error: `Erro na PRAGMA key: ${errKey.message}`,
          });
        }

        db.run(`PRAGMA cipher_compatibility = 3;`, (errCipher) => {
          if (errCipher) {
            db.close();
            return resolve({
              ...resultBase,
              error: `Erro no cipher_compatibility: ${errCipher.message}`,
            });
          }

          db.get(
            `SELECT 1 FROM Logger WHERE LessonOid = ? LIMIT 1`,
            [lessonOid],
            (errCheck, rowCheck) => {
              if (errCheck) {
                db.close();
                return resolve({
                  ...resultBase,
                  error: `Erro na verificação do LessonOid: ${errCheck.message}`,
                });
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
                  return resolve({
                    ...resultBase,
                    error: `Erro na consulta: ${errQuery.message}`,
                  });
                }

                const out = { ...resultBase, oidEncontrado: true };

                if (rows.length > 1) {
                  const inicioAula = formatInstant(rows[0].Instant);
                  const fimAula = formatInstant(rows[rows.length - 1].Instant);
                  const duracaoTotalSegundos =
                    (fimAula.getTime() - inicioAula.getTime()) / 1000;
                  const duracaoTotalMinutos = duracaoTotalSegundos / 60;
                  out.totalSegmentos = Math.floor(duracaoTotalMinutos / 50);

                  for (let i = 0; i < out.totalSegmentos; i++) {
                    const inicioSegmento = new Date(
                      inicioAula.getTime() + i * 50 * 60 * 1000
                    );
                    const fimSegmento = new Date(
                      inicioSegmento.getTime() + 50 * 60 * 1000
                    );
                    out.segmentosDetalhes.push({
                      segmento: i + 1,
                      horarioInicial: formatTime(inicioSegmento),
                      horarioFinal: formatTime(fimSegmento),
                    });
                  }
                }

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

                  const diffSegundos = (fAtu.getTime() - fAnt.getTime()) / 1000;

                  if (diffSegundos >= 300) {
                    const inicioAula = formatInstant(rows[0].Instant);
                    const tempoDesdeInicio =
                      (fAnt.getTime() - inicioAula.getTime()) / 1000;
                    const segmento = Math.floor(tempoDesdeInicio / 3000) + 1;

                    out.saltos.push({
                      anterior: formatTime(fAnt),
                      atual: formatTime(fAtu),
                      diferencaSegundos: diffSegundos,
                      diferencaFormatada: segundosParaTempo(diffSegundos),
                      segmento: segmento,
                    });
                  }
                }

                out.houveSalto = out.saltos.length > 0;
                db.close();
                return resolve(out);
              });
            }
          );
        });
      });
    });
  });
}

module.exports = { analisarSaltosTempo, segundosParaTempo };
