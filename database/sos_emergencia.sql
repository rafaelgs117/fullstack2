DROP TABLE IF EXISTS notificacoes_sos CASCADE; -- cascade serve para apagar as notificações relacionadas a uma solicitação SOS
DROP TABLE IF EXISTS solicitacoes_sos CASCADE;
DROP TABLE IF EXISTS contatos_emergencia CASCADE;
DROP TABLE IF EXISTS perfis_usuario CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- entidade principal: usuários do aplicativo
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nome_completo VARCHAR(120) NOT NULL,
    telefone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(150) UNIQUE,
    data_nascimento DATE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Perfil complementar: no máximo um perfil para cada usuário (1:1)
CREATE TABLE perfis_usuario (
    id_perfil SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    endereco TEXT,
    observacoes_acessibilidade TEXT,
    tipo_sangue VARCHAR(3),
    contato_preferencial VARCHAR(120)
);

-- Cada usuário pode cadastrar vários contatos de emergência (1:N)
CREATE TABLE contatos_emergencia (
    id_contato SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    nome VARCHAR(120) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    parentesco VARCHAR(60) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Cada usuário pode gerar várias solicitações SOS (1:N)
CREATE TABLE solicitacoes_sos (
    id_sos SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
    mensagem TEXT NOT NULL,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    status VARCHAR(20) NOT NULL DEFAULT 'criada'
        CHECK (status IN ('criada', 'enviada', 'cancelada')),
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Relação N:N: uma solicitação SOS pode notificar vários contatos
CREATE TABLE notificacoes_sos (
    id_notificacao SERIAL PRIMARY KEY,
    id_sos INTEGER NOT NULL REFERENCES solicitacoes_sos(id_sos) ON DELETE CASCADE,
    id_contato INTEGER NOT NULL REFERENCES contatos_emergencia(id_contato) ON DELETE RESTRICT,
    canal VARCHAR(20) NOT NULL CHECK (canal IN ('SMS', 'WhatsApp')),
    status_envio VARCHAR(20) NOT NULL DEFAULT 'pendente'
        CHECK (status_envio IN ('pendente', 'enviada', 'falhou')),
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_sos, id_contato, canal)
);

-- DML: pelo menos 3 registros cada tabela
INSERT INTO usuarios (nome_completo, telefone, email, data_nascimento, ativo) VALUES
('Alice Animusphare', '(48) 99111-1111', 'alice@email.com', '1998-04-12', TRUE),
('Skady Alter', '(48) 99222-2222', 'skady@email.com', '2001-09-25', TRUE),
('Teresa Babel', '(48) 99333-3333', 'teresa@email.com', '1995-01-30', TRUE),
('Spectre Alter', '(48) 99444-4444', 'spectre@email.com', '2000-05-15', TRUE);

INSERT INTO perfis_usuario (id_usuario, endereco, observacoes_acessibilidade, tipo_sangue, contato_preferencial) VALUES
(1, 'Palhoça - SC', 'Prefere mensagens curtas', 'O+', 'Luna Pendragon'),
(2, 'São José - SC', 'Sem observações', 'A+', 'Alpha Pendragon'),
(3, 'Florianópolis - SC', 'Necessita de fonte ampliada', 'B+', 'Priestess Endfield');

INSERT INTO contatos_emergencia (id_usuario, nome, telefone, parentesco, ativo) VALUES
(1, 'Luna Pendragon', '(48) 99444-4444', 'Irmã', TRUE),
(4, 'Alpha Pendragon', '(48) 99555-5555', 'Mãe', TRUE),
(2, 'Silver Ash', '(48) 99666-6666', 'Pai', TRUE),
(3, 'Priestess Endfield', '(48) 99777-7777', 'Irmã', TRUE);

INSERT INTO solicitacoes_sos (id_usuario, mensagem, latitude, longitude, status, data_hora) VALUES
(1, 'Preciso de ajuda. Esta é minha localização.', -27.645000, -48.669000, 'enviada', '2026-10-01 09:15:00'),
(1, 'Estou em uma situação de emergência.', -27.600000, -48.650000, 'criada', '2026-10-02 18:30:00'),
(2, 'Preciso de apoio urgente.', -27.595400, -48.548000, 'enviada', '2026-10-03 21:10:00');

INSERT INTO notificacoes_sos (id_sos, id_contato, canal, status_envio, data_hora) VALUES
(1, 1, 'SMS', 'enviada', '2026-10-01 09:15:05'),
(1, 2, 'WhatsApp', 'pendente', '2026-10-01 09:15:10'),
(2, 1, 'SMS', 'pendente', '2026-10-02 18:30:05');

---USUARIOS
SELECT *
FROM usuarios;

-- LISTA USUARIOS ATIVOS
SELECT nome_completo, telefone, email
FROM usuarios
WHERE ativo = TRUE;

--MOSTRA CONTATOS DE MERGENCIA 
SELECT nome, telefone, parentesco
FROM contatos_emergencia;

---mostra os pedidos de DOS
SELECT id_sos, id_usuario, mensagem, status, data_hora
FROM solicitacoes_sos
ORDER BY data_hora DESC;

--mostra apenas pedidos enviados
SELECT id_sos, mensagem, status, data_hora
FROM solicitacoes_sos
WHERE status = 'enviada';

---mostra cada usuarios e seus contatos de emergencia
SELECT
    u.nome_completo AS usuario,
    c.nome AS contato,
    c.telefone,
    c.parentesco
FROM usuarios u
JOIN contatos_emergencia c
    ON u.id_usuario = c.id_usuario;

--contagem de usuarios cadastrados
SELECT COUNT(*) AS total_usuarios
FROM usuarios;

-- COMANDOS listar os contatos de emergência e seus usuários
SELECT u.nome_completo AS usuario, c.nome AS contato, c.telefone, c.parentesco
FROM usuarios u
JOIN contatos_emergencia c ON c.id_usuario = u.id_usuario
ORDER BY u.id_usuario, c.id_contato;

-- COMANDO COM JOIN entre solicitação SOS, usuário, notificações e contatos
SELECT s.id_sos, u.nome_completo AS solicitante, s.mensagem,
       s.latitude, s.longitude, c.nome AS contato_notificado,
       n.canal, n.status_envio, n.data_hora AS data_notificacao
FROM solicitacoes_sos s
JOIN usuarios u ON u.id_usuario = s.id_usuario
JOIN notificacoes_sos n ON n.id_sos = s.id_sos
JOIN contatos_emergencia c ON c.id_contato = n.id_contato
ORDER BY s.id_sos, n.id_notificacao;

