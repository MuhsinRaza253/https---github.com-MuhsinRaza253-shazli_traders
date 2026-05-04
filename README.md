# Al-Taqiyya Islamic Caps — Full Stack E-Commerce

## 🏗️ Project Structure

```
islamic-caps/
├── backend/               # Node.js + Express + MongoDB API
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # JWT auth
│   ├── config/            # Cloudinary
│   ├── server.js
│   └── .env.example
│
└── frontend/              # Next.js 14
    ├── pages/
    │   ├── index.js       # Homepage
    │   ├── shop/          # Shop + product pages
    │   ├── cart.js
    │   ├── checkout.js
    │   ├── orders.js
    │   ├── profile.js
    │   ├── auth/          # Login + Register
    │   └── admin/         # Dashboard, Products, Orders, etc.
    ├── components/        # Navbar, Footer, ProductCard, AdminLayout
    ├── context/           # Auth + Cart state
    └── styles/            # Global CSS design system
```

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your MongoDB, Cloudinary, and Stripe keys
npm install
npm run dev   # Starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev   # Starts on http://localhost:3000
```

---

## ☁️ Free Deployment

### Step 1 — MongoDB Atlas (Database)
1. Go to https://mongodb.com/atlas and create a free M0 cluster
2. Create a database user with password
3. In Network Access → Add IP Address → Allow from anywhere (0.0.0.0/0)
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/islamic-caps`

### Step 2 — Cloudinary (Image Storage)
1. Sign up free at https://cloudinary.com
2. From dashboard, copy: Cloud Name, API Key, API Secret

### Step 3 — Stripe (Payments)
1. Sign up at https://stripe.com
2. Get test keys from Dashboard → Developers → API Keys
3. Use `4242 4242 4242 4242` for testing card payments

### Step 4 — Render (Backend Hosting)
1. Push your code to GitHub
2. Go to https://render.com → New Web Service
3. Connect your GitHub repo → select `backend` folder
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all env variables from `.env.example`
7. Deploy! You'll get a URL like `https://islamic-caps-api.onrender.com`

### Step 5 — Vercel (Frontend Hosting)
1. Go to https://vercel.com → Add New Project
2. Connect your GitHub repo → select `frontend` folder
3. Add env variable: `NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com/api`
4. Deploy! You'll get a URL like `https://al-taqiyya.vercel.app`

---

## 👑 First Admin Setup

After deployment, create your admin account:

1. Register normally on the site
2. In MongoDB Atlas → Browse Collections → users
3. Find your user document → Click Edit
4. Change `role` from `"customer"` to `"admin"`
5. Save → Now you can access `/admin/dashboard`

---

## 📋 All Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, categories, featured products |
| `/shop` | Full shop with filters |
| `/shop/[slug]` | Product detail with reviews |
| `/cart` | Shopping cart |
| `/checkout` | Multi-step checkout (address → payment → confirm) |
| `/orders` | Customer order history |
| `/profile` | Edit profile + change password |
| `/auth/login` | Login |
| `/auth/register` | Register |
| `/admin/dashboard` | Stats, revenue chart, recent orders |
| `/admin/products` | Products table with search |
| `/admin/products/add` | Add new product |
| `/admin/categories` | Category management |
| `/admin/orders` | Order management with status updates |
| `/admin/customers` | Customer list with block/activate |

---

## 🔌 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | User | Current user |
| GET | `/api/products` | — | List products (with filters) |
| GET | `/api/products/:slug` | — | Single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/categories` | — | All categories |
| POST | `/api/orders` | User | Place order |
| GET | `/api/orders/my` | User | My orders |
| GET | `/api/admin/dashboard` | Admin | Dashboard stats |
| GET | `/api/admin/orders` | Admin | All orders |
| PUT | `/api/admin/orders/:id` | Admin | Update order status |
| GET | `/api/admin/customers` | Admin | All customers |

---

## 🎨 Design System

- **Colors**: Emerald `#1a5c3a`, Gold `#c8972a`, Cream `#faf7f0`
- **Fonts**: Cormorant Garamond (headings), Nunito Sans (body), Amiri (Arabic)
- **Theme**: Luxury Islamic — geometric patterns, calligraphy accents

---

## 🛒 Business Logic

- Free shipping on orders over PKR 3,000 (PKR 200 flat below that)
- Stock decremented automatically on order placement
- Stock restored if customer cancels a pending order
- Admin can update order status + add tracking number
- Reviews require a logged-in account (one per user per product)
