# NajTech — Enterprise Virtual Internship & LMS Platform

A full-stack EdTech SaaS platform built with Next.js 15 App Router, MongoDB, and modern tooling.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | MongoDB Atlas |
| Auth | Auth.js v5 (NextAuth) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| State | Zustand |
| Payments | Razorpay + PhonePe |
| Email | Nodemailer |
| Storage | Local / Cloudinary |

## 📁 Project Structure

```
internvault/
├── app/
│   ├── (public)/          # Public website pages
│   │   ├── page.tsx        # Home
│   │   ├── internships/    # Browse & detail
│   │   ├── mentors/        # Mentor showcase
│   │   ├── blog/           # Blog listing & detail
│   │   ├── about/
│   │   ├── contact/
│   │   ├── verify-certificate/
│   │   ├── privacy-policy/
│   │   ├── terms-conditions/
│   │   └── refund-policy/
│   ├── (auth)/             # Authentication
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (student)/          # Student dashboard
│   │   ├── dashboard/
│   │   ├── my-internships/
│   │   ├── assignments/
│   │   ├── certificates/
│   │   ├── payments/
│   │   └── profile/
│   ├── (admin)/            # Admin panel
│   │   └── admin/
│   │       ├── dashboard/
│   │       ├── users/
│   │       ├── internships/
│   │       ├── orders/
│   │       ├── certificates/
│   │       ├── blogs/
│   │       ├── cms/
│   │       ├── theme/
│   │       ├── seo/
│   │       ├── coupons/
│   │       └── audit-logs/
│   └── api/                # Route handlers
│       ├── auth/
│       ├── internships/
│       ├── enrollments/
│       ├── assignments/
│       ├── payments/
│       ├── certificates/
│       ├── users/
│       ├── blogs/
│       ├── mentors/
│       ├── coupons/
│       ├── cms/
│       ├── seo/
│       └── admin/
├── components/
│   ├── ui/                 # Base UI components
│   ├── shared/             # Layout (Navbar, Footer)
│   ├── home/               # Home page sections
│   ├── internships/        # Internship components
│   ├── dashboard/          # Dashboard components
│   └── admin/              # Admin components
├── lib/
│   ├── auth/               # Auth helpers & RBAC
│   ├── db/                 # MongoDB connection
│   ├── email/              # Email templates
│   ├── payments/           # Razorpay + PhonePe
│   ├── seo/                # SEO utilities
│   ├── storage/            # File upload
│   └── validations.ts      # Zod schemas
├── models/                 # Mongoose models
├── store/                  # Zustand stores
├── types/                  # TypeScript types
└── scripts/
    └── seed.ts             # Database seeder
```

## ⚡ Quick Start

### 1. Clone and install

```bash
git clone https://github.com/yourorg/internvault
cd internvault
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

Required variables:
- `MONGODB_URI` — MongoDB Atlas connection string
- `AUTH_SECRET` — Random 32+ char secret
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` — Razorpay credentials
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — Email config

### 3. Seed the database

```bash
npx tsx scripts/seed.ts
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Test Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@internvault.com | Admin@123 |
| Mentor | mentor@internvault.com | Admin@123 |
| Student | student@internvault.com | Admin@123 |

## 📄 Key Pages

| URL | Description |
|-----|-------------|
| `/` | Home page with CMS sections |
| `/internships` | Browse all internships |
| `/internships/[slug]` | Internship detail + enrollment |
| `/login` | Student/Admin login |
| `/register` | New student registration |
| `/dashboard` | Student learning dashboard |
| `/my-internships` | Enrolled programs |
| `/assignments` | Submit/view assignments |
| `/certificates` | Download certificates |
| `/verify-certificate` | Public cert verification |
| `/admin/dashboard` | Admin analytics |
| `/admin/internships` | Manage programs |
| `/admin/users` | User management |
| `/admin/orders` | Order management |
| `/admin/theme` | Theme builder |
| `/admin/cms` | CMS page builder |
| `/admin/seo` | SEO management |
| `/admin/coupons` | Coupon management |

## 💳 Payment Flow

```
Student → Cart → Checkout → Razorpay/PhonePe
                               ↓
                          Verification
                               ↓
                          Enrollment Created
                               ↓
                          Welcome Email Sent
                               ↓
                          Dashboard Access
```

## 🔒 Security Features

- Auth.js JWT sessions with role-based access
- Bcrypt password hashing (12 rounds)
- Rate limiting on auth endpoints
- Input validation with Zod
- Security headers (XSS, CSRF, X-Frame-Options)
- File upload type validation

## 🚀 Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

Set all environment variables in Vercel dashboard.

### Environment Variables for Production

```
MONGODB_URI=mongodb+srv://...
AUTH_SECRET=<32-char-random-string>
NEXT_PUBLIC_APP_URL=https://yourdomain.com
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
PHONEPE_MERCHANT_ID=...
PHONEPE_SALT_KEY=...
PHONEPE_ENV=PROD
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

## 📊 MongoDB Collections

| Collection | Purpose |
|-----------|---------|
| users | All user accounts |
| mentors | Mentor profiles |
| internships | Program listings |
| categories | Program categories |
| enrollments | Student enrollments |
| assignments | Weekly assignments |
| certificates | Issued certificates |
| orders | Purchase orders |
| payments | Payment records |
| coupons | Discount codes |
| blogs | Blog posts |
| testimonials | Student testimonials |
| faqs | FAQ entries |
| themes | Platform theme settings |
| cmspages | CMS page content |
| seopages | SEO metadata per page |
| media | Uploaded media files |
| notifications | User notifications |
| auditlogs | Admin action logs |

## 📝 License

MIT License — NajTech
