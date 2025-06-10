(async () => {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const dados = [['DATA', 'GPS DUVIDOSO?']];

  const getTabela = () => document.querySelector('[id*="xaf_dviLocalizacoes"][id*="DXMainTable"]');

  const extrairDadosPagina = () => {
    const tabela = getTabela();
    if (!tabela) return;

    tabela.querySelectorAll('tr').forEach((linha, indice) => {
      if (indice === 0) return;
      const cells = linha.querySelectorAll('td');
      const dataCell = cells[0]?.textContent.trim() || '';
      const gpsCell = cells[4]?.textContent.trim() || '';
      dados.push([dataCell, gpsCell]);
    });
  };

  // Pega todos os botões com onclick contendo GVPagerOnClick e PN
  const botoesPaginacao = Array.from(document.querySelectorAll('[onclick^="ASPx.GVPagerOnClick"]'))
    .filter(btn => btn.getAttribute('onclick').includes('PN'));

  if (botoesPaginacao.length === 0) {
    alert('❌ Não foi possível identificar o ID da grid de paginação.');
    return;
  }

  // Extrai o gridId (assumindo que todos usam o mesmo)
  const gridId = botoesPaginacao[0].getAttribute('onclick').match(/ASPx\.GVPagerOnClick\('([^']+)'/)[1];

  // Extrai todos os índices PN (ex: PN0, PN1, PN2 ...) e pega o maior
  const indicesPN = botoesPaginacao.map(btn => {
    const match = btn.getAttribute('onclick').match(/PN(\d+)/);
    return match ? parseInt(match[1], 10) : -1;
  }).filter(i => i >= 0);

  const maxPagina = Math.max(...indicesPN);

  for (let i = 0; i <= maxPagina; i++) {
    console.log(`Coletando página ${i + 1} de ${maxPagina + 1}...`);
    window.ASPx.GVPagerOnClick(gridId, `PN${i}`);
    await delay(1200); // Ajuste se necessário
    extrairDadosPagina();
  }

  // Cria CSV e baixa
  const csv = dados.map(linha => linha.join(';')).join('\n');
  const link = document.createElement('a');
  link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  link.download = 'localizacao_telemetria_completa.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
})();
