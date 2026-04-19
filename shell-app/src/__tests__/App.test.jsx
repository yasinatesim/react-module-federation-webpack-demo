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

  it('renders Suspense with loading fallback available', () => {
    render(<App />);
    expect(screen.getByTestId('product-list-mock')).toBeInTheDocument();
  });
});
