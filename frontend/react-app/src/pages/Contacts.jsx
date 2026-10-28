import { useState } from 'react';
import Card from '../components/Card';

export default function Contacts({ contacts, onAdd, onRemove }) {
  const [form, setForm] = useState({ name: '', phone: '', relation: '' });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.relation.trim()) {
      setMessage('Preencha todos os campos.'); return;
    }
    if (contacts.length >= 5) { setMessage('Máximo de 5 contatos atingido.'); return; }
    setBusy(true);
    try {
      const saved = await onAdd(form);
      if (!saved) { setMessage('Máximo de 5 contatos atingido.'); return; }
      setForm({ name: '', phone: '', relation: '' });
      setMessage('Contato salvo no PostgreSQL!');
    } catch (error) {
      setMessage(error.message || 'Não foi possível salvar o contato.');
    } finally { setBusy(false); }
  };
  const remove = async (id) => {
    setMessage('');
    try { await onRemove(id); setMessage('Contato removido.'); }
    catch (error) { setMessage(error.message || 'Não foi possível remover o contato.'); }
  };

  return <div className="content">
    <div className="section-heading"><span className="eyebrow">SEGURANÇA</span><h1>Contatos de emergência</h1><p>Cadastre até 5 pessoas para a simulação do SOS.</p></div>
    <Card title={`Contatos (${contacts.length}/5)`} icon="☎">
      {contacts.length === 0 ? <p>Nenhum contato cadastrado no banco.</p> : contacts.map(c => <div className="contact-card" key={c.id}><div className="avatar large">{c.name?.[0] || '?'}</div><div className="contact-main"><strong>{c.name}</strong><span>{c.relation}</span><span>{c.phone}</span></div><button className="icon-btn" onClick={() => remove(c.id)} aria-label={`Excluir ${c.name}`}>×</button></div>)}
    </Card>
    <Card title="Adicionar contato" icon="+">
      <form onSubmit={submit} className="form">
        <label>Nome completo<input value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="Ex.: Ana Silva" /></label>
        <label>Telefone<input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} placeholder="(48) 99999-9999" /></label>
        <label>Parentesco<input value={form.relation} onChange={e => setForm({...form,relation:e.target.value})} placeholder="Ex.: Mãe" /></label>
        <button className="btn primary" type="submit" disabled={busy}>{busy ? 'Salvando...' : 'Salvar contato'}</button>
        {message && <p className="form-message" role="status">{message}</p>}
      </form>
    </Card>
  </div>;
}
