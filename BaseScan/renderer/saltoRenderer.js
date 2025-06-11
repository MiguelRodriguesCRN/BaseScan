window.addEventListener('DOMContentLoaded', () => {
  const btnSelecionar = document.getElementById('btnSelecionar');
  const caminhoArquivo = document.getElementById('caminhoArquivo');
  const btnAnalisarSaltos = document.getElementById('btnAnalisarSaltos');
  const inputLessonOid = document.getElementById('lessonOidInput');
  const resultado = document.getElementById('resultadoSaltos');

  let arquivoSelecionado = null;

  btnSelecionar.addEventListener('click', async () => {
    const file = await window.electronAPI.selecionarArquivo();
    if (file) {
      arquivoSelecionado = file;
      caminhoArquivo.textContent = `Arquivo selecionado: ${file}`;
    } else {
      caminhoArquivo.textContent = 'Nenhum arquivo selecionado.';
    }
    resultado.innerHTML = '';
  });

  btnAnalisarSaltos.addEventListener('click', async () => {
    const lessonOid = inputLessonOid.value.trim();
    if (!lessonOid || !arquivoSelecionado) {
      alert('Preencha o LessonOID e selecione o arquivo.');
      return;
    }

    resultado.innerHTML = 'Analisando...';

    try {
      const resposta = await window.electronAPI.analisarSaltosTempo({
        dbPath: arquivoSelecionado,
        senha: '123Mudar',
        lessonOid: lessonOid
      });

      if (!resposta.houveSalto) {
        resultado.innerHTML = '<p>✅ Nenhum salto de tempo encontrado.</p>';
      } else {
        let html = '<p>⚠️ Saltos detectados:</p><ul>';
        for (const salto of resposta.saltos) {
          html += `<li>De ${salto.anterior} para ${salto.atual} — ${salto.diferencaSegundos} segundos</li>`;
        }
        html += '</ul>';
        resultado.innerHTML = html;
      }
    } catch (error) {
      resultado.innerHTML = `<p style="color:red;">Erro ao analisar: ${error}</p>`;
    }
  });
});
