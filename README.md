# RocketLab Cinema

Um catálogo para descobrir filmes, compartilhar opiniões e explorar os números por trás das histórias.

Projeto desenvolvido para a atividade RocketLab 2026.2, com frontend em React, TypeScript e Tailwind CSS e uma API em FastAPI. A aplicação reúne navegação pública, gerenciamento administrativo e um dashboard que transforma os dados do catálogo em indicadores e rankings.

## O que você pode fazer

### Explorar e avaliar

- Navegar pelo catálogo com paginação e pesquisar filmes pelo título.
- Abrir os detalhes de um filme a partir do seu card, sem precisar pesquisar por ID.
- Consultar sinopse, gêneros, direção, roteiro, elenco e produtoras, quando disponíveis.
- Visualizar as avaliações dos usuários e a média de notas de cada filme.
- Publicar uma avaliação com nome, comentário e nota de **0 a 10**, incluindo decimais, sem precisar de login.
- Consultar notas externas e informações financeiras disponíveis na base.
- Navegar mesmo quando um filme não possui pôster, usando a imagem substituta da interface.

### Administrar o catálogo

O link **Administração** abre o fluxo de login. Após a autenticação, o painel oferece três áreas: **Dashboard**, **Gerenciar filmes** e **Cadastrar filme**.

O administrador pode cadastrar filmes com título, ano, sinopse, gêneros, diretores e informações complementares. Apenas o título é obrigatório no cadastro. O identificador externo dos novos registros é gerado pelo backend no formato `manual:<código>`.

A edição permite alterar **título, ano de lançamento e sinopse**. A exclusão solicita confirmação na interface antes de enviar a operação à API.

Essas permissões são verificadas no backend: esconder botões no frontend não é o mecanismo de proteção. Cadastro, edição, exclusão e acesso ao dashboard exigem um token administrativo válido.

## Funcionalidade extra: dashboard administrativo

O dashboard permite analisar todo o catálogo, independentemente da página ou da pesquisa aberta na listagem. Os cálculos são realizados no banco de dados pela API.

### Indicadores e distribuições

- Total de filmes cadastrados.
- Total de avaliações individuais.
- Quantidade de filmes com pelo menos uma avaliação.
- Média geral das notas dos usuários.
- Quantidade de filmes sem gênero ou sem ano informado.
- Gráficos de barras com a distribuição dos filmes por gênero e por ano.

Um filme pode pertencer a vários gêneros; por isso, a soma das barras de gêneros pode ser maior que o total de filmes. A média geral considera todas as avaliações individuais, e não a média simples das médias dos filmes.

### Sete formas de explorar os rankings

| Ranking | Critério |
| --- | --- |
| Melhores notas dos usuários | Média das avaliações, com mínimo configurável; padrão de 3 avaliações |
| Melhores notas no TMDB | Nota da fonte, com pelo menos 100 votos |
| Melhores notas no IMDb | Nota da fonte, com pelo menos 100 votos |
| Maiores lucros estimados | Receita menos orçamento |
| Maiores bilheterias | Maior receita registrada |
| Maiores retornos percentuais | `(receita − orçamento) / orçamento × 100` |
| Mais populares | Indicador de popularidade presente na base |

Cada ranking apresenta até dez registros. Na interface, é possível alternar o indicador, escolher o mínimo de avaliações dos usuários entre 1, 3, 5 e 10 e abrir os detalhes de um filme clicando em seu nome.

Os rankings financeiros usam dólares. Lucro e retorno exigem receita e orçamento positivos; bilheteria exige receita positiva, mesmo quando o orçamento não está disponível. O lucro é uma **estimativa baseada em receita e orçamento**, sem incluir todos os custos de uma produção.

### Atualização e origem dos dados

Os dados são consultados ao abrir a aba Dashboard, ao clicar em **Atualizar dados** ou ao alterar o mínimo de avaliações. Uma nova consulta considera as mudanças já gravadas no banco. A tela não possui atualização automática em tempo real.

As planilhas de origem são preservadas. Orçamentos atípicos, títulos repetidos e registros de outras categorias podem aparecer nos resultados conforme o conteúdo importado. Valores muito pequenos de orçamento, por exemplo, podem produzir percentuais de retorno elevados.

Notas de usuários da aplicação são apresentadas separadamente das notas de TMDB e IMDb. As informações externas refletem a base importada e não são sincronizadas automaticamente com esses serviços.

## Interface responsiva

Catálogo, detalhes, formulários, painel administrativo e dashboard utilizam layouts adaptáveis. Grades, botões e controles se reorganizam conforme a largura da tela, permitindo o uso em celular, tablet e computador.

A interface inclui estados de carregamento, mensagens de erro, confirmação de operações e tratamento para dados ou imagens ausentes. O dashboard usa barras construídas com os componentes da aplicação, sem uma biblioteca adicional de gráficos.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS e React Router |
| API | FastAPI, Pydantic e Uvicorn |
| Persistência | SQLite, SQLAlchemy assíncrono e aiosqlite |
| Migrações | Alembic |
| Autenticação | JWT com PyJWT e hash Argon2 com pwdlib |
| Verificação | pytest, HTTPX, Ruff, TypeScript e ESLint |

## Preparar o ambiente

Você precisa de:

- Git.
- Python **3.11 ou superior**, com suporte a ambientes virtuais.
- Node.js **22.12 ou superior** e npm.
- Os dez arquivos CSV fornecidos para a atividade, reunidos em uma pasta.

Clone o projeto e entre na pasta criada:

```bash
git clone https://github.com/ThIagoMedeiros21/rocketlab2026-2.git
cd rocketlab2026-2
```

Use dois terminais: um para a API e outro para o frontend. Execute os comandos do backend dentro de `backend/`, pois os caminhos padrão do `.env` e do banco são relativos a essa pasta.

## 1. Instalar o backend

### Linux e macOS

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[dev]"
```

### Windows — PowerShell

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
```

Se o PowerShell bloquear a ativação, não é necessário mudar a política do sistema: substitua `python` nos comandos seguintes por `.\.venv\Scripts\python.exe`. Para instalar nesse caso:

```powershell
.\.venv\Scripts\python.exe -m pip install -e ".[dev]"
```

## 2. Configurar o administrador e o ambiente

Com as dependências instaladas, gere o hash da senha do administrador:

```bash
python -c "from getpass import getpass; from pwdlib import PasswordHash; print(PasswordHash.recommended().hash(getpass('Senha do administrador: ')))"
```

Digite a senha que usará no login. Ela não será exibida enquanto você digita. Guarde a senha; o resultado impresso é o **hash**, que será usado na configuração.

Gere também a chave de assinatura dos tokens:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Crie `backend/.env` com o conteúdo abaixo. Substitua os dois valores indicados pelos resultados dos comandos e escolha seu usuário administrativo:

```dotenv
ENVIRONMENT=local
PROJECT_NAME="RocketLab Cinema API"
PROJECT_VERSION=2026.2
API_V1_PREFIX=/api/v1
DATABASE_URL=sqlite+aiosqlite:///./rocketlab.db
BACKEND_CORS_ORIGINS=["http://localhost:5173"]
LOG_LEVEL=INFO

ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH='COLE_AQUI_O_HASH_GERADO'
JWT_SECRET_KEY='COLE_AQUI_A_CHAVE_GERADA'
JWT_EXPIRE_MINUTES=60
```

Não use os textos de exemplo como credenciais. As variáveis de autenticação precisam estar preenchidas antes de executar a aplicação, as migrações ou o importador. Se partir de `.env.example`, acrescente as configurações administrativas acima.

O administrador é configurado pelo ambiente; não há cadastro público de contas. A senha é verificada pelo hash Argon2 e o login emite um JWT com validade padrão de **60 minutos**.

O frontend mantém o token apenas em memória. Recarregar a página exige novo login, e sair da administração remove o token da interface. O logout não revoga uma cópia do token já emitido: ele continua válido até expirar. A troca de `JWT_SECRET_KEY`, seguida do reinício da API, invalida os tokens anteriores.

**Não envie o `.env`, a senha ou a chave JWT para o repositório.** As instruções deste README são para execução local.

## 3. Criar o banco e importar as planilhas

Ainda em `backend/`, aplique as migrações:

```bash
python -m alembic upgrade head
```

O banco padrão será criado em `backend/rocketlab.db`. Não é necessário instalar um servidor de banco de dados separado.

Reúna estes arquivos em uma única pasta:

```text
dim_movies.csv
dim_genres.csv
dim_people.csv
dim_companies.csv
dim_reviews.csv
movies_reviews.csv
bridge_movie_genre.csv
bridge_movie_person.csv
bridge_movie_company.csv
fact_movies_performance.csv
```

Informe o caminho dessa pasta ao importador. O caminho pode ser diferente em cada computador; não é necessário editar o código.

Exemplo para Linux/macOS:

```bash
python -m app.movies.ingest_csv "/caminho/para/bases_atv_dev1"
```

Exemplo para Windows:

```powershell
python -m app.movies.ingest_csv "C:\caminho\para\bases_atv_dev1"
```

Se você colocar os CSVs em uma pasta `dados` na raiz do projeto, use, a partir de `backend/`:

```bash
python -m app.movies.ingest_csv ../dados
```

Os CSVs precisam ser disponibilizados nesse caminho; não assuma que vieram junto com o clone. Use aspas quando o caminho contiver espaços.

O importador carrega filmes, gêneros, pessoas, produtoras, relacionamentos, avaliações e desempenho financeiro. Ao final, recalcula os resumos das avaliações individuais. As planilhas não são reescritas.

A importação ignora conflitos nas chaves configuradas; ela não substitui automaticamente registros existentes por versões atualizadas do CSV. Como a carga ocorre em etapas, uma falha posterior não desfaz necessariamente as anteriores. Prefira executar a carga inicial antes de iniciar a API.

Para preparar um banco separado, altere `DATABASE_URL` para outro arquivo SQLite e repita as migrações e a importação. Não é necessário apagar o banco anterior.

## 4. Iniciar a API

Dentro de `backend/`, com o ambiente configurado:

```bash
python -m uvicorn app.main:app --reload
```

Endereços locais:

- API: [http://127.0.0.1:8000](http://127.0.0.1:8000).
- Swagger: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).
- Verificação de funcionamento: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health).

O endpoint `/health` deve retornar:

```json
{"status": "ok"}
```

Mantenha esse terminal aberto.

## 5. Iniciar o frontend

Em outro terminal, a partir da raiz do repositório:

```bash
cd frontend
npm ci
npm run dev -- --port 5173 --strictPort
```

Abra [http://localhost:5173](http://localhost:5173).

O uso de `--strictPort` evita que o Vite mude silenciosamente para outra porta, que pode não estar autorizada no CORS. Se a porta estiver ocupada, encerre a outra instância antes de iniciar novamente.

Atualmente, a URL da API está definida em `frontend/src/data/api.ts`:

```ts
const API_URL = 'http://127.0.0.1:8000/api/v1'
```

Para usar outra URL de backend, ajuste essa constante. O projeto não lê `VITE_API_URL` nessa implementação.

Se mudar o endereço ou a porta do frontend, atualize `BACKEND_CORS_ORIGINS` no `.env` do backend e reinicie a API. `localhost` e `127.0.0.1` são origens diferentes para o navegador. A configuração apresentada autoriza o frontend aberto em `http://localhost:5173`.

## Primeiro uso

1. Abra o catálogo e pesquise um título existente na base.
2. Clique no card para consultar os detalhes e as avaliações.
3. Envie uma avaliação e confira a nova nota média.
4. Acesse **Administração** e entre com o usuário e a senha configurados.
5. Explore os indicadores e alterne os rankings no **Dashboard**.
6. Em **Cadastrar filme**, crie um registro de teste.
7. Em **Gerenciar filmes**, pesquise esse registro, edite suas informações e teste sua exclusão.

O formulário de login recebe a senha original, não o hash armazenado no `.env`.

## Referência da API

Todas as rotas abaixo, exceto `/health`, usam o prefixo `/api/v1`.

| Método | Rota | Acesso | Finalidade |
| --- | --- | --- | --- |
| GET | `/health` | Público | Verificar se a API responde |
| POST | `/auth/login` | Público | Validar as credenciais administrativas |
| GET | `/movies` | Público | Listar filmes com paginação e busca por título |
| GET | `/movies/{movie_id}` | Público | Consultar informações e avaliações do filme |
| POST | `/movies/{movie_id}/reviews` | Público | Criar uma avaliação |
| POST | `/movies` | Administrador | Cadastrar filme |
| PATCH | `/movies/{movie_id}` | Administrador | Editar título, ano e sinopse |
| DELETE | `/movies/{movie_id}` | Administrador | Excluir filme |
| GET | `/dashboard` | Administrador | Consultar indicadores, distribuições e rankings |

### Busca e paginação

```text
GET /api/v1/movies?page=1&page_size=20&q=avengers
```

- `page`: começa em 1.
- `page_size`: de 1 a 100; padrão de 20.
- `q`: opcional; pesquisa parte do título sem diferenciar maiúsculas e minúsculas no comportamento usual da consulta. Por ser uma busca por trecho, também pode encontrar palavras maiores que contenham o texto pesquisado.
- Sem `q`, ou com texto em branco, a consulta retorna o catálogo paginado sem filtro por título.

A resposta contém `items`, `page`, `page_size`, `total` e `total_pages`. As avaliações são incluídas nos detalhes do filme, sem endpoint separado de paginação de avaliações.

### Cadastro de filme

Exemplo de corpo para `POST /api/v1/movies`:

```json
{
  "titulo": "Horizontes de Setembro",
  "ano_lancamento": 2026,
  "sinopse": "Dois amigos reencontram uma câmera e revisitam as histórias de sua cidade.",
  "generos": ["Drama"],
  "diretores": ["Marina Costa"]
}
```

O título não pode ser vazio nem conter somente espaços. Gêneros e diretores enviados não podem conter nomes vazios ou duplicados na mesma lista. O cadastro retorna `201` com `id`, `id_filme` e `titulo`.

Na edição, envie somente os campos que deseja atualizar:

```json
{
  "titulo": "Horizontes de Setembro — Nova Edição",
  "sinopse": "Uma nova descrição para o filme."
}
```

Campos omitidos permanecem inalterados. Gêneros e diretores são informados no cadastro, mas não fazem parte do contrato atual de edição. Filmes de mesmo título podem ter identificadores diferentes.

### Avaliação pública

Exemplo de corpo para `POST /api/v1/movies/{movie_id}/reviews`:

```json
{
  "nome": "Joana",
  "nota": 8.5,
  "comentario": "Gostei da história e da fotografia."
}
```

A escala é de 0 a 10. O backend rejeita notas fora desse intervalo e valores não finitos. Após o cadastro, o resumo de avaliações do filme é recalculado. Filmes sem avaliações apresentam `nota_media: null`.

### Autenticação no Swagger

1. Abra `POST /api/v1/auth/login` e envie:

```json
{
  "username": "admin",
  "password": "SUA_SENHA_CONFIGURADA"
}
```

2. Copie o campo `access_token` da resposta.
3. Clique em **Authorize** e cole o token no campo do esquema Bearer.
4. Execute uma rota administrativa.

Em outros clientes HTTP, envie o cabeçalho:

```text
Authorization: Bearer <access_token>
```

O login retorna `access_token` e `token_type`. A duração é controlada por `JWT_EXPIRE_MINUTES`, sem um campo `expires_in` na resposta atual.

Para consultar o dashboard:

```text
GET /api/v1/dashboard?minimo_avaliacoes=3
```

O parâmetro aceita valores inteiros a partir de 1 e afeta o ranking das avaliações dos usuários.

### Respostas frequentes

| Código | Significado |
| --- | --- |
| 200 | Consulta, login ou edição concluídos |
| 201 | Filme ou avaliação criados |
| 204 | Exclusão concluída, sem corpo na resposta |
| 401 | Credenciais incorretas ou token ausente, inválido ou expirado |
| 404 | Filme não encontrado |
| 422 | Dados enviados não atendem ao esquema de validação |

## Organização do projeto

```text
backend/
├── app/
│   ├── api/v1/       # Registro das rotas
│   ├── auth/         # Login, JWT e proteção administrativa
│   ├── core/         # Configurações e logs
│   ├── dashboard/    # Consultas analíticas e contrato do dashboard
│   ├── db/           # Base ORM e sessões do banco
│   └── movies/       # Catálogo, avaliações e importação de CSVs
├── migrations/      # Evolução do esquema com Alembic
└── tests/           # Testes automatizados existentes

frontend/
├── public/          # Arquivos públicos e imagem substituta de pôster
└── src/
    ├── components/  # Cards, formulários, gerenciamento e dashboard
    ├── data/        # Comunicação com a API
    ├── pages/       # Catálogo, detalhes, login e administração
    ├── types/       # Contratos TypeScript
    ├── App.tsx      # Rotas e estado da sessão administrativa
    └── main.tsx     # Inicialização da aplicação
```

O dashboard consulta as tabelas existentes: não exige novos models nem uma migração própria. A aplicação consulta o banco a cada leitura; não há cache de respostas implementado nesta versão.

## Verificações de desenvolvimento

No backend, com o ambiente virtual ativo e o `.env` configurado:

```bash
cd backend
python -m pytest
python -m ruff check app tests
```

Os testes existentes verificam o endpoint de saúde, o registro das tabelas e a estrutura do model de avaliações. Eles não representam cobertura completa dos fluxos de autenticação, CRUD e dashboard.

Em outro terminal, a partir da raiz do projeto:

```bash
cd frontend
npm run lint
npm run build
```

O build verifica os tipos TypeScript e gera os arquivos em `frontend/dist`. Ele não instala dependências nem testa todos os fluxos no navegador. Não há script `npm test` configurado no frontend atual.

Para conferir localmente o resultado do build:

```bash
npm run preview -- --port 5173 --strictPort
```

Encerre antes o servidor de desenvolvimento que estiver usando essa porta e mantenha a API em execução.

Para revisar a responsividade, use o modo de dispositivos do navegador e confira catálogo, detalhes, formulários e dashboard em diferentes larguras. Verifique textos, seletores e valores financeiros longos, além de possíveis rolagens horizontais.

## Se algo não abrir

| Situação | O que conferir |
| --- | --- |
| Navegador mostra conexão recusada | Os servidores precisam estar em execução nos dois terminais |
| Frontend não carrega os filmes | Confira `/health`, a constante `API_URL` e as mensagens da API |
| Erro de CORS | Abra o frontend em `localhost:5173` ou configure exatamente a origem utilizada |
| API não inicia por falta de configuração | Confira as variáveis administrativas no `.env` e execute dentro de `backend/` |
| Erro de tabela inexistente | Execute `python -m alembic upgrade head` antes de importar ou consultar |
| Importador não encontra os arquivos | Confira o caminho da pasta e os nomes dos dez CSVs |
| Catálogo está vazio | Confirme a importação e se API e importador usam o mesmo `DATABASE_URL` |
| Operação administrativa retorna 401 | Faça login novamente; o token pode estar ausente ou expirado |
| Dashboard ainda mostra valores anteriores | Clique em Atualizar dados ou reabra a aba |
| Ranking vazio | Pode não haver registros que atendam aos critérios; reduza o mínimo de avaliações dos usuários |

O projeto foi organizado para execução local, com configuração explícita do ambiente, importação independente do caminho do computador e separação entre consulta pública e administração do catálogo.
