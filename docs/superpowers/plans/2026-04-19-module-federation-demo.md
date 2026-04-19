# Module Federation Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade Module Federation 2.0 demo with shell-app (host) + products-app (remote), glassmorphism dark UI, unit tests, and Docker support.

**Architecture:** Flat two-app structure. `products-app` exposes `ProductList` via `remoteEntry.js`. `shell-app` lazy-loads it at runtime via Module Federation. Both share React 18 as a singleton. Each app is independently runnable; root orchestrates both via `concurrently`.

**Tech Stack:** React 18, Webpack 5, @module-federation/enhanced ^2.0.0, Jest + React Testing Library, Docker + nginx, concurrently

---

## File Map

```
react-module-federation-demo/
├── package.json                          CREATE — root scripts (install:all, start, start:shell, start:products)
├── README.md                             CREATE — English, logo SVG, language links
├── README.tr.md                          CREATE — Turkish translation
├── logo.svg                              CREATE — Official MF logo from design-resources repo
├── docker-compose.yml                    CREATE — orchestrates both app containers
│
├── shell-app/
│   ├── package.json                      CREATE
│   ├── webpack.config.js                 CREATE
│   ├── .babelrc                          CREATE
│   ├── jest.config.js                    CREATE
│   ├── Dockerfile                        CREATE — multi-stage: build → nginx
│   ├── nginx.conf                        CREATE — serves built assets on port 80
│   ├── public/
│   │   └── index.html                    CREATE
│   ├── src/
│   │   ├── index.js                      CREATE — async boundary
│   │   ├── bootstrap.js                  CREATE — mounts App
│   │   ├── App.jsx                       CREATE — glassmorphism UI, lazy ProductList
│   │   ├── ErrorBoundary.jsx             CREATE — class component error boundary
│   │   └── __mocks__/
│   │       └── ProductList.jsx           CREATE — mock for federated module in tests
│   ├── src/__tests__/
│   │   ├── App.test.jsx                  CREATE — tests Suspense fallback, ErrorBoundary
│   │   └── ErrorBoundary.test.jsx        CREATE — tests error state rendering
│   └── README.md                         CREATE
│
└── products-app/
    ├── package.json                      CREATE
    ├── webpack.config.js                 CREATE
    ├── .babelrc                          CREATE
    ├── jest.config.js                    CREATE
    ├── Dockerfile                        CREATE — multi-stage: build → nginx
    ├── nginx.conf                        CREATE — serves built assets on port 80
    ├── public/
    │   └── index.html                    CREATE
    ├── src/
    │   ├── index.js                      CREATE — async boundary
    │   ├── bootstrap.js                  CREATE — mounts ProductList
    │   └── ProductList.jsx               CREATE — glassmorphism product cards
    ├── src/__tests__/
    │   └── ProductList.test.jsx          CREATE — tests product rendering
    └── README.md                         CREATE
```

---

## Task 1: Root scaffold

**Files:**
- Create: `package.json`
- Create: `logo.svg`

- [ ] **Step 1: Fetch the official Module Federation logo SVG**

  Download from `https://raw.githubusercontent.com/module-federation/module-federation-design-resources/main/logo/module-federation-logo.svg` and save as `logo.svg` at project root.

- [ ] **Step 2: Create root `package.json`**

```json
{
  "name": "react-module-federation-demo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "install:all": "npm install --prefix shell-app && npm install --prefix products-app",
    "start": "concurrently \"npm run start:shell\" \"npm run start:products\"",
    "start:shell": "npm start --prefix shell-app",
    "start:products": "npm start --prefix products-app"
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
```

- [ ] **Step 3: Install root dependencies**

```bash
npm install
```

Expected: `node_modules/` created with `concurrently`.

- [ ] **Step 4: Commit**

```bash
git init
git add package.json package-lock.json logo.svg
git commit -m "feat: root scaffold with concurrently scripts and MF logo"
```

---

## Task 2: products-app scaffold & webpack config

**Files:**
- Create: `products-app/package.json`
- Create: `products-app/webpack.config.js`
- Create: `products-app/.babelrc`
- Create: `products-app/public/index.html`

- [ ] **Step 1: Create `products-app/package.json`**

```json
{
  "name": "products-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "webpack serve --mode development",
    "build": "webpack --mode production",
    "test": "jest"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@module-federation/enhanced": "^2.0.0",
    "webpack": "^5.0.0",
    "webpack-cli": "^5.0.0",
    "webpack-dev-server": "^4.0.0",
    "html-webpack-plugin": "^5.0.0",
    "babel-loader": "^9.0.0",
    "@babel/core": "^7.0.0",
    "@babel/preset-env": "^7.0.0",
    "@babel/preset-react": "^7.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0"
  }
}
```

- [ ] **Step 2: Create `products-app/webpack.config.js`**

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  devServer: {
    port: 3001,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  output: {
    publicPath: 'auto',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  resolve: { extensions: ['.js', '.jsx'] },
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' }),
    new ModuleFederationPlugin({
      name: 'products_app',
      filename: 'remoteEntry.js',
      exposes: {
        './ProductList': './src/ProductList',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
      },
    }),
  ],
};
```

- [ ] **Step 3: Create `products-app/.babelrc`**

```json
{
  "presets": [
    "@babel/preset-env",
    ["@babel/preset-react", { "runtime": "automatic" }]
  ]
}
```

- [ ] **Step 4: Create `products-app/public/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Products App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

- [ ] **Step 5: Install products-app dependencies**

```bash
npm install --prefix products-app
```

Expected: `products-app/node_modules/` created.

- [ ] **Step 6: Commit**

```bash
git add products-app/
git commit -m "feat: products-app webpack + babel scaffold"
```

---

## Task 3: products-app source — async boundary + ProductList

**Files:**
- Create: `products-app/src/index.js`
- Create: `products-app/src/bootstrap.js`
- Create: `products-app/src/ProductList.jsx`

- [ ] **Step 1: Write the failing test first**

Create `products-app/src/__tests__/ProductList.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Create `products-app/jest.config.js`**

```js
module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: ['**/__tests__/**/*.test.(js|jsx)'],
};
```

- [ ] **Step 3: Run test — confirm it fails**

```bash
npm test --prefix products-app
```

Expected: FAIL — `Cannot find module '../ProductList'`

- [ ] **Step 4: Create `products-app/src/ProductList.jsx`**

Glassmorphism dark aesthetic — deep black background, frosted glass cards, gradient borders, subtle backdrop blur:

```jsx
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
```

- [ ] **Step 5: Run test — confirm it passes**

```bash
npm test --prefix products-app
```

Expected: PASS — 4 tests passing

- [ ] **Step 6: Create `products-app/src/index.js`**

```js
import('./bootstrap');
```

- [ ] **Step 7: Create `products-app/src/bootstrap.js`**

```js
import React from 'react';
import { createRoot } from 'react-dom/client';
import ProductList from './ProductList';

const root = createRoot(document.getElementById('root'));
root.render(<ProductList />);
```

- [ ] **Step 8: Commit**

```bash
git add products-app/src/ products-app/jest.config.js
git commit -m "feat: products-app source with ProductList and passing tests"
```

---

## Task 4: shell-app scaffold & webpack config

**Files:**
- Create: `shell-app/package.json`
- Create: `shell-app/webpack.config.js`
- Create: `shell-app/.babelrc`
- Create: `shell-app/public/index.html`

- [ ] **Step 1: Create `shell-app/package.json`**

```json
{
  "name": "shell-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "webpack serve --mode development",
    "build": "webpack --mode production",
    "test": "jest"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@module-federation/enhanced": "^2.0.0",
    "webpack": "^5.0.0",
    "webpack-cli": "^5.0.0",
    "webpack-dev-server": "^4.0.0",
    "html-webpack-plugin": "^5.0.0",
    "babel-loader": "^9.0.0",
    "@babel/core": "^7.0.0",
    "@babel/preset-env": "^7.0.0",
    "@babel/preset-react": "^7.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0"
  }
}
```

- [ ] **Step 2: Create `shell-app/webpack.config.js`**

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  devServer: {
    port: 3000,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  output: {
    publicPath: 'auto',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  resolve: { extensions: ['.js', '.jsx'] },
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' }),
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        products_app: 'products_app@http://localhost:3001/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
      },
    }),
  ],
};
```

- [ ] **Step 3: Create `shell-app/.babelrc`**

```json
{
  "presets": [
    "@babel/preset-env",
    ["@babel/preset-react", { "runtime": "automatic" }]
  ]
}
```

- [ ] **Step 4: Create `shell-app/public/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Shell App — Module Federation Demo</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        background: #0a0a0f;
        color: #e6edf3;
        font-family: 'Outfit', sans-serif;
        -webkit-font-smoothing: antialiased;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

- [ ] **Step 5: Install shell-app dependencies**

```bash
npm install --prefix shell-app
```

- [ ] **Step 6: Commit**

```bash
git add shell-app/package.json shell-app/package-lock.json shell-app/webpack.config.js shell-app/.babelrc shell-app/public/
git commit -m "feat: shell-app webpack + babel scaffold"
```

---

## Task 5: shell-app source — ErrorBoundary + App with glassmorphism UI

**Files:**
- Create: `shell-app/src/ErrorBoundary.jsx`
- Create: `shell-app/src/App.jsx`
- Create: `shell-app/src/index.js`
- Create: `shell-app/src/bootstrap.js`
- Create: `shell-app/src/__tests__/ErrorBoundary.test.jsx`
- Create: `shell-app/src/__tests__/App.test.jsx`
- Create: `shell-app/jest.config.js`

- [ ] **Step 1: Create `shell-app/jest.config.js`**

```js
module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: ['**/__tests__/**/*.test.(js|jsx)'],
  moduleNameMapper: {
    '^products_app/ProductList$': '<rootDir>/src/__mocks__/ProductList.jsx',
  },
};
```

- [ ] **Step 2: Create the mock for the federated module**

Create `shell-app/src/__mocks__/ProductList.jsx`:

```jsx
export default function ProductList() {
  return <div data-testid="product-list-mock">Product List Mock</div>;
}
```

- [ ] **Step 3: Write failing tests for ErrorBoundary**

Create `shell-app/src/__tests__/ErrorBoundary.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from '../ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    console.error.mockRestore();
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>OK</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('renders fallback UI on error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText(/yüklenemedi/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Write failing tests for App**

Create `shell-app/src/__tests__/App.test.jsx`:

```jsx
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
    // Mock resolves immediately, so we see the mock content
    expect(screen.getByTestId('product-list-mock')).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run tests — confirm they fail**

```bash
npm test --prefix shell-app
```

Expected: FAIL — modules not found

- [ ] **Step 6: Create `shell-app/src/ErrorBoundary.jsx`**

```jsx
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
```

- [ ] **Step 7: Create `shell-app/src/App.jsx`**

Glassmorphism dark — deep black bg, frosted glass panels, cyan accent `#108CB9`, Outfit font, gradient mesh background, badge labels showing architecture:

```jsx
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
```

- [ ] **Step 8: Create `shell-app/src/index.js`**

```js
import('./bootstrap');
```

- [ ] **Step 9: Create `shell-app/src/bootstrap.js`**

```js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

- [ ] **Step 10: Run tests — confirm they pass**

```bash
npm test --prefix shell-app
```

Expected: PASS — 5 tests passing

- [ ] **Step 11: Commit**

```bash
git add shell-app/src/ shell-app/jest.config.js
git commit -m "feat: shell-app source with glassmorphism UI and passing tests"
```

---

## Task 6: Smoke test — run both apps together

- [ ] **Step 1: Start both apps**

```bash
npm start
```

Expected: Both webpack-dev-server instances start. Terminal shows:
- `[0] <i> [webpack-dev-server] Project is running at http://localhost:3000`
- `[1] <i> [webpack-dev-server] Project is running at http://localhost:3001`

- [ ] **Step 2: Verify products-app standalone**

Open `http://localhost:3001` in browser. Should show product list with glassmorphism dark cards.

- [ ] **Step 3: Verify shell-app loads remote**

Open `http://localhost:3000` in browser. Should show shell-app header with the ProductList loaded from products-app (verify via Network tab — `remoteEntry.js` fetched from `localhost:3001`).

- [ ] **Step 4: Commit if all good**

```bash
git commit --allow-empty -m "chore: smoke test passed — both apps running"
```

---

## Task 7: Docker — Dockerfiles + nginx + docker-compose

**Files:**
- Create: `products-app/Dockerfile`
- Create: `products-app/nginx.conf`
- Create: `shell-app/Dockerfile`
- Create: `shell-app/nginx.conf`
- Create: `docker-compose.yml`

- [ ] **Step 1: Create `products-app/nginx.conf`**

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, OPTIONS";

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
    }

    location = /remoteEntry.js {
        add_header Cache-Control "no-cache";
        add_header Access-Control-Allow-Origin *;
    }
}
```

- [ ] **Step 2: Create `products-app/Dockerfile`**

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

- [ ] **Step 3: Create `shell-app/nginx.conf`**

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

- [ ] **Step 4: Update `shell-app/webpack.config.js` to read remote URL from env**

Edit `shell-app/webpack.config.js` — replace the hardcoded remote URL with an env-var fallback so Docker builds can override it:

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

const PRODUCTS_APP_URL = process.env.PRODUCTS_APP_URL || 'http://localhost:3001';

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  devServer: {
    port: 3000,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  output: {
    publicPath: 'auto',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  resolve: { extensions: ['.js', '.jsx'] },
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' }),
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        products_app: `products_app@${PRODUCTS_APP_URL}/remoteEntry.js`,
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
      },
    }),
  ],
};
```

- [ ] **Step 5: Create `shell-app/Dockerfile`**

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG PRODUCTS_APP_URL=http://localhost:3001
ENV PRODUCTS_APP_URL=$PRODUCTS_APP_URL
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

- [ ] **Step 6: Commit webpack.config.js update**

```bash
git add shell-app/webpack.config.js
git commit -m "feat: shell-app webpack reads PRODUCTS_APP_URL from env for Docker builds"
```

- [ ] **Step 7: Create root `docker-compose.yml`**

```yaml
version: '3.8'

services:
  products-app:
    build:
      context: ./products-app
    ports:
      - "3001:80"
    networks:
      - mf-network

  shell-app:
    build:
      context: ./shell-app
      args:
        PRODUCTS_APP_URL: http://localhost:3001
    ports:
      - "3000:80"
    depends_on:
      - products-app
    networks:
      - mf-network

networks:
  mf-network:
    driver: bridge
```

- [ ] **Step 8: Add Docker scripts to root `package.json`**

Add these scripts:
```json
"docker:build": "docker-compose build",
"docker:up": "docker-compose up",
"docker:down": "docker-compose down"
```

- [ ] **Step 9: Build and verify Docker**

```bash
npm run docker:build
npm run docker:up
```

Expected: Both containers start. Open `http://localhost:3000` — shell-app loads ProductList from products-app container.

- [ ] **Step 10: Commit**

```bash
git add products-app/Dockerfile products-app/nginx.conf shell-app/Dockerfile shell-app/nginx.conf docker-compose.yml package.json
git commit -m "feat: Docker multi-stage builds with nginx and docker-compose"
```

---

## Task 8: READMEs

**Files:**
- Create: `README.md`
- Create: `README.tr.md`
- Create: `shell-app/README.md`
- Create: `products-app/README.md`

- [ ] **Step 1: Fetch full official SVG content for README embedding**

The logo SVG is already at `logo.svg`. For READMEs, reference it as `<img src="logo.svg" ...>`.

- [ ] **Step 2: Create root `README.md`**

```markdown
<div align="center">
  <img src="logo.svg" width="120" alt="Module Federation Logo" />

  <h1>React Module Federation Demo</h1>
  <p>A minimal demo of Module Federation 2.0 with React 18 — host + remote pattern.</p>

  🇬🇧 English · [🇹🇷 Türkçe](./README.tr.md)
</div>

---

## Overview

This project demonstrates Module Federation 2.0 with two independent React applications:

| App | Role | Port |
|---|---|---|
| `shell-app` | Host — consumes remote modules | 3000 |
| `products-app` | Remote — exposes `ProductList` | 3001 |

## Project Structure

```
react-module-federation-demo/
├── shell-app/        # Host application (port 3000)
├── products-app/     # Remote application (port 3001)
├── docker-compose.yml
└── package.json
```

## Prerequisites

- Node.js 18+
- npm 9+
- Docker & Docker Compose (optional, for containerized run)

## Installation

```bash
npm run install:all
```

## Development

**Run both apps together:**
```bash
npm start
```

**Run individually:**
```bash
npm run start:shell      # http://localhost:3000
npm run start:products   # http://localhost:3001
```

## Production (Docker)

```bash
npm run docker:build
npm run docker:up
```

Open `http://localhost:3000`

**Stop:**
```bash
npm run docker:down
```

## Tests

```bash
npm test --prefix shell-app
npm test --prefix products-app
```

## Article

📖 [Read the article](ARTICLE_URL)

---

This README was generated by [markdown-manager](https://github.com/yasinatesim/markdown-manager) 🥲
```

- [ ] **Step 3: Create `README.tr.md`**

Exact Turkish translation of `README.md` — same structure, same sections.

```markdown
<div align="center">
  <img src="logo.svg" width="120" alt="Module Federation Logo" />

  <h1>React Module Federation Demo</h1>
  <p>React 18 ile Module Federation 2.0'ın minimal demosu — host + remote pattern.</p>

  [🇬🇧 English](./README.md) · 🇹🇷 Türkçe
</div>

---

## Genel Bakış

Bu proje, iki bağımsız React uygulamasıyla Module Federation 2.0'ı göstermektedir:

| Uygulama | Rol | Port |
|---|---|---|
| `shell-app` | Host — remote modülleri tüketir | 3000 |
| `products-app` | Remote — `ProductList` bileşenini açar | 3001 |

## Proje Yapısı

```
react-module-federation-demo/
├── shell-app/        # Host uygulama (port 3000)
├── products-app/     # Remote uygulama (port 3001)
├── docker-compose.yml
└── package.json
```

## Ön Koşullar

- Node.js 18+
- npm 9+
- Docker & Docker Compose (opsiyonel, container ile çalıştırmak için)

## Kurulum

```bash
npm run install:all
```

## Geliştirme

**Her iki uygulamayı birlikte başlat:**
```bash
npm start
```

**Ayrı ayrı çalıştır:**
```bash
npm run start:shell      # http://localhost:3000
npm run start:products   # http://localhost:3001
```

## Production (Docker)

```bash
npm run docker:build
npm run docker:up
```

Tarayıcıda `http://localhost:3000` adresini aç.

**Durdur:**
```bash
npm run docker:down
```

## Testler

```bash
npm test --prefix shell-app
npm test --prefix products-app
```

## Makale

📖 [Makaleyi oku](ARTICLE_URL)

---

Bu README [markdown-manager](https://github.com/yasinatesim/markdown-manager) tarafından oluşturulmuştur 🥲
```

- [ ] **Step 4: Create `shell-app/README.md`**

```markdown
# shell-app

Host application in the Module Federation demo. Consumes `ProductList` from `products-app` at runtime.

## Role

`shell-app` is the **host**. It uses `React.lazy` + `Suspense` to load `products_app/ProductList` dynamically via Module Federation. An `ErrorBoundary` prevents full app crashes if the remote is unavailable.

## Run standalone

```bash
npm install
npm start
```

Runs at `http://localhost:3000`. Requires `products-app` to be running at `http://localhost:3001` for the remote component to load.

## Key files

| File | Purpose |
|---|---|
| `webpack.config.js` | Module Federation config — declares `products_app` remote |
| `src/index.js` | Async boundary entry point |
| `src/App.jsx` | Main UI — lazy-loads remote `ProductList` |
| `src/ErrorBoundary.jsx` | Catches remote load failures gracefully |

## Tests

```bash
npm test
```

---

This README was generated by [markdown-manager](https://github.com/yasinatesim/markdown-manager) 🥲
```

- [ ] **Step 5: Create `products-app/README.md`**

```markdown
# products-app

Remote application in the Module Federation demo. Exposes `ProductList` to be consumed by `shell-app`.

## Role

`products-app` is the **remote**. It exposes `./ProductList` via `remoteEntry.js`. Any Module Federation host can consume it at runtime without a rebuild.

## Run standalone

```bash
npm install
npm start
```

Runs at `http://localhost:3001`. Can be opened directly — shows the product list in isolation.

## Key files

| File | Purpose |
|---|---|
| `webpack.config.js` | Module Federation config — declares `exposes` and `remoteEntry.js` |
| `src/index.js` | Async boundary entry point |
| `src/ProductList.jsx` | Exposed component — static product list |

## Tests

```bash
npm test
```

---

This README was generated by [markdown-manager](https://github.com/yasinatesim/markdown-manager) 🥲
```

- [ ] **Step 6: Commit**

```bash
git add README.md README.tr.md shell-app/README.md products-app/README.md
git commit -m "docs: add README.md (EN+TR) and per-app READMEs"
```

---

## Task 9: Final verification

- [ ] **Step 1: Run all tests**

```bash
npm test --prefix products-app && npm test --prefix shell-app
```

Expected: All tests pass.

- [ ] **Step 2: Run both apps in dev mode**

```bash
npm start
```

Open `http://localhost:3000` — verify glassmorphism UI loads with federated ProductList.
Open `http://localhost:3001` — verify products-app standalone view.

- [ ] **Step 3: Run Docker build and verify**

```bash
npm run docker:build && npm run docker:up
```

Open `http://localhost:3000` — verify production Docker build works end-to-end.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final verification — all tests passing, Docker working"
```

---

## Summary

| Task | Output |
|---|---|
| 1 | Root scaffold, logo, concurrently |
| 2 | products-app webpack/babel config |
| 3 | ProductList with glassmorphism UI + 4 passing tests |
| 4 | shell-app webpack/babel config |
| 5 | App + ErrorBoundary with glassmorphism UI + 5 passing tests |
| 6 | Dev smoke test |
| 7 | Docker multi-stage + nginx + docker-compose |
| 8 | All 4 READMEs (EN + TR) |
| 9 | Final verification |
