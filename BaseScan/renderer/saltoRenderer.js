window.addEventListener('DOMContentLoaded', () => {
  const btnSelecionar = document.getElementById('btnSelecionar');
  const caminhoArquivo = document.getElementById('caminhoArquivo');
  const btnAnalisarSaltos = document.getElementById('btnAnalisarSaltos');
  const inputLessonOid = document.getElementById('lessonOidInput');
  const resultado = document.getElementById('resultadoSaltos');
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

  btnFechar.addEventListener("click", () => {
    ajudaContainer.classList.remove("ativo");
  });

  proxima1.addEventListener("click", () => {
    pagina1.style.display = "none";
    pagina2.style.display = "block";
  });

  voltar1.addEventListener("click", () => {
    pagina2.style.display = "none";
    pagina1.style.display = "block";
  });

  voltarSidebar.addEventListener('click', () => {
    window.electronAPI.abrirTela('inicio');
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

  btnAnalisarSaltos.addEventListener('click', async () => {
    const lessonOid = inputLessonOid.value.trim();
    if (!lessonOid || !arquivoSelecionado) {
      alert('Preencha o LessonOID e selecione o arquivo.');
      return;
    }

    resultado.innerHTML = 'Analisando... aguarde  ⏳';

    try {
      const resposta = await window.electronAPI.analisarSaltosTempo({
        dbPath: arquivoSelecionado,
        senha: '123Mudar',
        lessonOid: lessonOid
      });

      console.log('Resposta do backend:', JSON.stringify(resposta, null, 2)); // Para depuração

      if (!resposta.oidEncontrado) {
        resultado.innerHTML = `<p style="color:orange;">⚠️ LessonOID "${lessonOid}" não encontrado na base, verifique se o OID está correto.</p>`;
        return;
      }

      resultado.innerHTML = ''; // Limpa a mensagem de "Analisando..."

      // Exibe mensagem de regressão, se houver
      if (resposta.houveRegressao) {
        resultado.innerHTML = '<p style="color:orange;">⚠️ Localizada possível troca de horário durante a aula, encaminhe ao N2 com os damais dados para analise</p>';
      }

      // Exibe saltos válidos, se houvera
      const saltosValidos = resposta.saltos.filter(s => !isNaN(s.diferencaSegundos));
      if (saltosValidos.length > 0) {
        let html = `
        <div class="tabela-wrapper">
          <table class= "tabela-saltos">
          <thead>
          <tr>
          <th>Anterior</th>
          <th>Atual</th>
          <th>Diferença em Minutos</th>
          </tr>
          </thead>
          <tbody>
        `;

        for (const salto of saltosValidos) {
          html += `
          <tr>
          <td>${salto.anterior}</td>
          <td>${salto.atual}</td>
          <td>${Math.round(salto.diferencaMinutos)} Minutos</td>
          </tr>
          `;
        }

        html += '</table>';
        resultado.innerHTML += html;
      }

      // Exibe mensagem de "nenhum evento" apenas se não houver regressões nem saltos
      if (!resposta.houveRegressao && saltosValidos.length === 0) {
        resultado.innerHTML = '<p>✅ Nenhum salto de tempo ou regressão encontrado, siga com a verificação dos demais dados das aulas</p>';
      }
    } catch (error) {
      resultado.innerHTML = `<p style="color:red;">Erro ao analisar: ${error.message}</p>`;
    }
  });
});