window.addEventListener('DOMContentLoaded', () => {
  const btnSelecionar = document.getElementById('btnSelecionar');
  const caminhoArquivo = document.getElementById('caminhoArquivo');
  const btnConsultar = document.getElementById('btnConsultar');
  const resultado = document.getElementById('resultado');

  const btnAjuda = document.getElementById('btnAjuda');
  const painelAjuda = document.getElementById('ajuda-container');
  const btnFechar = document.getElementById('btnFechar');
  const pagina1 = document.getElementById('pagina1');
  const pagina2 = document.getElementById('pagina2');
  const proxima1 = document.getElementById('proxima1');
  const voltar1 = document.getElementById('voltar1');

  btnAjuda.addEventListener('click', () => {
    painelAjuda.style.right = '0';
  });

  btnFechar.addEventListener('click', () => {
    painelAjuda.style.right = '-430px';
  });

  proxima1.addEventListener('click', () => {
    pagina1.style.display = 'none';
    pagina2.style.display = 'block';
  });

  voltar1.addEventListener('click', () => {
    pagina2.style.display = 'none';
    pagina1.style.display = 'block';
  });

  let arquivoSelecionado = null;

  btnSelecionar.addEventListener('click', async () => {
    const file = await window.electronAPI.selecionarArquivo();

    if (file) {
      arquivoSelecionado = file;
      caminhoArquivo.textContent = `Arquivo selecionado: ${file}`;
      caminhoArquivo.style.display = 'block';
    } else {
      caminhoArquivo.textContent = 'Nenhum arquivo selecionado.';
      caminhoArquivo.style.display = 'block';
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
        resultado.innerHTML = '<p class="retorno-vazio">✅ Nenhuma aula pendente.</p>';
        resultado.style.display = 'block';
      } else {
        const colunasDesejadas = ['Code', 'IsSync', 'Renach', 'CPFCandidate', 'CPFInstructor', 'Start'];

        // Cria o cabeçalho da tabela com uma coluna extra para "Campos Vazios"
        let html = '<div class="tabela-wrapper"><table class="tabela-resultado"><thead><tr>';
        for (const coluna of colunasDesejadas) {
          html += `<th>${coluna}</th>`;
        }
        html += '<th>Campos Vazios</th></tr></thead><tbody>';

        
        for (const row of rows) {
          
          let camposVazios = [];
          for (const key in row) {
            if (row[key] === null || row[key] === undefined || row[key] === '') {
              camposVazios.push(key);
            }
          }

          
          html += `<tr${camposVazios.length > 0 ? ' class="linha-vazia"' : ''}>`;
          for (const coluna of colunasDesejadas) {
            html += `<td>${row[coluna] !== undefined ? row[coluna] : ''}</td>`;
          }
          
          html += `<td>${camposVazios.length > 0 ? camposVazios.join(', ') : 'Nenhum'}</td>`;
          html += '</tr>';
        }
        html += '</tbody></table></div>';

        
        const mensagemVazio = rows.some(row =>
          Object.values(row).some(value => value === null || value === undefined || value === '')
        )
          ? '<p style="color: orange;">⚠️ Algumas linhas contêm campos vazios! Verifique a coluna "Campos Vazios" para detalhes.</p>'
          : '';

        resultado.innerHTML = mensagemVazio + html;
      }
    } catch (err) {
      resultado.innerHTML = `<p style="color:red;">Erro: ${err}</p>`;
    }
  });
});