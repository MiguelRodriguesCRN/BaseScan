window.addEventListener('DOMContentLoaded', () => {
  const btnAnalisarSaltos = document.getElementById('btnAnalisarSaltos');
  const inputLessonOid = document.getElementById('lessonOidInput');
  const resultado = document.getElementById('resultadoSaltos');
  const btnSelecionar = document.getElementById('btnSelecionar');
  const caminhoArquivo = document.getElementById('caminhoArquivo');
  const voltarSidebar = document.getElementById('voltar-sidebar');

  const btnAjuda = document.getElementById("btnAjuda");
  const ajudaContainer = document.getElementById("ajuda-container");
  const btnFechar = document.getElementById("btnFechar");
  const pagina1 = document.getElementById("pagina1");
  const pagina2 = document.getElementById("pagina2");
  const proxima1 = document.getElementById("proxima1");
  const voltar1 = document.getElementById("voltar1");

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
    if (!lessonOid || !arquivoSelecionado) {
      alert('Preencha o LessonOID e selecione o arquivo.');
      return;
    }

    resultado.innerHTML = `<p style="color: #007bff;">⏳ Analisando...</p>`;

    try {
      const resposta = await window.electronAPI.analisarSaltosTempo({
        dbPath: arquivoSelecionado,
        senha: '123Mudar',
        lessonOid
      });

      if (!resposta.oidEncontrado) {
        resultado.innerHTML = `
          <div style="background-color: #fff4e6; border-left: 4px solid #ffa500; padding: 10px; border-radius: 5px;">
            <p style="margin:0; font-weight: bold; color: #ff8000;">⚠️ LessonOID "${lessonOid}" não encontrado.</p>
          </div>
        `;
        return;
      }

      resultado.innerHTML = '';

      let problemasEncontrados = false;

      if (resposta.debugText && resposta.debugText.length > 0) {
        resultado.innerHTML += `
          <div style="background-color: #f9f9f9; border-left: 4px solid #00aaff; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
            <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #007bff;">Dados de Diagnóstico:</h4>
            <pre style="white-space: pre-wrap; word-wrap: break-word; font-size: 12px; color: #333;">${JSON.stringify(resposta.debugText, null, 2)}</pre>
          </div>
        `;
      }

      if (resposta.sqlException) {
        problemasEncontrados = true;
        resultado.innerHTML += `
          <div style="background-color: #ffe6e6; border-left: 4px solid #ff4d4d; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
            <p style="margin:0; font-weight: bold; color: #ff0000;">SQL Exception detectada:</p>
            <pre style="white-space: pre-wrap; word-wrap: break-word; font-size: 12px; color: #800000;">${resposta.sqlException}</pre>
          </div>
        `;
      }

      if (resposta.houveRegressao) {
        problemasEncontrados = true;
        resultado.innerHTML += `
          <div style="background-color: #fff4e6; border-left: 4px solid #ffa500; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
            <p style="margin:0; font-weight: bold; color: #ff8000;">⚠️ Possivelmente o coletor trocou de horário durante a aula.</p>
          </div>
        `;
      }

      const saltosValidos = resposta.saltos.filter(s => !isNaN(s.diferencaSegundos));
      if (saltosValidos.length > 0) {
        problemasEncontrados = true;
        let html = `
          <div style="background-color: #fff4e6; border-left: 4px solid #ffa500; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
            <p style="margin:0; font-weight: bold; color: #ff8000;">⚠️ Saltos de tempo detectados:</p>
            <ul style="margin:5px 0 0 20px; padding:0;">
        `;
        for (const salto of saltosValidos) {
          html += `<li>De ${salto.anterior} para ${salto.atual} — ${salto.diferencaFormatada || Math.round(salto.diferencaSegundos) + ' segundos'}</li>`;
        }
        html += '</ul></div>';
        resultado.innerHTML += html;
      }

      if (!problemasEncontrados) {
        resultado.innerHTML += `
          <div style="background-color: #e6ffed; border-left: 4px solid #28a745; padding: 10px; border-radius: 5px;">
            <p style="margin:0; font-weight: bold; color: #19692c;">✅ Nenhuma inconsistência encontrada.</p>
          </div>
        `;
      }

    } catch (error) {
      resultado.innerHTML = `
        <div style="background-color: #ffe6e6; border-left: 4px solid #ff4d4d; padding: 10px; border-radius: 5px;">
          <p style="margin:0; font-weight: bold; color: #ff0000;">Erro ao analisar:</p>
          <pre style="white-space: pre-wrap; word-wrap: break-word; font-size: 12px; color: #800000;">${error.message}</pre>
        </div>
      `;
    }
  });
});
