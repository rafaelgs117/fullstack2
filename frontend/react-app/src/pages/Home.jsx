import { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../components/Card';

export default function Home({ contacts, onSendSos, sosCount }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voice, setVoice] = useState(false);
  const [location, setLocation] = useState('Não informada');

  useEffect(() => {
    axios.get('https://jsonplaceholder.typicode.com/users?_limit=3')
      .then(({data}) => setList(data))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  const simulateLocation = () => setLocation('Localização simulada: Palhoça - SC');

  return (
    <div>
      <section className="hero">
        <div>
          <span className="eyebrow">CENTRAL DE SEGURANÇA</span>
          <h1>Precisa de ajuda?</h1>
          <p>Acione seu contato de emergência de forma rápida.</p>
        </div>
        <button className="hero-sos" onClick={onSendSos}>SOS</button>
      </section>

      <div className="stats">
        <div><strong>{contacts.length}/5</strong><span>Contatos</span></div>
        <div><strong>{sosCount}</strong><span>SOS simulados</span></div>
        <div><strong>Online</strong><span>Status</span></div>
      </div>

      <div className="grid">
        <Card title="Ações rápidas" icon="⚡">
          <div className="action-grid">
            <button className="action" onClick={simulateLocation}>📍<span>Atualizar localização</span></button>
            <button className={voice ? 'action active-action' : 'action'} onClick={() => setVoice(v => !v)}>🎙️<span>{voice ? 'Ouvindo...' : 'Ativar por voz'}</span></button>
          </div>
          <p className="info">{location}</p>
        </Card>

        <Card title="Contatos cadastrados" icon="☎">
          {contacts.length === 0 ? <p>Nenhum contato cadastrado.</p> :
            contacts.map(c => <div className="contact-row" key={c.id}><span className="avatar">{c.name[0]}</span><div><strong>{c.name}</strong><small>{c.relation} · {c.phone}</small></div></div>)}
        </Card>

        <Card title="API pública" icon="☁">
          {loading ? <p>Carregando dados...</p> :
            <ul className="api-list">{list.map(item => <li key={item.id}>{item.name}<small>{item.email}</small></li>)}</ul>}
        </Card>
      </div>
    </div>
  );
}
