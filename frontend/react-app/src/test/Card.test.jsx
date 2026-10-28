import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Card from '../components/Card';

describe('Card', () => {
  it('renderiza título e conteúdo', () => {
    render(<Card title="Teste" icon="✓">Conteúdo</Card>);
    expect(screen.getByText('Teste')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
  });
});
