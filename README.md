# Projeto Integrador — SOS Emergência (Aula 12)

Projeto acadêmico com front-end React, página institucional Next.js e API Node.js/Express ligada ao PostgreSQL. Esta versão acrescenta autenticação segura para cumprir a Aula 12: Joi, bcrypt e JWT.

## Login para demonstração local

**Login:** `luna`  
**Senha:** `1234`

A senha é apenas uma credencial de demonstração. Ela não fica armazenada em texto puro: `backend/seed-luna.js` gera um hash bcrypt e o grava na coluna `usuarios.senha_hash`.

## Preparar o PostgreSQL

1. Crie o banco `sos_emergencia` no pgAdmin.
2. Se for um banco novo, execute `database/sos_emergencia.sql` no Query Tool.
3. Se já tem o banco da Aula 10/11 com dados que deseja manter, NÃO execute o script completo novamente: execute somente `database/aula12_migracao.sql`, que adiciona a coluna `senha_hash` sem apagar os registros.
4. Configure `backend/.env`: senha local do PostgreSQL e `JWT_SECRET`.
5. Atenção: o script completo `sos_emergencia.sql` recria as tabelas de exemplo; use-o apenas em banco de desenvolvimento sem dados importantes.

## Executar a API

```bash
cd backend
npm install
npm run seed:luna
npm run dev
```

API: `http://localhost:3000`.

## Executar o front-end

Em outro terminal:

```bash
cd frontend/react-app
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite (normalmente `http://localhost:5173`) e entre com `luna` / `1234`. A tela chama `/login`; o token JWT é anexado automaticamente às chamadas protegidas.

## Rotas importantes

- `POST /registro` — cadastro com validação Joi e hash bcrypt.
- `POST /login` — compara senha via `bcrypt.compare` e devolve JWT.
- `GET /api/privado` — demonstra rota protegida (401 sem token, 200 com token válido).
- `GET /api/me` — dados do usuário autenticado.
- `GET/POST/PUT/DELETE /api/contatos` — CRUD protegido por JWT; Joi nas rotas POST/PUT.
- `GET /api/health` — verifica conexão PostgreSQL.


