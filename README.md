# Sistema de Matrículas

Aplicação de disciplinas, turmas e matrículas, com perfis de administrador e aluno.

O frontend (React + Vite) consome a API NestJS. Os dois processos precisam estar no ar ao mesmo tempo. A API usa MySQL.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20 ou superior (versão LTS)
- npm (vem com o Node.js)
- MySQL 8 em execução na máquina local (porta padrão `3306`)

## Visão geral

| Parte | Pasta | Endereço |
| --- | --- | --- |
| API | `backend/sistema_matriculas` | http://localhost:3001 |
| Interface | `frontend` | http://localhost:5173 |

A interface chama a API em `http://localhost:3001` (`frontend/src/services/api.js`). A porta da API precisa permanecer `3001`.

## 1. Banco de dados

O repositório inclui o dump `desafio_backend.sql`, na raiz, para inicializar o MySQL sem montar o esquema à mão. Ele cria as tabelas e já traz dados de exemplo: disciplinas, professores, turmas, uma matrícula e os usuários abaixo.

| Usuário | Senha | Perfil |
| --- | --- | --- |
| `admin` | `admin` | administrador |
| `aluno` | `aluno` | aluno |

Crie o banco e importe o arquivo a partir da raiz do repositório:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS desafio_backend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p desafio_backend < desafio_backend.sql
```

No PowerShell, a segunda linha pode ser:

```powershell
Get-Content .\desafio_backend.sql -Raw | mysql -u root -p desafio_backend
```

Importar de novo apaga e recria as tabelas desse banco, voltando aos dados do arquivo.

Crie um usuário do MySQL com permissão nesse banco, ou use um usuário que você já tenha. Anote host, porta, usuário, senha e nome do banco para o passo seguinte.

## 2. Configuração da API

Na pasta `backend/sistema_matriculas`, copie o exemplo de ambiente:

```bash
cd backend/sistema_matriculas
copy .env.example .env
```

No Linux ou no macOS, use `cp .env.example .env`.

Preencha `backend/sistema_matriculas/.env`:

```env
PORT=3001

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=desafio_backend_app
DB_PASSWORD=senha_do_mysql
DB_NAME=desafio_backend

JWT_SECRET=um_segredo_longo_e_aleatorio
```

| Variável | Função |
| --- | --- |
| `PORT` | Porta HTTP da API. Mantenha `3001`, que é o endereço usado pelo frontend. |
| `DB_HOST` | Host do MySQL. Em máquina local, `127.0.0.1`. |
| `DB_PORT` | Porta do MySQL. O padrão é `3306`. |
| `DB_USER` | Usuário do MySQL com acesso ao banco. |
| `DB_PASSWORD` | Senha desse usuário. Pode ficar vazia somente se o MySQL local aceitar senha vazia. |
| `DB_NAME` | Nome do banco. O dump usa `desafio_backend`. |
| `JWT_SECRET` | Segredo usado para assinar o token de login. Qualquer string longa serve neste ambiente. |

O arquivo `.env` não vai para o repositório. Sem ele, a API não sobe: host, porta, usuário, senha, banco e `JWT_SECRET` são obrigatórios.

O token de login expira em 1 hora. Depois disso, a interface pede um novo login.

O cadastro público sempre cria usuário com perfil `aluno`. A senha precisa ter de 8 a 128 caracteres, com letra maiúscula, letra minúscula, número e um destes símbolos: `@ $ ! % * ? & #`.

## 3. Subir a API

Ainda em `backend/sistema_matriculas`:

```bash
npm install
npm run start:dev
```

A API fica em **http://localhost:3001**. Deixe esse terminal aberto. Se a conexão com o MySQL falhar, confira se o serviço está rodando e se os valores do `.env` batem com o usuário e o banco criados.

## 4. Usuários iniciais

Com o dump importado, entre na interface com `admin` / `admin` ou `aluno` / `aluno`. Novas contas criadas pela tela **Criar conta de aluno** continuam exigindo senha forte e nascem com perfil de aluno.

## 5. Subir o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra **http://localhost:5173**.

Para avaliar:

1. Entre com o administrador (`admin` / `admin`).
2. Consulte ou altere disciplinas e turmas já carregadas pelo dump.
3. Entre com o aluno (`aluno` / `aluno`) e faça ou cancele matrículas.

## Endpoints da API

Rotas públicas:

| Método | Rota | Uso |
| --- | --- | --- |
| `POST` | `/auth/registrar` | Cria um aluno. Corpo: `username`, `senha`. |
| `POST` | `/auth/login` | Devolve `accessToken` e os dados do usuário. |

As demais rotas de escrita de disciplinas e turmas exigem o cabeçalho `Authorization: Bearer <token>` de um usuário `admin`.

| Método | Rota | Acesso |
| --- | --- | --- |
| `GET` | `/disciplinas` | Leitura |
| `POST` | `/disciplinas` | Admin |
| `PUT` | `/disciplinas/:id` | Admin |
| `DELETE` | `/disciplinas/:id` | Admin |
| `GET` | `/turmas` | Leitura. Cada turma traz `disciplinaId`, `professorId`, `disciplinaNome`, `disciplinaCodigo`, `professorNome` e `vagasOcupadas`, além de dia, turno e limite. |
| `POST` | `/turmas` | Admin. A resposta usa o mesmo formato do GET. |
| `PUT` | `/turmas/:id` | Admin. A resposta usa o mesmo formato do GET. |
| `DELETE` | `/turmas/:id` | Admin |
| `GET` | `/professors` | Leitura. Catálogo para o formulário de turma. |
| `GET` | `/matriculas` | Leitura. Cada matrícula traz `alunoId`, `turmaId`, `disciplinaNome`, `professorNome`, `diaSemana` e `turno`. |
| `POST` | `/matriculas` | Corpo: `alunoId` (UUID do usuário) e `turmaId`. A resposta usa o mesmo formato do GET. |
| `DELETE` | `/matriculas/:id` | Remove a matrícula |

Dias aceitos em turma: `Segunda-feira`, `Terça-feira`, `Quarta-feira`, `Quinta-feira`, `Sexta-feira`. Turnos: `Manhã`, `Tarde`, `Noite`.
