import { useState } from 'react';
import { api } from '../api';

export default function Login({ onLogin }) {
  const [login, setLogin] = useState('luna');
  const [senha, setSenha] = useState('1234');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const { data } = await api.post('/login', { login, senha });
      localStorage.setItem('sos_token', data.token);
      onLogin(data.usuario);
    } catch (error) {
      setErro(error.response?.data?.mensagem || 'Não foi possível entrar. Confira se a API e o PostgreSQL estão ativos.');
    } finally {
      setCarregando(false);
    }
  }

  return <main className="login-screen">
    <section className="login-card">
      <div className="login-mark" aria-hidden="true">SOS</div>
      <p className="eyebrow">SOS EMERGÊNCIA</p>
      <h1>Bem-vinda de volta</h1>
      <p className="login-description">Entre para acessar seus contatos de emergência.</p>
      <form className="form login-form" onSubmit={enviar}>
        <label>Login
          <input autoComplete="username" value={login} onChange={e => setLogin(e.target.value)} required placeholder="Digite seu login" />
        </label>
        <label>Senha
          <input type="password" autoComplete="current-password" value={senha} onChange={e => setSenha(e.target.value)} required placeholder="Digite sua senha" />
        </label>
        {erro && <p className="form-message" role="alert">{erro}</p>}
        <button className="btn primary" type="submit" disabled={carregando}>{carregando ? 'Entrando...' : 'Entrar'}</button>
      </form>
      <p className="login-hint">Acesso de demonstração: <strong>luna</strong> / <strong>1234</strong></p>
    </section>
  </main>;
}
