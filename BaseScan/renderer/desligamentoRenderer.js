window.addEventListener('DOMContentLoaded', () => {
  const inputArquivo = document.getElementById('fileInput');
  const resultadoDiv = document.getElementById('resultado');

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

  inputArquivo.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Envia o caminho do arquivo para análise
    // Como não tem acesso direto ao path, você pode adaptar para enviar o conteúdo do arquivo se preferir
    // Aqui vamos assumir que você passará o conteúdo do arquivo
    const text = await file.text();

    // Chamando via API exposta no preload (adaptar analisarDesligamento para aceitar o conteúdo)
    const result = await window.electronAPI.analisarDesligamento(text);

    // Exibir resultado formatado
    if (result && result.length > 0) {
  resultadoDiv.innerHTML = `
    <h3>Saltos Detectados:</h3>
    <table class="tabela-resultados">
      <thead>
        <tr>
          <th>Início</th>
          <th>Fim</th>
          <th>Duração</th>
          <th>Salto</th>
        </tr>
      </thead>
      <tbody>
        ${result.map(item => `
          <tr>
            <td>${item[0]}</td>
            <td>${item[1]}</td>
            <td>${item[2]} min</td> 
            <td class="${parseInt(item[2]) > 5 ? 'salto-vermelho' : 'salto-verde'}">
            <strong>${item[3]}</strong>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
} else {
  resultadoDiv.textContent = '❌ Nenhum salto detectado.';
}
  });
});

// linha 36 alterada para que a estilização seja aplicada com base no salto da telemetria