import { useState } from 'react';
import Card from '../components/Card';

export default function Profile({ user, onSave }) {
  const [form, setForm] = useState(user);
  const [saved, setSaved] = useState(false);

  const submit = e => {
    e.preventDefault();
    onSave(form);
    setSaved(true);
  };

  return <div className="content">
    <div className="section-heading"><span className="eyebrow">MEU PERFIL</span><h1>Dados do usuário</h1></div>
    <Card title="Perfil" icon="●">
      <form className="form" onSubmit={submit}>
        <label>Nome completo<input value={form.name} onChange={e => setForm({...form,name:e.target.value})} /></label>
        <label>Data de nascimento<input value={form.birth} onChange={e => setForm({...form,birth:e.target.value})} /></label>
        <div className="profile-preview"><strong>{form.name || 'Usuário'}</strong><span>Idade calculada no front-end conforme a data informada.</span></div>
        <button className="btn primary">Salvar perfil</button>
        {saved && <p className="form-message">Perfil salvo!</p>}
      </form>
    </Card>
  </div>;
}
