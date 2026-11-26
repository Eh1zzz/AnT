# Aura n Thread (AnT) — E-Commerce Platform

> South-Side Nigerian-born fashion label. Per-piece production model. Bespoke cultural craft meets contemporary street.

---

## Project Structure

```
aura-n-thread/
├── database/
│   └── schema.sql          ← MySQL schema + seed data
├── backend/                ← Node.js · Express · TypeScript
│   ├── src/
│   │   ├── config/         ← DB pool + env validation
│   │   ├── controllers/    ← Auth, Products, Orders + Paystack webhook
│   │   ├── middleware/     ← JWT protect, adminOnly, error handler
│   │   ├── models/         ← User, Product, Order (raw SQL, no ORM)
│   │   ├── routes/         ← auth / products / orders
│   │   └── utils/          ← Logger, Paystack helpers
│   └── server.ts
└── frontend/               ← React 18 · TypeScript · Vite · Tailwind
    └── src/
        ├── components/
        │   ├── canvas/     ← Floyd-Steinberg DitherImage canvas component
        │   ├── common/     ← Navbar, Footer
        │   └── shop/       ← ProductCard, CartDrawer, SizeGuideModal
        ├── context/        ← CartContext (Zustand-free, React Context)
        ├── pages/          ← Home, Shop, ProductDetail, Checkout, OrderConfirmation
        ├── services/       ← Axios API client (auth / product / order)
        ├── styles/         ← globals.css (Tailwind base + editorial utilities)
        └── types/          ← Shared TypeScript interfaces
```

---

## 1 — Database Setup

```bash
# Create schema and seed demo products
mysql -u root -p < database/schema.sql
```

**Seed accounts:**
- No admin is seeded automatically. After registering, manually set `role='admin'` in the `users` table:
  ```sql
  UPDATE users SET role='admin' WHERE email='your@email.com';
  ```

---

## 2 — Backend

### Install & configure
```bash
cd backend
npm install
cp .env.example .env
# Fill in: DB_PASSWORD, JWT_SECRET (32+ random chars), PAYSTACK_SECRET_KEY
```

### Run
```bash
npm run dev        # Development (ts-node-dev, hot reload)
npm run build      # Compile TypeScript → dist/
npm start          # Production (runs dist/server.js)
```

**API base:** `http://localhost:4000/api`

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Login → JWT |
| GET | `/auth/me` | JWT | Current user |
| GET | `/products` | — | List all (`?category=ankara`) |
| GET | `/products/:slug` | — | Single product + variants |
| POST | `/products` | Admin | Create product |
| POST | `/products/:id/variants` | Admin | Add size/colour variant |
| PATCH | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Delete product |
| POST | `/orders/initiate` | JWT | Create order → Paystack URL |
| GET | `/orders` | JWT | User's own orders |
| GET | `/orders/verify/:ref` | JWT | Poll order after payment |
| POST | `/orders/webhook` | Paystack sig | Payment event handler |

### Paystack webhook
In your Paystack dashboard set the webhook URL to:
```
https://your-domain.com/api/orders/webhook
```
The server validates the `x-paystack-signature` header with HMAC-SHA512.

---

## 3 — Frontend

### Install & configure
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:4000/api
# Set VITE_WHATSAPP=234XXXXXXXXXX  (Nigerian format)
```

### Run
```bash
npm run dev        # Vite dev server → http://localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build
```

### Tailwind CLI (production build)
Tailwind is processed automatically by Vite via PostCSS. For a standalone CSS build:
```bash
npx tailwindcss -i src/styles/globals.css -o dist/styles.css --minify
```

---

## 4 — Design System

**Aesthetic:** 1-bit dither editorial — stark monochrome, oversized typography, rigid grid.

| Token | Value |
|-------|-------|
| Background | `#000000` |
| Text | `#FFFFFF` |
| Borders | `rgba(255,255,255,0.10)` |
| Font (Display) | Space Grotesk Bold |
| Font (Mono) | Space Mono |
| Grid | CSS Grid, 1px border separators |

### DitherImage component
`src/components/canvas/DitherImage.tsx` applies **Floyd-Steinberg error diffusion dithering** directly on an HTML5 canvas:
1. Loads the image cross-origin
2. Converts each pixel to grayscale (`0.299R + 0.587G + 0.114B`)
3. Runs Floyd-Steinberg — propagates quantisation error to 4 neighbours
4. On hover: re-dithers with `threshold + 48` for a blown-out editorial effect

```tsx
<DitherImage
  src="https://..."
  alt="Product name"
  threshold={115}   // 0–255; lower = more black
  hoverEffect       // re-dither on hover
  className="w-full aspect-product"
/>
```

---

## 5 — Production Deployment

### Backend (Render / Railway / DigitalOcean)
1. Set all `.env` vars in the hosting dashboard
2. Build command: `npm run build`
3. Start command: `npm start`
4. Ensure MySQL (PlanetScale or managed DB) is accessible

### Frontend (Vercel / Netlify)
1. Build command: `npm run build`
2. Output dir: `dist`
3. Set `VITE_API_URL` to your deployed backend URL

---

## 6 — Technology Stack Summary

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | React 18 + TypeScript | Type-safe component model |
| Styling | Tailwind CSS (Vite/PostCSS) | Utility-first, zero runtime |
| Animation | Framer Motion | Production-grade micro-interactions |
| Canvas FX | HTML5 Canvas API | Floyd-Steinberg dither, no deps |
| State | React Context | Lightweight; no external store needed |
| Backend | Express 4 + TypeScript | Minimal, well-understood API layer |
| Database | MySQL2 (raw SQL) | ACID-compliant, strict schema |
| Auth | bcrypt + JWT (7d) | Industry-standard password security |
| Payments | Paystack | Best-in-class NGN payment gateway |
| Orders | Transactional SQL | Stock lock + order creation atomically |
