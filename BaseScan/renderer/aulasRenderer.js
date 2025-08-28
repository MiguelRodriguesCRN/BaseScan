npmwindow.addEventListener('DOMContentLoaded', () => {
  const btnSelecionar = document.getElementById('btnSelecionar');
  const caminhoArquivo = document.getElementById('caminhoArquivo');
  const btnConsultar = document.getElementById('btnConsultar');
  const resultado = document.getElementById('resultado');
  const alertSucesso = document.getElementById('alertSucesso'); // mais seguro via id

  const btnAjuda = document.getElementById('btnAjuda');
  const ajudaContainer = document.getElementById('ajuda-container');
  const btnFechar = document.getElementById('btnFechar');
  const pagina1 = document.getElementById('pagina1');
  const pagina2 = document.getElementById('pagina2');
  const proxima1 = document.getElementById('proxima1');
  const voltar1 = document.getElementById('voltar1');
  
  const voltarSidebar = document.getElementById('voltar-sidebar');
  const encaminharDesligamento = document.getElementById('encaminharDesligamento');
  const encaminharExame = document.getElementById('encaminharExame');

  // Ajuda
  btnAjuda.addEventListener('click', () => {
    ajudaContainer.classList.add('ativo');
  });

  btnFechar.addEventListener('click', () => {
    ajudaContainer.classList.remove('ativo');
  });

  proxima1.addEventListener('click', () => {
    pagina1.style.display = 'none';
    pagina2.style.display = 'block';
  });

  voltar1.addEventListener('click', () => {
    pagina2.style.display = 'none';
    pagina1.style.display = 'block';
  });

  // Sidebar
  voltarSidebar.addEventListener('click', () => {
    window.electronAPI.abrirTela('inicio');
  });

  // ✅ Proteções para evitar erro se os itens estiverem comentados no HTML
  if (encaminharDesligamento) {
    encaminharDesligamento.addEventListener('click', () => {
      window.electronAPI.abrirTela('desligamento');
    });
  }

  if (encaminharExame) {
    encaminharExame.addEventListener('click', () => {
      window.electronAPI.abrirTela('logs');
    });
  }

  // Seleção de arquivo
  let arquivoSelecionado = null;

  btnSelecionar.addEventListener('click', async () => {
    try {
      console.log('Clicou em Selecionar Arquivo...');
      const file = await window.electronAPI.selecionarArquivo();
      console.log('Arquivo selecionado:', file);

      if (file) {
        arquivoSelecionado = file;
        caminhoArquivo.textContent = `Arquivo selecionado: ${file}`;
      } else {
        caminhoArquivo.textContent = 'Nenhum arquivo selecionado.';
      }

      caminhoArquivo.style.display = 'block';
      resultado.innerHTML = '';
      alertSucesso.style.display = 'none';
    } catch (err) {
      console.error('Erro ao selecionar arquivo:', err);
      caminhoArquivo.textContent = 'Erro ao abrir o seletor de arquivos.';
      caminhoArquivo.style.display = 'block';
    }
  });

  // Consulta no banco
  btnConsultar.addEventListener('click', async () => {
    if (!arquivoSelecionado) {
      alert('Selecione um arquivo .db antes!');
      return;
    }

    resultado.innerHTML = 'Consultando...';
    alertSucesso.style.display = 'none';

    try {
      const rows = await window.electronAPI.consultarDB({
        dbPath: arquivoSelecionado,
        senha: '123Mudar'
      });

      if (!rows || rows.length === 0) {
        resultado.innerHTML = '';
        alertSucesso.style.display = 'flex';
      } else {
        let html = `
          <div class="tabela-wrapper" id="container-tabela">
            <table class="tabela-aulas">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>IsSync</th>
                  <th>Renach</th>
                  <th>CPF Candidato</th>
                  <th>CPF Instrutor</th>
                  <th>Inicio</th>
                  <th>Fim</th>
                </tr>
              </thead>
              <tbody>
        `;

        for (const row of rows) {
          html += `
            <tr>
              <td>${row.Code}</td>
              <td>${row.IsSync}</td>
              <td>${row.Renach}</td>
              <td>${row.CPFCandidate}</td>
              <td>${row.CPFInstructor}</td>
              <td>${row.Start}</td>
              <td>${row.End}</td>
            </tr>
          `;
        }

        html += '</tbody></table></div>';
        resultado.innerHTML = html;
      }
    } catch (err) {
      resultado.innerHTML = `<p style="color:red;">Erro: ${err}</p>`;
      alertSucesso.style.display = 'none';
    }
  });
});
