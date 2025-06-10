window.addEventListener('DOMContentLoaded', () => {
  const inputArquivo = document.getElementById('fileInput');
  const resultadoDiv = document.getElementById('resultado');

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
      resultadoDiv.innerHTML = '<h3>Saltos Detectados:</h3><ul>' + 
        result.map(item => `<li>${item[0]} → ${item[1]} — ${item[2]} min — <strong>${item[3]}</strong></li>`).join('') +
        '</ul>';
    } else {
      resultadoDiv.textContent = 'Nenhum salto detectado.';
    }
  });
});
