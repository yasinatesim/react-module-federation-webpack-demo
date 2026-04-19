import React, { Suspense, lazy } from 'react';
import ErrorBoundary from './ErrorBoundary';

const ProductList = lazy(() => import('products_app/ProductList'));

const styles = {
  page: {
    minHeight: '100vh',
    background: `
      radial-gradient(ellipse 80% 50% at 20% -10%, rgba(16,140,185,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 110%, rgba(16,140,185,0.08) 0%, transparent 55%),
      linear-gradient(180deg, #0a0a0f 0%, #0d1117 100%)
    `,
    fontFamily: "'Outfit', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 24px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '48px',
    textAlign: 'center',
  },
  topBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 14px',
    borderRadius: '20px',
    background: 'rgba(16, 140, 185, 0.1)',
    border: '1px solid rgba(16, 140, 185, 0.25)',
    color: '#108CB9',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '20px',
    fontFamily: "'JetBrains Mono', monospace",
  },
  title: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: '800',
    color: '#f0f6fc',
    letterSpacing: '-0.03em',
    lineHeight: '1.1',
    margin: '0 0 12px 0',
  },
  titleAccent: {
    background: 'linear-gradient(135deg, #108CB9, #5dc8f0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    color: '#7d8590',
    fontSize: '1rem',
    fontWeight: '400',
    maxWidth: '420px',
    lineHeight: '1.6',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 0 0 1px rgba(16,140,185,0.08), 0 32px 64px rgba(0,0,0,0.4)',
  },
  cardHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(16,140,185,0.04)',
  },
  dot: (color) => ({
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: color,
    opacity: 0.7,
  }),
  cardLabel: {
    marginLeft: 'auto',
    color: '#7d8590',
    fontSize: '11px',
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '0.05em',
  },
  cardBody: {
    padding: 0,
  },
  loadingWrapper: {
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    color: '#7d8590',
    fontSize: '0.875rem',
    fontFamily: "'JetBrains Mono', monospace",
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '2px solid rgba(16,140,185,0.15)',
    borderTopColor: '#108CB9',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  footer: {
    marginTop: '40px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    color: '#3d444d',
    fontSize: '12px',
    fontFamily: "'JetBrains Mono', monospace",
  },
  footerDot: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: '#108CB9',
    opacity: 0.4,
  },
};

function LoadingFallback() {
  return (
    <div style={styles.loadingWrapper}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={styles.spinner} />
      <span>remote yükleniyor...</span>
    </div>
  );
}

export default function App() {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <span style={styles.topBadge}>⬡ Module Federation 2.0</span>
        <h1 style={styles.title}>
          Shell App{' '}
          <span style={styles.titleAccent}>Host</span>
        </h1>
        <p style={styles.subtitle}>
          Runtime'da <code style={{ color: '#108CB9', fontFamily: "'JetBrains Mono', monospace" }}>products-app</code>'ten
          lazy-load edilen bileşen aşağıda görüntüleniyor.
        </p>
      </header>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.dot('#ff5f57')} />
          <div style={styles.dot('#febc2e')} />
          <div style={styles.dot('#28c840')} />
          <span style={styles.cardLabel}>products_app/ProductList</span>
        </div>
        <div style={styles.cardBody}>
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <ProductList />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      <footer style={styles.footer}>
        <span>shell-app</span>
        <div style={styles.footerDot} />
        <span>localhost:3000</span>
        <div style={styles.footerDot} />
        <span>host</span>
      </footer>
    </div>
  );
}
