# Poké-Jukebox


1. **PokéAPI (`https://pokeapi.co/api/v2/`)**
   - **Proposta:** Fornecer dados estruturados de criaturas da franquia Pokémon, incluindo sprites oficiais, tipos elementais, altura, peso e atributos base (HP e Ataque).
   - **Documentação Oficial:** https://pokeapi.co/docs/v2
   - **Método utilizado na API pública:** `GET /pokemon/{id ou nome}`

2. **iTunes Search API (`https://itunes.apple.com/search`)**
   - **Proposta:** Buscar trilhas sonoras, músicas temáticas e prévias de áudio (`previewUrl`) associadas ao Pokémon pesquisado.
   - **Documentação Oficial:** https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/
   - **Método utilizado na API pública:** `GET /search?term={termo}&media=music&limit=3`

## 2. Arquitetura REST e Exemplos de Métodos

- **GET `/api/playlist`**: Lista todas as combinações de Pokémon e música salvas pelo usuário.
- **GET `/api/playlist/:id`**: Consulta uma combinação específica pelo seu identificador numérico.
- **POST `/api/playlist`**: Recebe um objeto JSON contendo os dados extraídos da PokéAPI e da iTunes API e cria um novo registro (retorna HTTP `201 Created`).
- **PUT `/api/playlist/:id`**: Atualiza a anotação personalizada de um registro existente (retorna HTTP `200 OK`).
- **DELETE `/api/playlist/:id`**: Remove um registro específico da memória do servidor (retorna HTTP `200 OK`).

## 3. Como Executar o Projeto

1. Instale as dependências: `npm install`
2. Inicie o servidor Express: `npm start`
3. Acesse no navegador: `http://localhost:3000`
