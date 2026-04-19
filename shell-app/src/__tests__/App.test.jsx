import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

describe('App', () => {
  it('renders Shell App heading', () => {
    render(<App />);
    expect(screen.getByText(/shell app/i)).toBeInTheDocument();
  });

  it('renders the module federation badge', () => {
    render(<App />);
    expect(screen.getByText(/module federation/i)).toBeInTheDocument();
  });

  it('renders the subtitle description', () => {
    render(<App />);
    expect(screen.getByText(/lazy-load/i)).toBeInTheDocument();
  });

  it('renders the card label showing remote module path', () => {
    render(<App />);
    expect(screen.getByText('products_app/ProductList')).toBeInTheDocument();
  });

  it('renders the federated ProductList mock', () => {
    render(<App />);
    expect(screen.getByTestId('product-list-mock')).toBeInTheDocument();
  });
});
