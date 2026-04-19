import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductList from '../ProductList';

describe('ProductList', () => {
  it('renders the heading', () => {
    render(<ProductList />);
    expect(screen.getByRole('heading', { name: /ürünler/i })).toBeInTheDocument();
  });

  it('renders Mekanik Klavye with price', () => {
    render(<ProductList />);
    expect(screen.getByText(/mekanik klavye/i)).toBeInTheDocument();
    expect(screen.getByText(/1200/)).toBeInTheDocument();
  });

  it('renders Ergonomik Mouse with price', () => {
    render(<ProductList />);
    expect(screen.getByText(/ergonomik mouse/i)).toBeInTheDocument();
    expect(screen.getByText(/450/)).toBeInTheDocument();
  });

  it('renders exactly 2 products', () => {
    render(<ProductList />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
