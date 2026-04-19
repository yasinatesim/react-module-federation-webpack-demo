import React from 'react';

const products = [
  { id: 1, name: 'Mekanik Klavye', price: 1200 },
  { id: 2, name: 'Ergonomik Mouse', price: 450 },
];

const styles = {
  container: {
    fontFamily: "'Outfit', 'Segoe UI', sans-serif",
    padding: '2rem',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #0a0a0f 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '20px',
    background: 'rgba(16, 140, 185, 0.12)',
    border: '1px solid rgba(16, 140, 185, 0.3)',
    color: '#108CB9',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: '1rem',
  },
  heading: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#f0f6fc',
    margin: '0 0 1.5rem 0',
    letterSpacing: '-0.02em',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    maxWidth: '360px',
  },
  item: {
    background: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'border-color 0.2s, background 0.2s',
  },
  name: {
    color: '#e6edf3',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  price: {
    color: '#108CB9',
    fontSize: '0.95rem',
    fontWeight: '700',
    fontVariantNumeric: 'tabular-nums',
  },
};

export default function ProductList() {
  return (
    <div style={styles.container}>
      <span style={styles.badge}>⬡ products-app · remote</span>
      <h2 style={styles.heading}>Ürünler</h2>
      <ul style={styles.list}>
        {products.map((p) => (
          <li key={p.id} style={styles.item}>
            <span style={styles.name}>{p.name}</span>
            <span style={styles.price}>{p.price}₺</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
