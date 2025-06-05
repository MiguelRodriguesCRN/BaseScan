function abrirTela(win, tipo) {
  const telaMap = {
    aulas: 'pages/aulas.html',
    logs: 'pages/logs.html',
    desligamento: 'pages/desligamento.html',
    inicio: 'pages/inicio.html'
  };

  const caminho = telaMap[tipo];
  if (caminho) {
    win.loadFile(caminho);
  }
}

module.exports = { abrirTela };
