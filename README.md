<div align="center">
<img src="client/public/images/logo.png" alt="Fluxmart Logo" width="120" />
<h1>Fluxmart</h1>
<h2>Multi-Vendor eCommerce Platform</h2>

[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)](https://stripe.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <b>A comprehensive, scalable, and modern solution for multi-vendor commerce.</b><br />
  Empowering vendors to sell and customers to shop in a seamless, unified ecosystem.
</p>

[View Demo](#) • [Documentation](#documentation) • [Report Bug](https://github.com/hamzaiqbal35/Fluxmart_Multi-Vendor-eCommerce-Platform/issues) • [Request Feature](https://github.com/hamzaiqbal35/Fluxmart_Multi-Vendor-eCommerce-Platform/issues)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Future Roadmap](#-future-roadmap)
- [License](#-license)
- [Contact](#-contact)

---

## 🔭 Overview

This project is a full-featured **Multi-Vendor eCommerce Platform** designed to bridge the gap between multiple sellers and a unified customer base. Built with performance and scalability in mind, it leverages the latest web technologies to deliver a fast, responsive, and secure shopping experience.

Whether you are a customer looking for products, a vendor managing an inventory, or an administrator overseeing the platform, this solution provides tailored interfaces and robust functionality for all user roles.

---

## ✨ Key Features

### 🛒 For Customers
- **Seamless Shopping**: Browse products from multiple vendors in one place.
- **Dynamic Media Support**: Robust product pages supporting both images and `.mp4/.webm` videos for richer product presentations.
- **Smart Cart**: Persistent shopping cart with guest checkout options and dynamic shipping/tax calculations.
- **Secure Reviews**: Verified purchase reviews and 5-star rating system.
- **Order Tracking**: Real-time updates on order status (Pending, Processing, Shipped, Delivered) and tracking details.
- **Stripe Payments**: Integrated with Stripe for secure credit/debit card transactions.

### 🏪 For Vendors
- **Dashboard**: Specialized panel to manage products, inventory, and sales.
- **Order Management**: View and process orders specific to their products.
- **Split Orders**: Multi-vendor order support handles split payments and shipping automatically.

### 🛡️ For Administrators
- **Platform Oversight**: Comprehensive dashboard for monitoring users, products, and orders with detailed Recharts analytics.
- **User Management**: Tools to suspend, ban, or verify users and vendors.
- **Dynamic Categories**: Admin-controlled dynamic product categories that automatically populate the vendor dashboards.
- **Store Settings**: Fully manageable shipping and tax configurations straight from the dashboard.

### 🔐 Security & Core
- **Authentication**: Secure JWT-based auth with role-based access control (RBAC).
- **Data Integrity**: Robust input validation (express-validator) and secure database transactions.
- **Responsive**: Mobile-first design ensures compatibility across all devices using TailwindCSS.

---

## 💻 Tech Stack

### Frontend Client
| Tech | Description |
| --- | --- |
| **React 19** | The latest library for building interactive UIs. |
| **Vite** | Next-generation frontend tooling for lightning-fast builds. |
| **Tailwind CSS** | Utility-first CSS framework for rapid UI development. |
| **Recharts** | Composable charting library for dashboard analytics. |
| **Stripe React** | Secure checkout elements for processing payments. |
| **Lucide React** | Modern SVG icons. |
| **Axios** | Promise-based HTTP client for API requests. |
| **SweetAlert2 & Toastify** | Beautiful, responsive, customizable popups and toast notifications. |

### Backend API
| Tech | Description |
| --- | --- |
| **Node.js** | JavaScript runtime built on Chrome's V8 engine. |
| **Express.js** | Minimalist web framework for Node.js. |
| **MongoDB** | NoSQL database for flexible data schemas. |
| **Mongoose** | ODM library for MongoDB and Node.js. |
| **Stripe** | Backend payment intent creation and management. |
| **Multer / Cloudinary** | Handling local file uploads and scalable cloud storage for images/videos. |
| **Nodemailer** | Module for sending transactional emails. |
| **BcryptJS & JWT** | Password hashing and secure authentication tokens. |

---

## 📂 Project Structure

```bash
root/
├── client/                 # 🎨 Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI blocks
│   │   ├── context/        # Context Providers (Auth, Cart, etc.)
│   │   ├── pages/          # Application Routes/Views
│   │   └── utils/          # Helpers (API config, currency formatter, getMediaUrl)
│   └── ...
│
├── server/                 # ⚙️ Backend (Node + Express)
│   ├── src/
│   │   ├── config/         # Environment & DB Configs
│   │   ├── controllers/    # Request Handlers
│   │   ├── middleware/     # Auth (JWT) & Validation Middleware
│   │   ├── models/         # Mongoose Schemas (User, Product, Order, etc.)
│   │   └── routes/         # API Endpoint Definitions
│   └── ...
│
└── README.md               # 📄 You are here!
```

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v18+)
- **npm** (v9+) or **yarn**
- **MongoDB** (Local instance or Atlas URI)
- **Stripe Account** (for payment processing)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/hamzaiqbal35/Fluxmart_Multi-Vendor-eCommerce-Platform.git
    cd "Fluxmart_Multi-Vendor eCommerce Platform"
    ```

2.  **Install Dependencies**
    ```bash
    # Install Backend Dependencies
    cd server
    npm install

    # Install Frontend Dependencies
    cd ../client
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in both `client/` and `server/` directories using the provided `.env.example` as a template.

    **Server `.env` example:**
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    STRIPE_SECRET_KEY=your_stripe_secret_key
    ```

    **Client `.env` example:**
    ```env
    VITE_API_URL=http://localhost:5000/api
    VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
    ```

4.  **Launch Development Servers**
    Open two terminal windows:

    **Terminal 1 (Backend)**
    ```bash
    cd server
    npm run dev
    ```

    **Terminal 2 (Frontend)**
    ```bash
    cd client
    npm run dev
    ```

5.  **Access the App**
    - Application: `http://localhost:5173`
    - API Server: `http://localhost:5000`

---

## 🔌 API Reference

### Authentication
- `POST /api/auth/register` - Create a new account
- `POST /api/auth/login` - Sign in and receive JWT
- `GET /api/auth/me` - Retrieve current user profile

### Products
- `GET /api/products` - List all products with pagination/filtering
- `GET /api/products/:id` - Get product details
- `POST /api/products` - (Vendor/Admin) Create new product (supports multi-image & video upload)
- `PUT /api/products/:id` - (Vendor/Admin) Update product details

### Categories
- `GET /api/categories` - Fetch active categories
- `POST /api/categories` - (Admin) Create a category

### Orders
- `POST /api/orders` - Place a new order with Stripe Intent
- `GET /api/orders/my-orders` - History of customer orders
- `GET /api/orders/all` - (Vendor/Admin) View all relevant orders
- `PUT /api/orders/:id/status` - (Vendor/Admin) Update order fulfillment status

*(See `server/README.md` for the full API documentation)*

---

## 🛣️ Future Roadmap

- [ ] 🔍 **Advanced Search** - ElasticSearch integration for better discovery.
- [ ] ❤️ **Wishlist** - Save items for later.
- [ ] 📊 **Vendor Analytics** - Detailed sales graphs and reports specific to individual vendors.
- [ ] 🔔 **Real-time Notifications** - Socket.io integration for instant updates on order status.
- [ ] 🌐 **Localization** - Multi-language support (i18n).

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📬 Contact

<div align="center">

### Hamza Iqbal

[![Email](https://img.shields.io/badge/Gmail-hamzaiqbalrajpoot35%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:hamzaiqbalrajpoot35@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-hamzaiqbal35-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hamzaiqbal35)

<br />

**Project Link**
<br />
[Fluxmart_Multi-Vendor-eCommerce-Platform](https://github.com/hamzaiqbal35/Fluxmart_Multi-Vendor-eCommerce-Platform)

</div>

<div align="center">
  <br />
  <sub>Made with ❤️ by Hamza Iqbal</sub>
</div>
