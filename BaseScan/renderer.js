window.addEventListener('DOMContentLoaded', () => {
  const btnSelecionar = document.getElementById('btnSelecionar');
  const caminhoArquivo = document.getElementById('caminhoArquivo');
  const btnConsultar = document.getElementById('btnConsultar');
  const senhaInput = document.getElementById('senha');
  const resultado = document.getElementById('resultado');

  let arquivoSelecionado = null;

  btnSelecionar.addEventListener('click', async () => {
    console.log('Botão selecionar clicado');
    const file = await window.electronAPI.selecionarArquivo();
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
    if (!senhaInput.value) {
      alert('Informe a senha do banco!');
      return;
    }

    resultado.innerHTML = 'Consultando...';

    try {
      const rows = await window.electronAPI.consultarDB(arquivoSelecionado, senhaInput.value);
      if (rows.length === 0) {
        resultado.innerHTML = '<p>✅ Nenhuma aula pendente.</p>';
      } else {
        let html = '<table><thead><tr>';
        for (const key of Object.keys(rows[0])) {
          html += `<th>${key}</th>`;
        }
        html += '</tr></thead><tbody>';
        for (const row of rows) {
          html += '<tr>';
          for (const key in row) {
            html += `<td>${row[key]}</td>`;
          }
          html += '</tr>';
        }
        html += '</tbody></table>';
        resultado.innerHTML = html;
      }
    } catch (err) {
      resultado.innerHTML = `<p style="color:red;">Erro: ${err}</p>`;
    }
  });
});
