import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SosButton from '../components/SosButton';

describe('SosButton', () => {
  it('abre a confirmação ao clicar no botão SOS', () => {
    render(<SosButton onSend={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /acionar sos/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Enviar SOS?')).toBeInTheDocument();
  });

  it('executa onSend quando a confirmação é enviada', () => {
    const onSend = vi.fn();
    render(<SosButton onSend={onSend} />);

    fireEvent.click(screen.getByRole('button', { name: /acionar sos/i }));
    fireEvent.click(screen.getByRole('button', { name: /enviar agora/i }));

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
