# BaseScan

BaseScan é uma ferramenta de análise e varredura de bases de dados SQLite (.db), com foco em aplicações forenses, educacionais ou de engenharia reversa. Ela facilita a extração e visualização de dados de arquivos `.db` que contenham tabelas de interesse, como `Lesson`.

## 🎯 Objetivo Atual

O objetivo atual do projeto é transformar o BaseScan em um sistema completo com as seguintes funcionalidades:

- 📊 Análise de desligamentos de coletor.
- ⏱️ Identificação de intervalos de tempo relevantes dentro da base.
- 📁 Análise e interpretação de logs.

Essas funcionalidades permitirão diagnósticos mais precisos e rápidos de eventos registrados em sistemas que utilizam banco de dados local criptografado.

## 🚀 Funcionalidades Atuais

- Abertura de arquivos `.db` com suporte a SQLCipher (criptografia).
- Consulta de dados da tabela `Lesson`.
- Interface simples e prática para análise de conteúdo de bases.
- Possibilidade de integração com outras ferramentas de análise.

## 🔒 Criptografia

Este projeto é compatível com arquivos `.db` criptografados via SQLCipher. A senha padrão utilizada atualmente é:

123Mudar


> ⚠️ **Atenção:** Certifique-se de ter autorização para acessar e analisar os arquivos utilizados com esta ferramenta.

## 🧰 Tecnologias Utilizadas

- **Node.js** + **Electron** – Interface desktop multiplataforma.
- **SQLCipher** – Biblioteca para leitura de bases SQLite criptografadas.
- **SQLite3** – Manipulação de bases locais.
- **JavaScript / HTML / CSS** – Interface e lógica do app.

## 🖥️ Como Executar o Projeto

### Pré-requisitos

- Node.js (v18+ recomendado)
- npm

# Projeto em andamento sob responsabilidade do Núcleo de Desenvolvimento
