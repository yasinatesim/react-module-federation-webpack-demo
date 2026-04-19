import React from 'react';

const styles = {
  wrapper: {
    padding: '24px',
    background: 'rgba(255, 80, 80, 0.06)',
    border: '1px solid rgba(255, 80, 80, 0.2)',
    borderRadius: '14px',
    color: '#ff6b6b',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.85rem',
    textAlign: 'center',
  },
  icon: { fontSize: '1.5rem', marginBottom: '8px' },
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Remote module failed to load:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.wrapper}>
          <div style={styles.icon}>⚠</div>
          <div>Remote modül yüklenemedi</div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
