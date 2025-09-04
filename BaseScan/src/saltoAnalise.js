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
 * Retorna dd/MM/yyyy HH:mm:ss a partir de Date
 */
function formatDateTime(date) {
  if (!(date instanceof Date) || isNaN(date)) return null;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`;
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
      houveRegressao: false,
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
                const minutosPorSegmento = 50;
                const segundosPorSegmento = minutosPorSegmento * 60;

                if (rows.length > 1) {
                  const inicioAula = formatInstant(rows[0].Instant);
                  const fimAula = formatInstant(rows[rows.length - 1].Instant);

                  for (let i = 1; i < rows.length; i++) {
                    const instanteAtual = formatInstant(rows[i].Instant);
                    if (instanteAtual && instanteAtual < inicioAula) {
                      out.houveRegressao = true;
                      break;
                    }
                  }

                  if (inicioAula && fimAula) {
                    const duracaoTotalSegundos = (fimAula.getTime() - inicioAula.getTime()) / 1000;
                    const segmentosCalculados = Math.floor(duracaoTotalSegundos / segundosPorSegmento) + 1;
                    out.totalSegmentos = Math.min(2, segmentosCalculados);

                  } else {
                    out.totalSegmentos = 0;
                  }

                  for (let i = 0; i < out.totalSegmentos; i++) {
                    const inicioSegmento = new Date(
                      inicioAula.getTime() + i * segundosPorSegmento * 1000
                    );
                    const fimSegmento = new Date(
                      inicioSegmento.getTime() + segundosPorSegmento * 1000
                    );
                    out.segmentosDetalhes.push({
                      segmento: i + 1,
                      horarioInicial: formatDateTime(inicioSegmento),
                      horarioFinal: formatDateTime(fimSegmento),
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

                  if (diffSegundos >= 300) { // Salto de 5 minutos
                    const inicioAula = formatInstant(rows[0].Instant);

                    const tempoDesdeInicioAnterior = (fAnt.getTime() - inicioAula.getTime()) / 1000;
                    const segmentoInicioCalc = Math.floor(tempoDesdeInicioAnterior / segundosPorSegmento) + 1;

                    const tempoDesdeInicioAtual = (fAtu.getTime() - inicioAula.getTime()) / 1000;
                    const segmentoFimCalc = Math.floor(tempoDesdeInicioAtual / segundosPorSegmento) + 1;

                    out.saltos.push({
                      anterior: formatDateTime(fAnt),
                      atual: formatDateTime(fAtu),
                      diferencaSegundos: diffSegundos,
                      diferencaFormatada: segundosParaTempo(diffSegundos),
                      // Limita o resultado do segmento a no máximo 2
                      segmento: Math.min(2, segmentoInicioCalc),
                      segmentoFim: Math.min(2, segmentoFimCalc),
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
