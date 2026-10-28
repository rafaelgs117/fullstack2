-- Aula 12: migração não destrutiva para bancos já criados na Aula 10/11.
-- Execute no banco sos_emergencia existente, antes de npm run seed:luna.
-- Não apaga tabelas nem dados.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS senha_hash VARCHAR(255);
