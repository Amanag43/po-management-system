# 📦 PO Management System
### ERP Microservice — Purchase Order Management

A full-stack Purchase Order Management System built as an ERP microservice,
featuring vendor management, product catalog, automated tax calculation,
AI-powered descriptions, and real-time notifications.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js + Express.js |
| **Database** | PostgreSQL (Neon Cloud) |
| **ORM** | Sequelize |
| **AI Logs** | MongoDB Atlas |
| **Authentication** | Google OAuth 2.0 + JWT |
| **AI Feature** | Google Gemini 2.5 Flash |
| **Real-time** | Socket.io |
| **Frontend** | HTML5 + Bootstrap 5 + jQuery |
| **Containerization** | Docker + Docker Compose |

---

## ✅ Features

### Core Features
- ✅ **Vendor Management** — CRUD operations for vendors with ratings
- ✅ **Product Catalog** — Products with SKU, pricing, and stock management
- ✅ **Purchase Orders** — Create POs with multiple line items
- ✅ **Tax Calculator** — Automatic 5% tax calculation on all orders
- ✅ **PO Lifecycle** — Status tracking (Pending → Approved → Ordered → Received)
- ✅ **Authentication** — Google OAuth 2.0 + JWT token protection

### Bonus Features
- ✅ **AI Auto-Description** — Gemini AI generates product descriptions
- ✅ **AI Logs** — All generations logged to MongoDB Atlas
- ✅ **Real-time Notifications** — Socket.io notifies status changes instantly
- ✅ **Docker** — Fully containerized with Docker Compose

---

## 📁 Project Structure
```
po-management-system/
├── backend/                 ← Node.js + Express API
│   ├── config/              ← Database connections
│   ├── models/              ← Sequelize models
│   ├── routes/              ← API endpoints
│   ├── services/            ← Business logic
│   ├── middleware/          ← JWT auth middleware
│   └── server.js            ← Entry point
├── frontend/                ← HTML/CSS/JS
│   ├── index.html           ← Login page
│   ├── dashboard.html       ← PO dashboard
│   └── create_po.html       ← Create PO form
├── notification/            ← Socket.io server
├── database/
│   └── schema.sql           ← PostgreSQL schema
├── docker-compose.yml       ← Docker setup
└── README.md
```

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- Docker Desktop (optional)
- Neon account (free PostgreSQL)
- MongoDB Atlas account (free)
- Google Cloud Console account
- Google AI Studio account

---

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/po-management-system.git
cd po-management-system
```

---

### 2. Configure Environment Variables

Create `backend/.env`:
```env
PORT=5000
DATABASE_URL=your_neon_connection_string
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
GEMINI_API_KEY=your_gemini_api_key
```

---

### 3. Setup Database
```bash
psql "your_neon_connection_string" -f database/schema.sql
```

---

### 4. Run Without Docker

#### Terminal 1 — Backend:
```bash
cd backend
npm install
npm run dev
```

#### Terminal 2 — Notifications:
```bash
cd notification
npm install
node server.js
```

Open browser: `http://localhost:5000`

---

### 5. Run With Docker
```bash
# Create root .env with your values
docker-compose up --build
```

Open browser: `http://localhost:5000`

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/google` | Initiate Google OAuth |
| GET | `/auth/google/callback` | OAuth callback |
| GET | `/auth/success` | Get current user |

### Vendors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vendors` | Get all vendors |
| GET | `/api/vendors/:id` | Get vendor by ID |
| POST | `/api/vendors` | Create vendor |
| PUT | `/api/vendors/:id` | Update vendor |
| DELETE | `/api/vendors/:id` | Delete vendor |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| PATCH | `/api/products/:id/stock` | Update stock level |
| DELETE | `/api/products/:id` | Delete product |

### Purchase Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/purchase-orders` | Get all POs |
| GET | `/api/purchase-orders/:id` | Get PO with items |
| POST | `/api/purchase-orders` | Create new PO |
| PATCH | `/api/purchase-orders/:id/status` | Update PO status |
| DELETE | `/api/purchase-orders/:id` | Delete PO |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/generate-description` | Generate AI description |
| GET | `/api/ai/logs` | Get AI generation logs |

---

## 💡 Business Logic

### 5% Tax Calculation
```
Subtotal  = sum of (quantity × unit_price) for all items
Tax       = subtotal × 0.05
Total     = subtotal + tax
```

### PO Status Lifecycle
```
Pending → Approved → Ordered → Received
       ↘          ↘         ↘
       Cancelled  Cancelled  Cancelled
```

### AI Auto-Description
```
User clicks "✨ Auto-Describe"
→ Product name + category sent to backend
→ Backend sends prompt to Gemini 2.5 Flash
→ AI returns 2-sentence marketing description
→ Log saved to MongoDB Atlas
→ Description shown to user
```

---

## 🔒 Security

- Google OAuth 2.0 for identity verification
- JWT tokens for stateless authentication
- Protected routes via middleware
- Environment variables for all secrets
- SSL enforced for database connections

---

## 👨‍💻 Developer

**Aman** — Intern Assignment
Built with using Node.js, PostgreSQL, and Google Gemini AI
