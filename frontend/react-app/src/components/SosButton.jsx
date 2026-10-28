import { useState } from 'react';

export default function SosButton({ onSend }) {
  const [open, setOpen] = useState(false);

  const confirm = () => {
    onSend();
    setOpen(false);
  };

  return (
    <>
      <button className="sos-floating" onClick={() => setOpen(true)} aria-label="Acionar SOS">
        <span>!</span><strong>SOS</strong>
      </button>
      {open && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="sos-title">
          <div className="modal">
            <div className="warning">!</div>
            <h2 id="sos-title">Enviar SOS?</h2>
            <p>Esta versão acadêmica apenas simula o acionamento de emergência.</p>
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setOpen(false)}>Cancelar</button>
              <button className="btn danger" onClick={confirm}>ENVIAR AGORA</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
