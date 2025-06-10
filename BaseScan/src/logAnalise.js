const analisarLogDefault = require('./LogsUFs/Default/analisarLog');
const analisarLogCE = require('./LogsUFs/CE/analisarLog');
const analisarLogMA = require('./LogsUFs/MA/analisarLog');
const analisarLogSE = require('./LogsUFs/SE/analisarLog');

const analisadoresPorUF = {
  SE: analisarLogSE,
  CE: analisarLogCE,
  AL: analisarLogDefault,
  BA: analisarLogDefault,
  MA: analisarLogMA,
  RN: analisarLogDefault,
  PB: analisarLogDefault,
  PE: analisarLogDefault,
  MG: analisarLogDefault,
  Default: analisarLogDefault
};

function analisarLog(caminhoArquivo, cpf, uf) {
  const ufUpper = (uf || 'Default').toUpperCase();
  const analisador = analisadoresPorUF[ufUpper] || analisadoresPorUF['Default'];
  return analisador(caminhoArquivo, cpf);
}

module.exports = { analisarLog };