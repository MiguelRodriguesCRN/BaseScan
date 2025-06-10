const fs = require('fs');

function analisarLog(caminhoArquivo, cpf) {
  return new Promise((resolve, reject) => {
    if (!caminhoArquivo.endsWith('_Browser.txt') && !caminhoArquivo.endsWith('_Browser.log')) {
      return reject('O arquivo selecionado não é um log válido (_Browser.txt ou _Browser.log).');
    }

    fs.readFile(caminhoArquivo, 'utf-8', (err, data) => {
      if (err) return reject('Erro ao ler o arquivo: ' + err.message);

      const linhas = data.split('\n');
      for (let i = 0; i < linhas.length - 1; i++) {
        if (linhas[i].includes(cpf)) {
          const proximaLinha = linhas[i + 1];
          if (proximaLinha.includes('A conexão com o dispositivo foi perdida')) {
            return resolve(true);
          }
        }
      }
      return resolve(false);
    });
  });
}

module.exports = analisarLog;