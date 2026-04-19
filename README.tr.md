<div align="center">
  <img src="logo.svg" width="120" alt="Module Federation Logo" />

  <h1>React Module Federation Demo</h1>
  <p>React 18 ile Module Federation 2.0'ın minimal demosu — host + remote pattern.</p>

  <a href="./README.md">🇬🇧 English</a> · 🇹🇷 Türkçe
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

## Netlify'a Deploy

Her uygulamayı aynı repodan ayrı birer Netlify sitesi olarak deploy et.

### 1. Önce products-app'i deploy et

Netlify → **New site from Git** → bu repoyu seç:

| Ayar | Değer |
|---|---|
| Base directory | `products-app` |
| Build komutu | `npm run build` |
| Publish dizini | `products-app/dist` |

`react-mf-wp-product-app.yasinates.com` domainini bu siteye yönlendir.

### 2. shell-app'i deploy et

Netlify → **New site from Git** → bu repoyu seç:

| Ayar | Değer |
|---|---|
| Base directory | `shell-app` |
| Build komutu | `npm run build` |
| Publish dizini | `shell-app/dist` |

shell-app, production'da `ProductList`'i `https://react-mf-wp-product-app.yasinates.com` adresinden çekecek şekilde yapılandırılmıştır — environment variable girmen gerekmez.

## Testler

```bash
npm test --prefix shell-app
npm test --prefix products-app
```

## Makale

📖 [Makaleyi oku](https://medium.com/p/6aa057f28d3c)

---

Bu README [markdown-manager](https://github.com/yasinatesim/markdown-manager) tarafından oluşturulmuştur 🥲
