(() => {
  // Busca tabela de imagens pelo ID contendo "_dviImagens" e "DXMainTable"
  const tabelaImagens = Array.from(document.querySelectorAll('table[id*="_dviImagens"][id*="DXMainTable"]'))[0];

  // Busca tabela de validações pelo ID contendo "_dviInformacoes" e "DXMainTable"
  const tabelaValidacoes = Array.from(document.querySelectorAll('table[id*="_dviInformacoes"][id*="DXMainTable"]'))[0];

  // Busca elemento de quantidade de aulas pelo ID contendo "xaf_dviQuantidadeAulas_View"
  const quantidadeAulasEl = document.querySelector('[id*="xaf_dviQuantidadeAulas_View"]');

  const contarImagens = tabela => {
    if (!tabela) return 0;
    // Conta apenas imagens maiores (exclui ícones pequenos)
    return Array.from(tabela.querySelectorAll('img')).filter(img => img.width > 50).length;
  };

  const totalImagens = contarImagens(tabelaImagens);
  const totalValidacoes = contarImagens(tabelaValidacoes);
  const quantidadeAulas = quantidadeAulasEl ? quantidadeAulasEl.textContent.trim() : 'Não encontrado';

  alert(`✅ Resultado:
📸 Imagens: ${totalImagens}
✅ Validações: ${totalValidacoes}
🎓 Quantidade de Aulas: ${quantidadeAulas}`);
})();
