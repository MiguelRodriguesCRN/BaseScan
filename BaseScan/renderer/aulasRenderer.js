window.addEventListener('DOMContentLoaded', () => {
  const btnSelecionar = document.getElementById('btnSelecionar');
  const caminhoArquivo = document.getElementById('caminhoArquivo');
  const btnConsultar = document.getElementById('btnConsultar');
  const resultado = document.getElementById('resultado');
  const alertSucesso = document.querySelector('.alert-sucesso');

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

  voltarSidebar.addEventListener('click', () => {
    window.electronAPI.abrirTela('inicio');
  });

  encaminharDesligamento.addEventListener('click', () => {
    window.electronAPI.abrirTela('desligamento');
  });

  encaminharExame.addEventListener('click', () => {
    window.electronAPI.abrirTela('logs');
  });

  let arquivoSelecionado = null;

  btnSelecionar.addEventListener('click', async () => {
    console.log('Clicou em Selecionar Arquivo...');
    const file = await window.electronAPI.selecionarArquivo();
    console.log('Arquivo selecionado:', file);

    if (file) {
      arquivoSelecionado = file;
      caminhoArquivo.textContent = `Arquivo selecionado: ${file}`;
      caminhoArquivo.style.display = 'block';
    } else {
      caminhoArquivo.textContent = 'Nenhum arquivo selecionado.';
      caminhoArquivo.style.display = 'block';
    }
    resultado.innerHTML = '';
    alertSucesso.style.display = 'none'
  });

  btnConsultar.addEventListener('click', async () => {
    if (!arquivoSelecionado) {
      alert('Selecione um arquivo .db antes!');
      return;
    }

    resultado.innerHTML = 'Consultando...';
    alertSucesso.style.display = 'none';
    try {
      const rows = await window.electronAPI.consultarDB({ dbPath: arquivoSelecionado, senha: '123Mudar' });

      if (rows.length === 0) {
        resultado.innerHTML = '';
        alertSucesso.style.display = 'flex';
      } else {
        let html = '<div class="tabela-wrapper" id="container-tabela"><table class="tabela-aulas"><thead><tr><th>Code</th><th>IsSync</th><th>Renach</th><th>CPFCandidate</th><th>CPFInstructor</th><th>Start</th></tr></thead><tbody>';
        for (const row of rows) {
          html += `<tr><td>${row.Code}</td><td>${row.IsSync}</td><td>${row.Renach}</td><td>${row.CPFCandidate}</td><td>${row.CPFInstructor}</td><td>${row.Start}</td></tr>`;
        }
        html += '</tbody></table></div>';
        resultado.innerHTML = html;
        alertSucesso.style.display = 'none'
      }
    } catch (err) {
      const mensagemErro = err.message || err.toString();

      if (mensagemErro.includes('SQLITE_CORRUPT') || mensagemErro.includes('malformed')) {
        resultado.innerHTML = `
          <div style="color:red; padding:10px; border: 1px solid red; border-radius: 5px; background-color: #fff5f5;">
            <strong>Erro: Arquivo de Banco de Dados Corrompido</strong>
            <p style="margin-top: 5px;">O arquivo selecionado parece estar danificado. Verifique se a coleta foi feita corretamente ou tente usar outro arquivo.</p>
          </div>`;
      } else if (mensagemErro.includes('PRAGMA key') || mensagemErro.includes('file is not a database')) {
        resultado.innerHTML = `
          <div style="color:orange; padding:10px; border: 1px solid orange; border-radius: 5px; background-color: #fffaf0;">
            <strong>Erro: Falha na Descriptografia</strong>
            <p style="margin-top: 5px;">Não foi possível acessar os dados. Isso geralmente ocorre quando a senha está incorreta ou o arquivo não é um banco de dados válido.</p>
          </div>`;
      } else if (mensagemErro.includes('no such table')) {
          resultado.innerHTML = `
          <div style="color:#856404; padding:10px; border: 1px solid #ffeeba; border-radius: 5px; background-color: #fff3cd;">
            <strong>Erro: Estrutura do Banco de Dados Incompatível</strong>
            <p style="margin-top: 5px;">O arquivo é um banco de dados válido, mas não contém as tabelas esperadas (como a tabela "Lesson"). Verifique se este é o arquivo correto.</p>
          </div>`;
      } else if (mensagemErro.includes('SQLITE_CANTOPEN')) {
          resultado.innerHTML = `
          <div style="color:#0c5460; padding:10px; border: 1px solid #bee5eb; border-radius: 5px; background-color: #d1ecf1;">
            <strong>Erro: Não foi possível abrir o arquivo</strong>
            <p style="margin-top: 5px;">Verifique se o arquivo não foi movido, renomeado ou se o programa tem permissão para acessá-lo no local selecionado.</p>
          </div>`;
      } else if (mensagemErro.includes('SQLITE_BUSY')) {
          resultado.innerHTML = `
          <div style="color:#533f03; padding:10px; border: 1px solid #f0e68c; border-radius: 5px; background-color: #fffacd;">
            <strong>Erro: Arquivo em Uso</strong>
            <p style="margin-top: 5px;">O banco de dados está sendo usado por outro programa. Por favor, feche outros programas que possam estar acessando o arquivo (como o DB Browser) e tente novamente.</p>
          </div>`;
      } else if (mensagemErro.includes('SQLITE_IOERR')) {
        resultado.innerHTML = `
          <div style="color:red; padding:10px; border: 1px solid red; border-radius: 5px; background-color: #fff5f5;">
            <strong>Erro de Leitura/Escrita</strong>
            <p style="margin-top: 5px;">Ocorreu um erro ao tentar ler o arquivo do disco. Verifique se o dispositivo de armazenamento está funcionando corretamente.</p>
          </div>`;
      } else {
        resultado.innerHTML = `<p style="color:red;">Erro Inesperado: ${mensagemErro}</p>`;
      }
      
      alertSucesso.style.display = 'none';
    }
  });
});