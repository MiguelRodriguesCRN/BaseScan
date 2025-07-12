window.addEventListener('DOMContentLoaded', () => {
  const btnSelecionar = document.getElementById('btnSelecionar');
  const caminhoArquivo = document.getElementById('caminhoArquivo');
  const btnConsultar = document.getElementById('btnConsultar');
  const resultado = document.getElementById('resultado');

  let arquivoSelecionado = null;

  btnSelecionar.addEventListener('click', async () => {
    console.log('Clicou em Selecionar Arquivo...');
    const file = await window.electronAPI.selecionarArquivo();
    console.log('Arquivo selecionado:', file);

    if (file) {
      arquivoSelecionado = file;
      caminhoArquivo.textContent = `Arquivo selecionado: ${file}`;
    } else {
      caminhoArquivo.textContent = 'Nenhum arquivo selecionado.';
    }
    resultado.innerHTML = '';
  });

  btnConsultar.addEventListener('click', async () => {
    if (!arquivoSelecionado) {
      alert('Selecione um arquivo .db antes!');
      return;
    }

    resultado.innerHTML = 'Consultando...';
    try {
      const rows = await window.electronAPI.consultarDB({ dbPath: arquivoSelecionado, senha: '123Mudar' });

      if (rows.length === 0) {
        resultado.innerHTML = '<p>✅ Nenhuma aula pendente.</p>';
      } else {
        let html = '<table><thead><tr><th>Code</th><th>IsSync</th><th>Renach</th><th>CPFCandidate</th><th>CPFInstructor</th><th>Start</th></tr></thead><tbody>';
        for (const row of rows) {
          html += `<tr><td>${row.Code}</td><td>${row.IsSync}</td><td>${row.Renach}</td><td>${row.CPFCandidate}</td><td>${row.CPFInstructor}</td><td>${row.Start}</td></tr>`;
        }
        html += '</tbody></table>';
        resultado.innerHTML = html;
      }
    } catch (err) {
      resultado.innerHTML = `<p style="color:red;">Erro: ${err}</p>`;
    }
  });
});
