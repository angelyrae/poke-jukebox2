const formBusca = document.getElementById('form-busca');
const inputPokemon = document.getElementById('input-pokemon');
const statusCarregamento = document.getElementById('status-carregamento');
const mensagemErro = document.getElementById('mensagem-erro');
const resultadosSimultaneos = document.getElementById('resultados-simultaneos');
const pokemonConteudo = document.getElementById('pokemon-conteudo');
const musicaConteudo = document.getElementById('musica-conteudo');

const formSalvar = document.getElementById('form-salvar');
const inputNota = document.getElementById('nota-treinador');
const btnSalvarCombinacao = document.getElementById('btn-salvar-combinacao');
const listaPlaylist = document.getElementById('lista-playlist');

let estadoAtual = null;

formBusca.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const termo = inputPokemon.value.trim().toLowerCase();
  if (!termo) return;

  mensagemErro.classList.add('oculto');
  resultadosSimultaneos.classList.add('oculto');
  statusCarregamento.classList.remove('oculto');
  btnSalvarCombinacao.disabled = true;

  try {
    const [respostaPoke, respostaItunes] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(termo)}`),
      fetch(`https://itunes.apple.com/search?term=pokemon+${encodeURIComponent(termo)}&media=music&limit=3`)
    ]);

    if (!respostaPoke.ok) {
      throw new Error('Pokémon não encontrado na PokéAPI. Tente outro nome ou número.');
    }

    const [dadosPokemon, dadosItunes] = await Promise.all([
      respostaPoke.json(),
      respostaItunes.json()
    ]);

    renderizarPokemon(dadosPokemon);
    renderizarMusicas(dadosItunes.results, dadosPokemon.name);

    const primeiraMusica = dadosItunes.results[0];
    estadoAtual = {
      pokemon: dadosPokemon.name,
      tipo: dadosPokemon.types[0]?.type?.name || 'normal',
      musica: primeiraMusica ? primeiraMusica.trackName : `Tema de ${dadosPokemon.name}`,
      artista: primeiraMusica ? primeiraMusica.artistName : 'Pokémon Sound Team'
    };

    btnSalvarCombinacao.disabled = false;
    resultadosSimultaneos.classList.remove('oculto');
  } catch (erro) {
    mensagemErro.textContent = erro.message;
    mensagemErro.classList.remove('oculto');
  } finally {
    statusCarregamento.classList.add('oculto');
  }
});

function renderizarPokemon(pokemon) {
  const sprite = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
  const tiposHtml = pokemon.types
    .map((t) => `<span class="tipo-tag">${t.type.name}</span>`)
    .join('');

  const hp = pokemon.stats.find((s) => s.stat.name === 'hp')?.base_stat || 0;
  const ataque = pokemon.stats.find((s) => s.stat.name === 'attack')?.base_stat || 0;

  pokemonConteudo.innerHTML = `
    <div class="pokemon-info">
      <img src="${sprite}" alt="${pokemon.name}" />
      <h3>#${pokemon.id} - ${pokemon.name.toUpperCase()}</h3>
      <div class="tipos-lista">${tiposHtml}</div>
      <p><strong>Altura:</strong> ${pokemon.height / 10} m | <strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
      <p><strong>HP Base:</strong> ${hp} | <strong>Ataque Base:</strong> ${ataque}</p>
    </div>
  `;
}

function renderizarMusicas(faixas, nomePokemon) {
  if (!faixas || faixas.length === 0) {
    musicaConteudo.innerHTML = `<p>Nenhuma faixa encontrada no iTunes para "${nomePokemon}".</p>`;
    return;
  }

  const listaHtml = faixas
    .map(
      (faixa) => `
      <div class="faixa-item">
        <strong>${faixa.trackName}</strong>
        <p style="font-size: 0.85rem; color: #475569;">Artista: ${faixa.artistName}</p>
        ${faixa.previewUrl ? `<audio controls src="${faixa.previewUrl}"></audio>` : ''}
      </div>
    `
    )
    .join('');

  musicaConteudo.innerHTML = listaHtml;
}

async function carregarPlaylist() {
  const resposta = await fetch('/api/playlist');
  const itens = await resposta.json();

  listaPlaylist.innerHTML = '';

  itens.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'playlist-item';
    div.innerHTML = `
      <div>
        <strong>${item.pokemon.toUpperCase()}</strong> (${item.tipo}) &bull; <em>${item.musica}</em> (${item.artista})
        <p style="font-size: 0.85rem; color: #64748b;">Nota: ${item.nota}</p>
      </div>
      <div class="playlist-acoes">
        <button class="btn-editar" onclick="editarNota(${item.id}, '${item.nota.replace(/'/g, "\\'")}')">Editar (PUT)</button>
        <button class="btn-excluir" onclick="removerItem(${item.id})">Excluir (DELETE)</button>
      </div>
    `;
    listaPlaylist.appendChild(div);
  });
}

formSalvar.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!estadoAtual) return;

  const payload = {
    ...estadoAtual,
    nota: inputNota.value.trim() || 'Trilha sonora favorita'
  };

  const resposta = await fetch('/api/playlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (resposta.ok) {
    inputNota.value = '';
    carregarPlaylist();
  }
});

async function editarNota(id, notaAtual) {
  const novaNota = prompt('Atualize a anotação desta combinação:', notaAtual);
  if (novaNota === null) return;

  const resposta = await fetch(`/api/playlist/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nota: novaNota })
  });

  if (resposta.ok) {
    carregarPlaylist();
  }
}

async function removerItem(id) {
  const resposta = await fetch(`/api/playlist/${id}`, {
    method: 'DELETE'
  });

  if (resposta.ok) {
    carregarPlaylist();
  }
}

carregarPlaylist();
