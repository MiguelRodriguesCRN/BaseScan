window.addEventListener('DOMContentLoaded', () => {
  const btnAnalisarSaltos = document.getElementById('btnAnalisarSaltos');
  const inputLessonOid = document.getElementById('lessonOidInput');
  const resultado = document.getElementById('resultadoSaltos');
  const btnSelecionar = document.getElementById('btnSelecionar');
  const caminhoArquivo = document.getElementById('caminhoArquivo');
  const voltarSidebar = document.getElementById('voltar-sidebar');
  const errorMessage = document.getElementById('error-message'); // Elemento para exibir o erro

  const btnAjuda = document.getElementById("btnAjuda");
  const ajudaContainer = document.getElementById("ajuda-container");
  const btnFechar = document.getElementById("btnFechar");
  const pagina1 = document.getElementById("pagina1");
  const pagina2 = document.getElementById("pagina2");
  const proxima1 = document.getElementById("proxima1");
  const voltar1 = document.getElementById("voltar1");

  const toast = document.getElementById('toast-notification');
  const toastCloseBtn = document.querySelector('.toast-close-btn');

  let toastTimeout;

  function showToast() {
    clearTimeout(toastTimeout);
    toast.classList.add('show');
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 7000); // O toast desaparecerá após 7 segundos
  }

  if (toastCloseBtn) {
    toastCloseBtn.addEventListener('click', () => {
      clearTimeout(toastTimeout);
      toast.classList.remove('show');
    });
  }


  btnAjuda.addEventListener("click", () => {
    ajudaContainer.classList.add("ativo");
    pagina1.style.display = "block";
    pagina2.style.display = "none";
  });

  btnFechar.addEventListener("click", () => ajudaContainer.classList.remove("ativo"));
  proxima1.addEventListener("click", () => {
    pagina1.style.display = "none";
    pagina2.style.display = "block";
  });
  voltar1.addEventListener("click", () => {
    pagina2.style.display = "none";
    pagina1.style.display = "block";
  });

  voltarSidebar.addEventListener('click', () => window.electronAPI.abrirTela('inicio'));

  let arquivoSelecionado = null;

  btnSelecionar.addEventListener('click', async () => {
    if (errorMessage) errorMessage.textContent = ''; // Limpa o erro ao selecionar novo arquivo
    const file = await window.electronAPI.selecionarArquivo();
    if (file) {
      arquivoSelecionado = file;
      caminhoArquivo.textContent = `📄 Arquivo selecionado: ${file}`;
      caminhoArquivo.style.display = 'block';
    } else {
      arquivoSelecionado = null;
      caminhoArquivo.textContent = '❌ Nenhum arquivo selecionado.';
      caminhoArquivo.style.display = 'block';
    }
    resultado.innerHTML = '';
  });

  btnAnalisarSaltos.addEventListener('click', async () => {
    const lessonOid = inputLessonOid.value.trim();
    if (errorMessage) errorMessage.textContent = ''; // Limpa erros anteriores

    if (!arquivoSelecionado) {
      if (errorMessage) errorMessage.textContent = 'Por favor, selecione o arquivo .db primeiro.';
      return;
    }

    if (!lessonOid) {
      if (errorMessage) errorMessage.textContent = 'Preencha o LessonOID para continuar.';
      return;
    }

    resultado.innerHTML = `<p class="analisando">⏳ Analisando...</p>`;

    try {
      const resposta = await window.electronAPI.analisarSaltosTempo({
        dbPath: arquivoSelecionado,
        senha: '123Mudar',
        lessonOid
      });
      showToast();

      if (!resposta.oidEncontrado) {
        resultado.innerHTML = `
          <div class="tabela-wrapper">
            <table class="tabela-erro">
              <thead>
                <tr><th>Mensagem</th></tr>
              </thead>
              <tbody>
                <tr><td>⚠️ LessonOID "${lessonOid}" não encontrado.</td></tr>
              </tbody>
            </table>
          </div>
        `;
        return;
      }

      resultado.innerHTML = '';
      let problemasEncontrados = false;
      let sqlExceptionHTML = "";

      const saltosValidos = resposta.saltos.filter(s => !isNaN(s.diferencaSegundos));

      let mensagemStatus = '';
      let corStatus = '';

      if (resposta.houveRegressao) {
        mensagemStatus = '⚠️ Houve regressão detectada!';
        corStatus = 'red';
        problemasEncontrados = true;
      } else if (saltosValidos.length === 0) {
        mensagemStatus = '✅ Não houve salto.';
        corStatus = 'green';
      } else {
        const maiorSalto = Math.max(...saltosValidos.map(s => s.diferencaSegundos));
        const minutos = Math.floor(maiorSalto / 60);
        const segundos = maiorSalto % 60;
        mensagemStatus = `⚠️ Houve salto de ${minutos}min ${segundos}seg.`;
        corStatus = 'orange';
        problemasEncontrados = true;
      }

      resultado.innerHTML = `<p style="color:${corStatus}; font-weight:bold; font-size:1.1em;">${mensagemStatus}</p>`;

      if (resposta.segmentosDetalhes && resposta.segmentosDetalhes.length > 0) {
        let segmentosHTML = `<div class="tabela-wrapper"><table class="tabela-debug"><thead>
          <tr><th>Segmento</th><th>Horário Inicial</th><th>Horário Final</th></tr>
          </thead><tbody>`;
        for (const segmento of resposta.segmentosDetalhes) {
          segmentosHTML += `<tr>
            <td>${segmento.segmento}</td>
            <td>${segmento.horarioInicial}</td>
            <td>${segmento.horarioFinal}</td>
          </tr>`;
        }
        segmentosHTML += `</tbody></table></div>`;
        resultado.innerHTML += segmentosHTML;
      }


      if (resposta.debugText && resposta.debugText.length > 0) {
        const keys = Object.keys(resposta.debugText[0]);
        let debugHTML = `<div class="tabela-wrapper"><table class="tabela-debug"><thead><tr>`;
        for (const key of keys) debugHTML += `<th>${key}</th>`;
        debugHTML += `</tr></thead><tbody>`;
        for (const row of resposta.debugText) {
          debugHTML += `<tr>`;
          for (const key of keys) debugHTML += `<td>${row[key]}</td>`;
          debugHTML += `</tr>`;
        }
        debugHTML += `</tbody></table></div>`;
        resultado.innerHTML += debugHTML;
      }

      if (resposta.houveRegressao) {
        resultado.innerHTML += `
          <div class="tabela-wrapper">
            <table class="tabela-aviso">
              <thead><tr><th>Possível Problema</th></tr></thead>
              <tbody><tr><td>⚠️ Possivelmente o coletor trocou de horário durante a aula.</td></tr></tbody>
            </table>
          </div>
        `;
      }

      if (saltosValidos.length > 0) {
        let saltosHTML = `<div class="tabela-wrapper"><table class="tabela-saltos"><thead>
          <tr><th>Anterior</th><th>Atual</th><th>Diferença</th><th>Segmento</th></tr>
          </thead><tbody>`;
        for (const salto of saltosValidos) {
          const minutos = Math.floor(salto.diferencaSegundos / 60);
          const segundos = salto.diferencaSegundos % 60;
          saltosHTML += `<tr>
            <td>${salto.anterior}</td>
            <td>${salto.atual}</td>
            <td>${minutos}min ${segundos}seg</td>
            <td>${salto.segmento}</td>
          </tr>`;
        }
        saltosHTML += `</tbody></table></div>`;
        resultado.innerHTML += saltosHTML;
      }

      if (resposta.sqlException) {
        problemasEncontrados = true;
        sqlExceptionHTML = `
          <div class="tabela-wrapper">
            <table class="tabela-erro">
              <thead><tr><th>SQL Exception detectada</th></tr></thead>
              <tbody><tr><td>${resposta.sqlException}</td></tr></tbody>
            </table>
          </div>
        `;
      }

      if (!problemasEncontrados) {
        resultado.innerHTML += `
          <div class="tabela-wrapper">
            <table class="tabela-sucesso">
              <thead><tr><th>Resultado</th></tr></thead>
              <tbody><tr><td>✅ Nenhuma inconsistência encontrada.</td></tr></tbody>
            </table>
          </div>
        `;
      }

      if (sqlExceptionHTML) resultado.innerHTML += sqlExceptionHTML;

    } catch (error) {
      showToast();
      resultado.innerHTML = `
        <div class="tabela-wrapper">
          <table class="tabela-erro">
            <thead><tr><th>Erro ao analisar</th></tr></thead>
            <tbody><tr><td>${error.message}</td></tr></tbody>
          </table>
        </div>
      `;
    }
  });
});