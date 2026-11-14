# Sistema de Atendimento e Matrículas

Aplicação web para gerenciamento de disciplinas, turmas e matrículas, com perfis de Administrador e Aluno.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- npm (incluído com o Node.js)

## Passo a passo para rodar o projeto

### 1. Instalar as dependências

No diretório do projeto, execute:

```bash
npm install
```

### 2. Iniciar o servidor (backend)

Em um terminal, suba o JSON Server para a API e persistência dos dados:

```bash
npm run server
```

O servidor ficará disponível em **http://localhost:3001**. Mantenha este terminal aberto.

### 3. Iniciar a aplicação (frontend)

Em **outro terminal**, inicie o frontend com Vite:

```bash
npm run dev
```

A aplicação abrirá em **http://localhost:5173** (ou outra porta indicada no terminal).

### 4. Acessar o sistema

Abra o navegador em **http://localhost:5173** e use o sistema. Para testar:

- **Administrador**: gerencia disciplinas e turmas.
- **Aluno**: visualiza turmas disponíveis e realiza/cancela matrículas.

