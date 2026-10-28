import Card from '../components/Card';

export default function Settings({ darkMode, setDarkMode }) {
  return <div className="content">
    <div className="section-heading"><span className="eyebrow">PERSONALIZAÇÃO</span><h1>Configurações</h1><p>Ajuste a aparência da interface.</p></div>
    <Card title="Acessibilidade" icon="⚙">
      <div className="setting-row"><div><strong>Modo escuro</strong><small>Melhora a visualização em ambientes com pouca luz.</small></div><button className={darkMode ? 'switch on' : 'switch'} onClick={() => setDarkMode(v => !v)} aria-label="Alternar modo escuro"><span /></button></div>
      <div className="setting-row"><div><strong>Modo alto contraste</strong><small>Exemplo visual para acessibilidade.</small></div><span className="badge">Disponível</span></div>
      <div className="setting-row"><div><strong>Reconhecimento por voz</strong><small>Simulação de palavra-chave SOS.</small></div><span className="badge">Front-end</span></div>
    </Card>
  </div>;
}
