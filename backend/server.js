require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const pool = require('./db');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((value) => value.trim())
    : true,
}));
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

const parseId = (raw) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const contatoSchema = Joi.object({
  id_usuario: Joi.number().integer().positive().optional(),
  nome: Joi.string().trim().min(2).max(120).required(),
  telefone: Joi.string().trim().min(8).max(20).required(),
  parentesco: Joi.string().trim().min(2).max(60).required(),
}).required();

const registroSchema = Joi.object({
  nome: Joi.string().trim().min(2).max(120).required(),
  telefone: Joi.string().trim().min(8).max(20).required(),
  email: Joi.string().trim().email().max(150).required(),
  senha: Joi.string().min(4).max(72).required(),
}).required();

const loginSchema = Joi.object({
  login: Joi.string().trim().min(1).max(150).optional(),
  email: Joi.string().trim().email().max(150).optional(),
  senha: Joi.string().min(1).max(72).required(),
}).or('login', 'email').required();

function validar(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({
        mensagem: 'Dados inválidos.',
        detalhes: error.details.map((item) => item.message),
      });
    }
    req.body = value;
    next();
  };
}

function autenticarToken(req, res, next) {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ mensagem: 'Token Bearer ausente.' });
  }
  if (!JWT_SECRET) {
    return res.status(500).json({ mensagem: 'JWT_SECRET não configurado no .env.' });
  }
  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
  }
}

app.get('/', (req, res) => res.status(200).json({
  projeto: 'SOS Emergência',
  mensagem: 'API com PostgreSQL, Joi, bcrypt e JWT.',
  versao: '4.0.0',
  banco: 'PostgreSQL',
}));

app.get('/api/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ api: 'ok', banco: 'conectado' });
  } catch (error) { next(error); }
});

// Aula 12: registro seguro. A senha nunca é gravada em texto puro.
app.post('/api/registro', validar(registroSchema), async (req, res, next) => {
  const { nome, telefone, email, senha } = req.body;
  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const result = await pool.query(`
      INSERT INTO usuarios (nome_completo, telefone, email, senha_hash, ativo)
      VALUES ($1, $2, $3, $4, TRUE)
      RETURNING id_usuario, nome_completo, telefone, email, ativo, criado_em
    `, [nome, telefone, email.toLowerCase(), senhaHash]);
    res.status(201).json({ mensagem: 'Usuário registrado com segurança.', usuario: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ mensagem: 'Telefone ou e-mail já cadastrado.' });
    next(error);
  }
});

// Aula 12: login com bcrypt.compare e emissão de JWT.
app.post('/login', validar(loginSchema), async (req, res, next) => {
  const { senha } = req.body;
  let login = (req.body.email || req.body.login || '').trim().toLowerCase();
  // Para a conta didática, "luna" é o atalho para luna@sos.local.
  if (!login.includes('@')) login = `${login}@sos.local`;
  try {
    const result = await pool.query(`
      SELECT id_usuario, nome_completo, email, senha_hash, ativo
      FROM usuarios
      WHERE lower(email) = $1
      LIMIT 1
    `, [login]);
    if (!result.rowCount || !result.rows[0].ativo || !result.rows[0].senha_hash) {
      return res.status(401).json({ mensagem: 'Login ou senha inválidos.' });
    }
    const usuario = result.rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) return res.status(401).json({ mensagem: 'Login ou senha inválidos.' });
    if (!JWT_SECRET) return res.status(500).json({ mensagem: 'Configure JWT_SECRET no arquivo .env.' });

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, email: usuario.email, nome: usuario.nome_completo },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
    res.status(200).json({
      mensagem: 'Login realizado com sucesso.',
      token,
      tipo: 'Bearer',
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      usuario: { id_usuario: usuario.id_usuario, nome_completo: usuario.nome_completo, email: usuario.email },
    });
  } catch (error) { next(error); }
});

// Rota protegida obrigatória para demonstrar 401 sem token e 200 com token.
app.get('/api/privado', autenticarToken, (req, res) => {
  res.status(200).json({
    mensagem: 'Acesso autorizado: token JWT válido.',
    usuario: { id_usuario: req.auth.id_usuario, nome: req.auth.nome, email: req.auth.email },
  });
});

app.get('/api/me', autenticarToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id_usuario, nome_completo, email, telefone FROM usuarios WHERE id_usuario = $1',
      [req.auth.id_usuario]
    );
    if (!result.rowCount) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    res.status(200).json(result.rows[0]);
  } catch (error) { next(error); }
});

// CRUD de contatos: Joi aplicado no POST/PUT e JWT obrigatório em todas as rotas.
app.get('/api/contatos', autenticarToken, async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT id_contato, id_usuario, nome, telefone, parentesco, ativo, criado_em
      FROM contatos_emergencia
      WHERE id_usuario = $1
      ORDER BY id_contato
    `, [req.auth.id_usuario]);
    res.status(200).json(result.rows);
  } catch (error) { next(error); }
});

app.get('/api/contatos/:id', autenticarToken, async (req, res, next) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ mensagem: 'ID inválido.' });
  try {
    const result = await pool.query(`
      SELECT id_contato, id_usuario, nome, telefone, parentesco, ativo, criado_em
      FROM contatos_emergencia WHERE id_contato = $1 AND id_usuario = $2
    `, [id, req.auth.id_usuario]);
    if (!result.rowCount) return res.status(404).json({ mensagem: 'Contato não encontrado.' });
    res.status(200).json(result.rows[0]);
  } catch (error) { next(error); }
});

app.post('/api/contatos', autenticarToken, validar(contatoSchema), async (req, res, next) => {
  const { nome, telefone, parentesco } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO contatos_emergencia (id_usuario, nome, telefone, parentesco)
      VALUES ($1, $2, $3, $4)
      RETURNING id_contato, id_usuario, nome, telefone, parentesco, ativo, criado_em
    `, [req.auth.id_usuario, nome, telefone, parentesco]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23503') return res.status(400).json({ mensagem: 'Usuário autenticado não existe.' });
    next(error);
  }
});

app.put('/api/contatos/:id', autenticarToken, validar(contatoSchema), async (req, res, next) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ mensagem: 'ID inválido.' });
  const { nome, telefone, parentesco } = req.body;
  try {
    const result = await pool.query(`
      UPDATE contatos_emergencia
      SET nome = $1, telefone = $2, parentesco = $3
      WHERE id_contato = $4 AND id_usuario = $5
      RETURNING id_contato, id_usuario, nome, telefone, parentesco, ativo, criado_em
    `, [nome, telefone, parentesco, id, req.auth.id_usuario]);
    if (!result.rowCount) return res.status(404).json({ mensagem: 'Contato não encontrado.' });
    res.status(200).json(result.rows[0]);
  } catch (error) { next(error); }
});

app.delete('/api/contatos/:id', autenticarToken, async (req, res, next) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ mensagem: 'ID inválido.' });
  try {
    const result = await pool.query(
      'DELETE FROM contatos_emergencia WHERE id_contato = $1 AND id_usuario = $2 RETURNING id_contato',
      [id, req.auth.id_usuario]
    );
    if (!result.rowCount) return res.status(404).json({ mensagem: 'Contato não encontrado.' });
    res.status(200).json({ mensagem: 'Contato removido do PostgreSQL.', id_contato: id });
  } catch (error) {
    if (error.code === '23503') return res.status(400).json({ mensagem: 'Contato vinculado a notificações SOS; não pode ser removido.' });
    next(error);
  }
});

// Consultas de usuários e SOS; exigem token para dados privados.
app.get('/api/usuarios', autenticarToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id_usuario, nome_completo, email, telefone, ativo FROM usuarios WHERE id_usuario = $1',
      [req.auth.id_usuario]
    );
    res.status(200).json(result.rows);
  } catch (error) { next(error); }
});

app.get('/api/sos', autenticarToken, async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT s.id_sos, s.id_usuario, u.nome_completo AS solicitante, s.mensagem,
             s.latitude, s.longitude, s.status, s.data_hora
      FROM solicitacoes_sos s JOIN usuarios u ON u.id_usuario = s.id_usuario
      WHERE s.id_usuario = $1 ORDER BY s.id_sos
    `, [req.auth.id_usuario]);
    res.status(200).json(result.rows);
  } catch (error) { next(error); }
});

app.post('/api/sos', autenticarToken, validar(Joi.object({
  mensagem: Joi.string().trim().min(3).max(1000).required(),
  latitude: Joi.number().min(-90).max(90).allow(null).optional(),
  longitude: Joi.number().min(-180).max(180).allow(null).optional(),
}).required()), async (req, res, next) => {
  try {
    const result = await pool.query(`
      INSERT INTO solicitacoes_sos (id_usuario, mensagem, latitude, longitude)
      VALUES ($1, $2, $3, $4)
      RETURNING id_sos, id_usuario, mensagem, latitude, longitude, status, data_hora
    `, [req.auth.id_usuario, req.body.mensagem, req.body.latitude ?? null, req.body.longitude ?? null]);
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
});

app.use((req, res) => res.status(404).json({ mensagem: 'Rota não encontrada.' }));
app.use((error, req, res, next) => {
  console.error('Erro na API:', error.message);
  if (res.headersSent) return next(error);
  res.status(500).json({ mensagem: 'Erro interno da API ou do banco de dados.' });
});

async function iniciarServidor() {
  try {
    await pool.query('SELECT 1');
    console.log(`Conexão com PostgreSQL estabelecida: ${process.env.DB_NAME || 'sos_emergencia'}`);
    app.listen(PORT, () => console.log(`Servidor SOS Emergência rodando em http://localhost:${PORT}`));
  } catch (error) {
    console.error('Não foi possível conectar ao PostgreSQL. Confira o serviço, o banco e o arquivo .env.');
    console.error(`Detalhe técnico: ${error.message}`);
    process.exitCode = 1;
    await pool.end();
  }
}
if (require.main === module) iniciarServidor();
module.exports = { app, iniciarServidor };
