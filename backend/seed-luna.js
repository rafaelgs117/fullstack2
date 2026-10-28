require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./db');

async function seedLuna() {
  const senhaHash = await bcrypt.hash('1234', 10);
  const result = await pool.query(`
    INSERT INTO usuarios (nome_completo, telefone, email, senha_hash, ativo)
    VALUES ('Luna', '(00) 00000-1234', 'luna@sos.local', $1, TRUE)
    ON CONFLICT (email) DO UPDATE
      SET nome_completo = EXCLUDED.nome_completo,
          senha_hash = EXCLUDED.senha_hash,
          ativo = TRUE
    RETURNING id_usuario, nome_completo, email
  `, [senhaHash]);
  console.log('Conta de demonstração criada/atualizada:', result.rows[0]);
  console.log('Login: luna | Senha: 1234');
  console.log('A senha foi armazenada somente como hash bcrypt.');
}

seedLuna()
  .catch((err) => {
    console.error('Não foi possível preparar a conta Luna:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
