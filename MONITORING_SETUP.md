# Monitoring & Health Check Setup Guide

## Overview

Your application now has a comprehensive health check endpoint at `/api/health` that monitors:
- ✅ Database connectivity (Supabase PostgreSQL)
- ✅ Redis connectivity (Upstash)
- ✅ Response times
- ✅ Service configurations

---

## Health Check Endpoint

### URL
```
https://your-app.vercel.app/api/health
```

### Response Format
```json
{
  "status": "healthy",
  "timestamp": "2026-03-27T12:00:00.000Z",
  "version": "0.1.0",
  "environment": "production",
  "responseTimeMs": 45,
  "checks": {
    "database": {
      "status": "connected",
      "responseTimeMs": 32
    },
    "redis": {
      "status": "connected",
      "responseTimeMs": 12
    }
  },
  "services": {
    "email": "configured",
    "storage": "configured",
    "ai": "configured",
    "payment": "configured",
    "rateLimiting": "upstash"
  }
}
```

### Status Codes
- `200` — Healthy (all critical services operational)
- `503` — Unhealthy (database or critical service down)

---

## Option 1: Uptime Robot (Free)

### Setup Steps

1. **Create Account**
   - Visit [uptimerobot.com](https://uptimerobot.com)
   - Sign up for free (50 monitors included)

2. **Add Monitor**
   - Click **Add New Monitor**
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** LineX Forsa Health
   - **URL:** `https://your-app.vercel.app/api/health`
   - **Monitoring Interval:** 5 minutes

3. **Configure Alerts**
   - **Alert When Down:** ✅ Enabled
   - **Alert Contacts:** Add your email
   - **Alert Threshold:** 2 consecutive failures

4. **Advanced Settings**
   - **HTTP Method:** GET
   - **Expected Status Code:** 200
   - **Keyword:** `"status":"healthy"`

### Alert Channels
- Email
- SMS (paid)
- Slack webhook
- Discord webhook
- Telegram

---

## Option 2: Better Stack (Formerly Logtail)

### Setup Steps

1. **Create Account**
   - Visit [betterstack.com](https://betterstack.com)
   - Free tier: 10 monitors, 3-minute checks

2. **Add Monitor**
   - Click **Uptime** → **Monitor**
   - **URL:** `https://your-app.vercel.app/api/health`
   - **Check Frequency:** 3 minutes

3. **Configure Heartbeat**
   - **Expected Status:** 200
   - **Expected Body:** `healthy`

---

## Option 3: Cron-job.org (Free)

### Setup Steps

1. **Create Account**
   - Visit [cron-job.org](https://cron-job.org)
   - Free: 50 jobs, 1-minute intervals

2. **Create Cron Job**
   - **Title:** LineX Forsa Health Check
   - **URL:** `https://your-app.vercel.app/api/health`
   - **Interval:** Every 5 minutes

3. **Notifications**
   - Enable email notifications on failure

---

## Option 4: Vercel Analytics (Built-in)

### Enable in Vercel Dashboard

1. Go to your project on Vercel
2. Click **Analytics** tab
3. Enable **Web Vitals**
4. Enable **Speed Insights**

### Custom Events (Optional)
Add to your API routes:
```typescript
import { track } from '@vercel/analytics';

export async function GET() {
  track('health_check', { status: 'healthy' });
  // ... rest of your code
}
```

---

## Option 5: Custom Dashboard (Advanced)

### Create a Simple Monitoring Dashboard

Create `src/app/admin/monitoring/page.tsx`:

```typescript
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "@/i18n/routing";

export default async function MonitoringPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect({ href: "/dashboard", locale: "en" });
  }

  const healthRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/health`, {
    cache: "no-store",
  });
  const health = await healthRes.json();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Monitoring</h1>
      
      <div className="grid grid-cols-3 gap-4">
        <StatusCard
          title="Database"
          status={health.checks?.database?.status}
          responseTime={health.checks?.database?.responseTimeMs}
        />
        <StatusCard
          title="Redis"
          status={health.checks?.redis?.status}
          responseTime={health.checks?.redis?.responseTimeMs}
        />
        <StatusCard
          title="Overall"
          status={health.status}
          responseTime={health.responseTimeMs}
        />
      </div>
      
      <pre className="mt-6 p-4 bg-gray-100 rounded overflow-auto">
        {JSON.stringify(health, null, 2)}
      </pre>
    </div>
  );
}

function StatusCard({ title, status, responseTime }: any) {
  const color = status === "connected" || status === "healthy"
    ? "text-green-600 bg-green-50"
    : "text-red-600 bg-red-50";

  return (
    <div className={`p-4 rounded-lg ${color}`}>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-2xl font-bold">{status}</p>
      {responseTime && <p className="text-sm">{responseTime}ms</p>}
    </div>
  );
}
```

---

## Logging Setup

### Vercel Logs

1. Go to your project on Vercel
2. Click **Deployments** → Select deployment
3. Click **Functions** tab
4. View real-time logs

### Structured Logging

Your application now uses structured JSON logging. Example output:
```json
{
  "timestamp": "2026-03-27T12:00:00.000Z",
  "level": "info",
  "message": "Auth: register",
  "userId": "user_123",
  "action": "register",
  "success": true,
  "entityType": "auth"
}
```

### Log Levels
- `debug` — Development only
- `info` — General information
- `warn` — Warnings (rate limits, etc.)
- `error` — Errors requiring attention

### Set Log Level
Add to Vercel environment variables:
```bash
vercel env add LOG_LEVEL
# Enter: info (or debug, warn, error)
```

---

## Alerting Best Practices

### 1. Set Up Multiple Channels
- Primary: Email
- Secondary: Slack/Discord webhook
- Emergency: SMS (for critical alerts)

### 2. Configure Appropriate Thresholds
- **Database down:** Immediate alert
- **Response time > 5s:** Warning
- **3+ consecutive failures:** Critical alert

### 3. Create Runbooks
Document procedures for common issues:
- Database connection issues
- Redis connection issues
- High response times
- Service degradation

---

## Quick Start Checklist

- [ ] Choose monitoring service (Uptime Robot recommended for free tier)
- [ ] Add health check URL to monitor
- [ ] Configure email alerts
- [ ] Test alerts by temporarily breaking something
- [ ] Set up Slack/Discord webhook (optional)
- [ ] Configure LOG_LEVEL environment variable
- [ ] Test health endpoint manually: `curl https://your-app.vercel.app/api/health`

---

## Testing Your Setup

### Manual Test
```bash
curl -s https://your-app.vercel.app/api/health | jq .
```

### Expected Output
```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "connected" },
    "redis": { "status": "connected" }
  }
}
```

### Simulate Failure
To test alerts, temporarily set wrong DATABASE_URL in Vercel and redeploy.

---

## Next Steps

1. **Set up Uptime Robot** (5 minutes)
2. **Configure email alerts**
3. **Test the health endpoint**
4. **Optional: Set up Slack/Discord notifications**