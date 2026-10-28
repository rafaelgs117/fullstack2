# SOS Emergência — Back-end Aula 12

API Node.js + Express + PostgreSQL com validação Joi, hash de senha bcrypt e autenticação JWT.

## Configuração inicial

1. No pgAdmin, selecione o banco `sos_emergencia`.
2. Se for um banco novo, execute `database/sos_emergencia.sql`. Se já tem dados da Aula 10/11 que deseja preservar, execute somente `database/aula12_migracao.sql` para adicionar `senha_hash` sem apagar registros.
3. Em `backend/.env`, configure `DB_PASSWORD` e substitua `JWT_SECRET` por uma chave longa e exclusiva.
4. No terminal, dentro de `backend`, execute `npm install`.
5. Crie/atualize o usuário de demonstração Luna: `npm run seed:luna`.
6. Inicie a API: `npm run dev`.

A senha `1234` é apenas uma credencial fraca para demonstração acadêmica local. Não a use em produção. O script `seed:luna` gera o hash com `bcrypt.hash('1234', 10)` e grava somente o hash na coluna `senha_hash`.

## Login da aplicação

- Login: `luna`
- Senha: `1234`
- Internamente, o login `luna` é associado ao e-mail didático `luna@sos.local`.
- A tela React pede login e senha, chama `POST /login` e usa o JWT nas chamadas protegidas.

## Rotas de autenticação

### Registrar um usuário

`POST http://localhost:3000/registro`

Body → raw → JSON:

```json
{
  "nome": "Luna Exemplo",
  "telefone": "(48) 98888-1234",
  "email": "luna.nova@sos.local",
  "senha": "SenhaDeTeste123"
}
```

A senha é validada pelo Joi, transformada com `bcrypt.hash(senha, 10)` e armazenada como hash em `senha_hash`. O endpoint retorna `201`; campos inválidos retornam `400`; e-mail/telefone duplicado retorna `409`.

### Login

`POST http://localhost:3000/login`

Body → raw → JSON:

```json
{
  "login": "luna",
  "senha": "1234"
}
```

Também é aceito o e-mail `luna@sos.local` no campo `email`. A API busca o usuário no PostgreSQL, usa `bcrypt.compare`, e devolve JWT com validade definida por `JWT_EXPIRES_IN`. Credenciais inválidas retornam `401`.

### Rota protegida

`GET http://localhost:3000/api/privado`

Sem token: esperado `401 Unauthorized`.

Com token: no Postman, selecione **Authorization → Bearer Token** e cole o valor `token` recebido no login. Esperado `200 OK`.

`GET /api/me` também exige token.

## Validação Joi no recurso principal

O schema Joi valida `nome`, `telefone`, `parentesco` e, opcionalmente, `id_usuario`. É aplicado nas rotas `POST /api/contatos` e `PUT /api/contatos/:id`. Para provar a validação, envie um POST com `{}` e confirme `400` com mensagem clara.

## CRUD de contatos (todas as rotas exigem JWT)

| Verbo | Rota | Resultado |
|---|---|---|
| GET | `/api/contatos` | Lista contatos do usuário autenticado |
| GET | `/api/contatos/:id` | Busca contato do usuário |
| POST | `/api/contatos` | Cadastra contato com Joi |
| PUT | `/api/contatos/:id` | Atualiza contato com Joi |
| DELETE | `/api/contatos/:id` | Exclui contato do usuário |

Exemplo de POST com token:

```json
{
  "nome": "Contato de teste",
  "telefone": "(48) 97777-1234",
  "parentesco": "Amigo"
}
```

O usuário é identificado pelo token; não é necessário enviar `id_usuario`.

## Conferir o hash no pgAdmin

```sql
SELECT id_usuario, nome_completo, email, senha_hash
FROM usuarios
WHERE email = 'luna@sos.local';
```

A coluna `senha_hash` deve exibir uma string de hash bcrypt começando normalmente com `$2b$10$...`; não deve exibir `1234`.

## Persistência e segurança

- A API verifica a conexão PostgreSQL ao iniciar.
- `.env` contém senha do banco e segredo JWT e não deve ser enviado ao GitHub.
- `.env.example` é o modelo sem credenciais reais.
- O token expira conforme `JWT_EXPIRES_IN` (padrão `1h`).
- Não use a senha didática `1234` fora deste ambiente acadêmico.
