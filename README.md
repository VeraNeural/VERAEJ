# VERA - AI Nervous System Companion

<div align="center">
  <img src="https://via.placeholder.com/150/8B5CF6/FFFFFF?text=V" alt="VERA Logo" width="150" height="150" style="border-radius: 50%">
  
  <h3>Your Body Has the Answers. VERA Helps You Listen.</h3>
  
  <p>24/7 trauma-informed support for nervous system regulation</p>

  [![Built with Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
  [![Powered by LM Studio](https://img.shields.io/badge/LM_Studio-Local_AI-blue)](https://lmstudio.ai/)
  [![Database: PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)](https://www.postgresql.org/)
</div>

---

## 📋 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Prerequisites](#-prerequisites)
4. [Installation](#-installation)
5. [Database Setup](#-database-setup)
6. [Environment Variables](#-environment-variables)
7. [Stripe Integration](#-stripe-integration)
8. [Running the App](#-running-the-app)
9. [Project Structure](#-project-structure)
10. [Deployment](#-deployment)

---

## ✨ Features

### 🎯 Core Features
- **Living Breathing Orb** - Interactive visual breathwork companion
- **Body-First AI Conversations** - Trauma-informed nervous system support
- **24/7 Availability** - No appointments, no waiting rooms
- **Smart Emotion Detection** - Recognizes overwhelm, anger, sadness, disconnection
- **Contextual Action Cards** - Offers immediate regulation techniques
- **Voice Responses** - Optional audio output via ElevenLabs
- **Dark Mode** - Gentle on the eyes during night sessions

### 🔐 User Management
- **Secure Authentication** - JWT-based auth with bcrypt password hashing
- **User Profiles** - Save personal information and preferences
- **7-Day Free Trial** - No credit card required to start
- **Subscription Management** - Monthly ($29) or Annual ($199) plans

### 💾 Chat Features
- **Save All Conversations** - Never lose your insights
- **Chat History Dashboard** - Review past sessions
- **Session Management** - Organize conversations by topic
- **Pattern Tracking** - Understand your triggers over time

---

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Lucide Icons**

### Backend
- **Next.js API Routes**
- **PostgreSQL** (via Supabase or local)
- **JSON Web Tokens** (JWT)
- **bcrypt** (password hashing)

### AI & Voice
- **LM Studio** (local LLM - Qwen 3 4B)
- **ElevenLabs** (optional voice synthesis)

### Payment
- **Stripe Payment Links** (no API integration needed)

---

## 📦 Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** for version control
- **LM Studio** installed ([Download](https://lmstudio.ai/))
- **PostgreSQL** OR **Supabase account** (free)
- **Stripe account** (for payments)
- **ElevenLabs API key** (optional - for voice)

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/vera-ai.git
cd vera-ai
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Next.js and React
- TypeScript and types
- Tailwind CSS
- PostgreSQL client (pg)
- Authentication libraries (bcryptjs, jsonwebtoken, cookie)
- All other dependencies

### Step 3: Install Additional Dependencies

```bash
npm install bcryptjs jsonwebtoken pg cookie
npm install --save-dev @types/bcryptjs @types/jsonwebtoken @types/pg @types/cookie
```

---

## 💾 Database Setup

### Option A: Supabase (Recommended - Free & Easy)

1. **Create Account:**
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Sign up with GitHub or email

2. **Create Project:**
   - Click "New Project"
   - Choose organization name
   - Set database password (save this!)
   - Select region closest to you
   - Wait for project to initialize (~2 minutes)

3. **Run Database Schema:**
   - Go to **SQL Editor** in left sidebar
   - Copy the entire contents of `database/schema.sql`
   - Paste into SQL Editor
   - Click **Run** (or press Ctrl/Cmd + Enter)
   - You should see "Success. No rows returned"

4. **Get Connection String:**
   - Go to **Settings** → **Database**
   - Scroll to **Connection String**
   - Select **URI** format
   - Copy the string (it looks like: `postgresql://postgres:[PASSWORD]@...`)
   - Replace `[PASSWORD]` with your database password
   - Add to `.env.local` (next step)

### Option B: Local PostgreSQL

```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start

# Create database
createdb vera_db

# Run schema
psql vera_db < database/schema.sql
```

---

## 🔐 Environment Variables

Create a `.env.local` file in your project root:

```env
# ================================
# DATABASE
# ================================
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"

# ================================
# AUTHENTICATION
# ================================
# Generate a secure random string (minimum 32 characters)
# You can use: openssl rand -base64 32
JWT_SECRET="your_super_secret_jwt_key_make_it_very_long_and_random_123456789"

# ================================
# LM STUDIO (Local AI)
# ================================
LMSTUDIO_API_URL="http://127.0.0.1:1234/v1/chat/completions"

# ================================
# ELEVENLABS (Optional - Voice)
# ================================
# Get your API key from: https://elevenlabs.io/
ELEVENLABS_API_KEY="your_elevenlabs_api_key_here"
ELEVENLABS_VOICE_ID="WAhoMTNdLdMoq1j3wf3I"

# ================================
# STRIPE PAYMENT LINKS
# ================================
NEXT_PUBLIC_STRIPE_MONTHLY_LINK="https://buy.stripe.com/your_monthly_link_here"
NEXT_PUBLIC_STRIPE_ANNUAL_LINK="https://buy.stripe.com/your_annual_link_here"

# ================================
# APP URL (for production)
# ================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### How to Generate JWT Secret:

```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online
# Visit: https://www.random.org/strings/
# Length: 32, Characters: alphanumeric
```

---

## 💳 Stripe Integration

VERA uses **Stripe Payment Links** (no API coding required!)

### Step 1: Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up for free
3. Complete verification

### Step 2: Create Products

**Monthly Plan:**
1. Go to **Products** → **Add Product**
2. Name: "VERA Monthly Subscription"
3. Pricing: $29 USD, Recurring, Monthly
4. Click **Save Product**
5. Click **Create a payment link**
6. Copy the payment link URL
7. Add to `.env.local` as `NEXT_PUBLIC_STRIPE_MONTHLY_LINK`

**Annual Plan:**
1. **Products** → **Add Product**
2. Name: "VERA Annual Subscription"
3. Pricing: $199 USD, Recurring, Yearly
4. Click **Save Product**
5. Click **Create a payment link**
6. Copy the payment link URL
7. Add to `.env.local` as `NEXT_PUBLIC_STRIPE_ANNUAL_LINK`

### Step 3: Update Landing Page

The landing page will automatically use your Stripe links from the environment variables.

---

## 🤖 LM Studio Setup

1. **Download LM Studio:**
   - Visit [lmstudio.ai](https://lmstudio.ai/)
   - Download for your OS (Windows/Mac/Linux)
   - Install the application

2. **Download Model:**
   - Open LM Studio
   - Go to **Search** tab
   - Search for: `Qwen/Qwen3-4B-2507`
   - Click **Download**
   - Wait for download to complete (~2.5GB)

3. **Load Model:**
   - Go to **Chat** tab (💬 icon)
   - Click model dropdown at top
   - Select `Qwen3-4B-2507`
   - Model should load (shows green dot)

4. **Start Server:**
   - Click **Local Server** tab (🌐 icon)
   - Click **Start Server**
   - Keep LM Studio running while using VERA
   - Default URL: `http://127.0.0.1:1234/v1/chat/completions`

---

## 🏃‍♂️ Running the App

### Development Mode

```bash
# Start LM Studio server first!
# Then run:
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
vera-ai/
├── app/
│   ├── page.tsx                    # Landing page with living orb
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   │
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.tsx           # Sign in page
│   │   └── signup/
│   │       └── page.tsx           # Sign up page
│   │
│   ├── chat/
│   │   └── page.tsx               # Chat interface (needs creation)
│   │
│   ├── dashboard/
│   │   └── page.tsx               # Chat history dashboard (needs creation)
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signup/
│   │   │   │   └── route.ts       # Sign up API (needs creation)
│   │   │   ├── signin/
│   │   │   │   └── route.ts       # Sign in API (needs creation)
│   │   │   └── me/
│   │   │       └── route.ts       # Current user API (needs creation)
│   │   │
│   │   ├── chat/
│   │   │   └── route.ts           # Chat API (exists - updated)
│   │   │
│   │   └── sessions/
│   │       └── route.ts           # Chat sessions API (needs creation)
│   │
│   └── components/
│       └── ChatWindow.tsx         # Chat component (exists - updated)
│
├── lib/
│   ├── db.ts                      # Database connection (exists)
│   └── auth.ts                    # Auth helpers (needs creation)
│
├── database/
│   └── schema.sql                 # Database schema (exists)
│
├── public/                        # Static assets
├── .env.local                     # Environment variables (you create)
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── tailwind.config.ts             # Tailwind config
└── README.md                      # This file
```

---

## 🔧 Configuration Files

### `package.json`

Your `package.json` should include:

```json
{
  "name": "vera-ai",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "lucide-react": "latest",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3",
    "cookie": "^0.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/pg": "^8.10.9",
    "@types/cookie": "^0.6.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33"
  }
}
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/vera-ai.git
git push -u origin main
```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Add environment variables from `.env.local`
   - Click **Deploy**

3. **Important Notes:**
   - LM Studio must run locally (not on Vercel)
   - For production AI, use: OpenAI API, Anthropic Claude API, or hosted LLM
   - Update `LMSTUDIO_API_URL` to point to your hosted AI endpoint

### Environment Variables on Vercel

Add all variables from `.env.local` to Vercel:
- Project Settings → Environment Variables
- Add each variable one by one
- Redeploy after adding variables

---

## 🎯 Next Steps After Setup

### ✅ Created (You Have These)
- ✅ Landing page with living orb
- ✅ Sign up page
- ✅ Sign in page
- ✅ Database schema
- ✅ Database helper functions
- ✅ Chat window component
- ✅ Chat API route (updated)

### 📝 Still Need to Create

I can create these for you next:

1. **Auth API Routes:**
   - `app/api/auth/signup/route.ts`
   - `app/api/auth/signin/route.ts`
   - `app/api/auth/me/route.ts`

2. **Auth Helper:**
   - `lib/auth.ts`

3. **Chat Page:**
   - `app/chat/page.tsx` (protected route with auth)

4. **Dashboard:**
   - `app/dashboard/page.tsx` (view saved chats)

5. **Sessions API:**
   - `app/api/sessions/route.ts`

Would you like me to create all these files now?

---

## 🐛 Troubleshooting

### LM Studio Connection Issues
```bash
# Check if LM Studio is running:
curl http://127.0.0.1:1234/v1/models

# Should return: {"data":[...]}
```

### Database Connection Issues
```bash
# Test Supabase connection:
psql "your_connection_string_here"

# Should connect without errors
```

### Build Errors
```bash
# Clear cache and rebuild:
rm -rf .next
npm run build
```

---

## 📝 License

Proprietary - © 2025 VERA AI. All rights reserved.

---

## 💜 Support

For issues or questions:
- 📧 Email: support@vera-ai.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/vera-ai/issues)
- 📖 Docs: [Documentation](https://vera-ai.com/docs)

---

## 🙏 Credits

**VERA Methodology:** Created by Eva Leka
**Built with:** Next.js, React, PostgreSQL, LM Studio
**Design:** Inspired by trauma-informed care principles

---

<div align="center">
  <p><strong>Your biology is brilliant. From here, you rise.</strong></p>
  <p>Made with 💜 for nervous system regulation</p>
</div>