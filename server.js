// Importa o módulo 'express', framework responsável por criar o servidor HTTP e gerenciar rotas
const express = require('express');

// Importa o módulo nativo 'path' do Node.js para lidar com caminhos de diretórios de forma segura
const path = require('path');

// Inicializa a aplicação Express
const app = express();

// Define a porta em que o servidor vai rodar (usa a porta do ambiente ou a 3000 como padrão)
const PORT = process.env.PORT || 3000;

// Middleware que permite ao Express interpretar requisições com corpo no formato JSON
app.use(express.json());

// Middleware que serve arquivos estáticos (HTML, CSS, JS) a partir da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Banco de dados em memória para armazenar as combinações criadas pelo usuário (Pokémon + Música)
let playlistTreinador = [
  {
    id: 1,
    pokemon: 'pikachu',
    tipo: 'electric',
    musica: 'Pokemon Theme',
    artista: 'Jason Paige',
    nota: 'Clássico para iniciar a jornada'
  }
];

// Variável auxiliar para gerar identificadores únicos (IDs) incrementais
let proximoId = 2;

// Método GET: Retorna todos os itens salvos na playlist do treinador
app.get('/api/playlist', (req, res) => {
  // Responde com status HTTP 200 (OK) e envia a lista completa em formato JSON
  res.status(200).json(playlistTreinador);
});

// Método GET por ID: Busca um item específico da playlist pelo seu identificador
app.get('/api/playlist/:id', (req, res) => {
  // Converte o parâmetro 'id' recebido na URL de string para número inteiro
  const id = parseInt(req.params.id);

  // Procura na lista o item cujo ID corresponda ao solicitado
  const item = playlistTreinador.find((registro) => registro.id === id);

  // Se o item não existir, retorna status HTTP 404 (Não Encontrado)
  if (!item) {
    return res.status(404).json({ erro: 'Combinação não encontrada na playlist.' });
  }

  // Retorna o item encontrado com status HTTP 200 (OK)
  res.status(200).json(item);
});

// Método POST: Adiciona uma nova combinação de Pokémon e Música na playlist
app.post('/api/playlist', (req, res) => {
  // Extrai os dados enviados no corpo da requisição (body)
  const { pokemon, tipo, musica, artista, nota } = req.body;

  // Valida se os campos obrigatórios foram preenchidos
  if (!pokemon || !musica) {
    return res.status(400).json({ erro: 'Os campos pokemon e musica são obrigatórios.' });
  }

  // Cria o novo objeto com os dados recebidos e atribui um ID único
  const novoItem = {
    id: proximoId++,
    pokemon,
    tipo: tipo || 'normal',
    musica,
    artista: artista || 'Artista Desconhecido',
    nota: nota || 'Sem anotações'
  };

  // Adiciona o novo objeto ao array em memória
  playlistTreinador.push(novoItem);

  // Retorna status HTTP 201 (Criado) junto com o objeto recém-criado
  res.status(201).json(novoItem);
});

// Método PUT: Atualiza a anotação ou música de um item existente na playlist
app.put('/api/playlist/:id', (req, res) => {
  // Converte o parâmetro 'id' da URL para número inteiro
  const id = parseInt(req.params.id);

  // Extrai os novos dados enviados no corpo da requisição
  const { nota, musica, artista } = req.body;

  // Localiza o índice do item no array em memória
  const index = playlistTreinador.findIndex((registro) => registro.id === id);

  // Caso o índice seja -1, o item não existe; retorna status HTTP 404
  if (index === -1) {
    return res.status(404).json({ erro: 'Item não encontrado para atualização.' });
  }

  // Atualiza apenas os campos enviados, mantendo os anteriores caso não sejam informados
  playlistTreinador[index] = {
    ...playlistTreinador[index],
    nota: nota !== undefined ? nota : playlistTreinador[index].nota,
    musica: musica !== undefined ? musica : playlistTreinador[index].musica,
    artista: artista !== undefined ? artista : playlistTreinador[index].artista
  };

  // Retorna status HTTP 200 (OK) com o objeto atualizado
  res.status(200).json(playlistTreinador[index]);
});

// Método DELETE: Remove um item da playlist pelo seu ID
app.delete('/api/playlist/:id', (req, res) => {
  // Converte o parâmetro 'id' da URL para número inteiro
  const id = parseInt(req.params.id);

  // Verifica se o item existe antes de tentar removê-lo
  const existe = playlistTreinador.some((registro) => registro.id === id);

  // Se não existir, retorna status HTTP 404 (Não Encontrado)
  if (!existe) {
    return res.status(404).json({ erro: 'Item não encontrado para exclusão.' });
  }

  // Filtra o array mantendo todos os itens, exceto o que possui o ID informado
  playlistTreinador = playlistTreinador.filter((registro) => registro.id !== id);

  // Retorna status HTTP 200 (OK) confirmando a remoção
  res.status(200).json({ mensagem: 'Item removido com sucesso.' });
});

// Garante que qualquer outra rota GET devolva o arquivo principal 'index.html'
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia o servidor e passa a escutar requisições na porta configurada
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
