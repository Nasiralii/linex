# Vercel Environment Variables Setup Guide

## Required Environment Variables

### 1. Core Security Variables

#### AUTH_SECRET (REQUIRED - CRITICAL)
Generate a strong random secret:
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

**Add to Vercel:**
```bash
vercel env add AUTH_SECRET
# Paste the generated secret when prompted
```

#### CSRF_SECRET (Optional - falls back to AUTH_SECRET)
```bash
vercel env add CSRF_SECRET
# Paste a different secret, or skip to use AUTH_SECRET
```

---

### 2. Database (Supabase)

```bash
vercel env add DATABASE_URL
# Format: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

### 3. Upstash Redis (Rate Limiting)

```bash
vercel env add UPSTASH_REDIS_REST_URL
# Value: https://oriented-hornet-69275.upstash.io

vercel env add UPSTASH_REDIS_REST_TOKEN
# Value: gQAAAAAAAQ6bAAIncDE4MTFhMmZhNDgyMTU0NWIxYWU3OGFiZjJkNTU2YTFkOXAxNjkyNzU
```

---

### 4. Email (Resend)

```bash
vercel env add RESEND_API_KEY
# Get from: https://resend.com/api-keys

vercel env add EMAIL_FROM
# Example: LineX Forsa <noreply@yourdomain.com>
```

---

### 5. File Storage (Supabase)

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Format: https://[ref].supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Get from: Supabase Dashboard > Settings > API

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Get from: Supabase Dashboard > Settings > API (service_role key)
```

---

### 6. AI (OpenAI)

```bash
vercel env add OPENAI_API_KEY
# Get from: https://platform.openai.com/api-keys
```

---

### 7. Payment (DineroPay)

```bash
vercel env add DINERO_MERCHANT_KEY
# Get from: DineroPay dashboard

vercel env add DINERO_API_PASSWORD
# Get from: DineroPay dashboard

vercel env add DINERO_ENV
# Value: sandbox (for testing) or production (for live)
```

---

### 8. Application URL

```bash
vercel env add NEXT_PUBLIC_APP_URL
# Format: https://your-app.vercel.app
```

---

## Quick Setup Script

Create a `.env.local` file for local development:

```env
# Core
AUTH_SECRET=your-generated-secret-here
CSRF_SECRET=your-csrf-secret-here

# Database
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://oriented-hornet-69275.upstash.io
UPSTASH_REDIS_REST_TOKEN=gQAAAAAAAQ6bAAIncDE4MTFhMmZhNDgyMTU0NWIxYWU3OGFiZjJkNTU2YTFkOXAxNjkyNzU

# Email
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=LineX Forsa <onboarding@resend.dev>

# Storage
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI
OPENAI_API_KEY=sk-xxxxxxxxxxxx

# Payment
DINERO_MERCHANT_KEY=your-merchant-key
DINERO_API_PASSWORD=your-api-password
DINERO_ENV=sandbox

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
LOG_LEVEL=debug
```

---

## Vercel Dashboard Setup

### Step 1: Go to Project Settings
1. Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project (linex-forsa)
3. Click **Settings** → **Environment Variables**

### Step 2: Add Variables
For each variable:
1. Click **Add New**
2. Enter the **Key** (e.g., `AUTH_SECRET`)
3. Enter the **Value**
4. Select environments: ✅ Production, ✅ Preview, ✅ Development
5. Click **Save**

### Step 3: Redeploy
After adding all variables:
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**

---

## Vercel CLI Setup

### Install Vercel CLI
```bash
npm i -g vercel
```

### Login
```bash
vercel login
```

### Link Project
```bash
cd linex-forsa
vercel link
```

### Add Environment Variables
```bash
# Add each variable
vercel env add AUTH_SECRET
vercel env add DATABASE_URL
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
# ... etc
```

### Pull Environment Variables Locally
```bash
vercel env pull .env.local
```

---

## Verification

### Test Health Endpoint
After deployment, verify your setup:
```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-27T...",
  "checks": {
    "database": { "status": "connected", "responseTimeMs": 45 },
    "redis": { "status": "connected", "responseTimeMs": 12 }
  },
  "services": {
    "rateLimiting": "upstash"
  }
}
```

---

## Troubleshooting

### Issue: "AUTH_SECRET environment variable is required"
**Solution:** Add AUTH_SECRET to Vercel environment variables

### Issue: Rate limiting not working
**Solution:** Verify UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set

### Issue: Database connection failed
**Solution:** Check DATABASE_URL format and Supabase connection pooling settings

### Issue: File uploads failing
**Solution:** Verify SUPABASE_SERVICE_ROLE_KEY is set (not just anon key)