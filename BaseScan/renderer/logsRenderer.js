const cpfInput = document.getElementById('cpf');
const ufSelect = document.getElementById('uf');
const selecionarBtn = document.getElementById('selecionar');
const resultado = document.getElementById('resultado');

selecionarBtn.addEventListener('click', async () => {
  const cpf = cpfInput.value.trim();
  const uf = ufSelect.value;

  // Validação do CPF
  if (!cpf || !/^\d{11}$/.test(cpf)) {
    resultado.textContent = 'Por favor, insira um CPF válido apenas com números.';
    return;
  }

  const caminho = await window.electronAPI.selecionarArquivoLog();
  if (!caminho) {
    resultado.textContent = 'Nenhum arquivo selecionado.';
    return;
  }

  try {
    const houveDesconexao = await window.electronAPI.analisarLog({ caminho, cpf, uf });
    if (houveDesconexao) {
      resultado.textContent = '⚠️ Exame com DESCONEXÃO de dispositivo detectada.';
    } else {
      resultado.textContent = '✅ Exame sem desconexão.';
    }
  } catch (err) {
    resultado.textContent = 'Erro na análise: ' + err.message; // Adicionando err.message para mais clareza
  }
});
