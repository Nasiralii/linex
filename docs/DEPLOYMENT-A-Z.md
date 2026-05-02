# Linex (Rasi) — deployment A to Z

End-to-end checklist for running this Next.js app on **AWS** (example: **EC2 + RDS PostgreSQL + S3**) in **Frankfurt (`eu-central-1`)**, with **SSH**, **PM2**, and **GitHub**.

Use placeholders like `YOUR_IP`, `YOUR_BUCKET`, `YOUR_RDS_ENDPOINT` — never paste real passwords into docs or commits.

---

## A. What you need before starting

- **AWS account** with billing enabled (RDS/S3/EC2 may incur cost).
- **GitHub** access to your repo (e.g. `Nasiralii/linex`).
- **SSH key pair** for EC2 (`.pem` file). Store it outside Desktop if macOS blocks reads (e.g. `~/.ssh/aws.pem`).
- **Local tools:** `git`, `ssh`, optional `scp`.

---

## B. Log in to AWS

1. Open **[AWS Console](https://console.aws.amazon.com)**.
2. Sign in (root or IAM user).
3. Top-right: set region to **Europe (Frankfurt)** — **`eu-central-1`** — for EC2/RDS/S3 used here.

---

## C. Create or choose a VPC and networking (often default)

- Many tutorials use the **default VPC** in `eu-central-1`.
- EC2 and RDS must live in **compatible subnets** (same region; RDS subnet group).

---

## D. RDS PostgreSQL (database)

1. **RDS → Create database**
   - Engine: **PostgreSQL**
   - Template: **Free tier** or **Production** as needed
   - Instance: e.g. **`db.t4g.micro`** (example from this project)
   - Storage: default or as needed
   - **Connectivity:** same VPC as EC2; note **endpoint** (e.g. `database-1.xxxxx.eu-central-1.rds.amazonaws.com`)
   - Master username/password: save securely (password will go in `DATABASE_URL`)

2. **Security group for RDS**
   - Inbound **PostgreSQL (5432)** from:
     - **EC2 instance security group** (recommended), or
     - Your office IP for admin tools only.

3. **SSL**
   - RDS often uses TLS. For strict verification you can use AWS’s **RDS CA bundle** and query params like `sslmode=verify-full&sslrootcert=/path/to/rds-global-bundle.pem`.
   - Simpler (less strict): `sslmode=require` (depends on your security policy).

---

## E. EC2 instance (app server)

1. **EC2 → Launch instance**
   - **AMI:** Ubuntu Server (e.g. 22.04/24.04)
   - **Instance type:** e.g. **`t3.small`** or larger if builds OOM; **`t3.micro`** works but **Next.js build may need swap** (see section L).
   - **Key pair:** your `.pem` file — download once and `chmod 400 ~/.ssh/your-key.pem`
   - **Network:** same VPC as RDS; **auto-assign public IP** if you access via internet
   - **Security group (example):**
     - **SSH (22)** from **your IP** (not `0.0.0.0/0` long-term)
     - **HTTP (80)** from **0.0.0.0/0** if nginx terminates HTTP in front of the app
     - **Custom TCP 3000** only if you expose the app port directly (often restricted to your IP for debugging)

2. **Elastic IP (optional)**  
   Attach an **Elastic IP** so the public IP does not change after stop/start.

---

## F. S3 bucket (file uploads)

1. **S3 → Create bucket**
   - Region: **`eu-central-1`**
   - Name: **globally unique** (e.g. `linex-uploads-<AWS_ACCOUNT_ID>-eu-central-1`). Plain names like `rasi-bucket` often fail — **already taken globally**.
   - **Block Public Access:** can stay **On** if you only serve via signed URLs or CloudFront; your project’s setup script may configure **public read** for objects — review security for production.

2. **IAM role for EC2 (recommended — no access keys in `.env`)**
   - **IAM → Roles → Create role**
   - Trusted entity: **EC2**
   - Policy: allow **`s3:PutObject`**, **`GetObject`**, **`DeleteObject`**, **`ListBucket`** on **your bucket ARN** and **`bucket/*`**
   - **EC2 → Instance → Actions → Security → Modify IAM role** → attach that role.

3. **App env (later on server)**  
   - `AWS_REGION=eu-central-1`  
   - `AWS_S3_BUCKET=<exact bucket name>`

---

## G. Install tooling on EC2 (once)

SSH in (see section H), then typical setup:

```bash
sudo apt update && sudo apt install -y git curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

(Node major version should match what you use locally if possible.)

---

## H. SSH from your Mac

```bash
chmod 400 ~/.ssh/aws.pem
ssh -i ~/.ssh/aws.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

- User is often **`ubuntu`** on Ubuntu AMIs.
- **`pm2` runs on the server**, not on your Mac — deploy commands are always **after** SSH (unless you use CI).

---

## I. Clone the app on the server

```bash
cd ~
git clone https://github.com/YOUR_ORG/linex.git linex
cd linex
```

Use SSH URL or HTTPS with a token if the repo is private.

---

## J. Environment file (`~/linex/.env`)

On the server:

```bash
nano ~/linex/.env
```

Minimum examples (adjust values):

```env
NEXT_PUBLIC_APP_URL="http://YOUR_EC2_PUBLIC_IP"
AUTH_SECRET="<generate with: openssl rand -base64 32>"

AWS_REGION="eu-central-1"
AWS_S3_BUCKET="your-unique-bucket-name"

DATABASE_URL="postgresql://USER:PASSWORD@RDS_ENDPOINT:5432/postgres?sslmode=require"
DATABASE_URL_DIRECT="postgresql://USER:PASSWORD@RDS_ENDPOINT:5432/postgres?sslmode=require"
```

- URL-encode special characters in the password (`@` → `%40`).
- **`DATABASE_URL_DIRECT`** is used by Prisma migrations (see `prisma.config.ts`).

Never commit `.env`. Keep `.env` only on the server and in your local copy (gitignored).

---

## K. Database migrations and seed

On EC2, from `~/linex`:

```bash
cd ~/linex
npm install
npx prisma migrate deploy
npm run db:seed
```

**Seed** creates an admin user (see `prisma/seed.ts` — email/password printed in console). **Change the password after first login.**

If TLS errors occur against RDS, align `sslmode` / CA path with your RDS setup.

---

## L. Memory: swap (small instances)

If `npm install`, `npm ci`, or `next build` dies with **Killed** / exit **137**, add swap (example **2 GB**):

```bash
sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

---

## M. Build and run with PM2

Production:

```bash
cd ~/linex
export NEXT_DISABLE_TURBOPACK=1
export NODE_OPTIONS="--max-old-space-size=3072"
npm install
npm run build
pm2 start npm --name linex -- start
pm2 save
pm2 startup   # follow printed instructions so PM2 survives reboot
```

Check:

```bash
curl -s http://127.0.0.1:3000/api/health
```

Restart after `.env` changes:

```bash
cd ~/linex && pm2 restart linex --update-env
```

Logs:

```bash
pm2 logs linex --lines 50
```

---

## N. Optional: nginx reverse proxy (port 80 → 3000)

Example idea (not full config): listen on **80**, `proxy_pass http://127.0.0.1:3000;`.  
HTTPS later: **ACM + ALB** or **Certbot** on a real domain.

---

## O. S3 uploads from the app (important details)

- EC2 must have an **IAM role** attached **or** valid **AWS_ACCESS_KEY_ID** / **AWS_SECRET_ACCESS_KEY** in `.env` (role preferred).
- Region + bucket name in `.env` must match the real bucket.
- This codebase uses an explicit AWS credential chain for S3 so **Next.js on EC2** can use **instance credentials** — deploy the latest `main` from GitHub after pulling.

---

## P. Automated deploy script (this repo)

After `git pull` on the server:

```bash
cd ~/linex
bash infra/deploy-ec2.sh
```

Script lives at **`infra/deploy-ec2.sh`** — it pulls `main`, reinstalls, builds with **`NEXT_DISABLE_TURBOPACK`**, restarts PM2.

---

## Q. Git push from your Mac (developers)

```bash
cd /path/to/linex
git add ...
git commit -m "..."
git push origin main
```

Then on EC2: `git pull` and deploy (section P or M).

---

## R. Admin / “full access” admin

- **Role** in DB: **`ADMIN`** (`UserRole` in Prisma).
- **Full-access admin** (some routes): email must appear in **`src/lib/admin-config.ts`** (`FULL_ACCESS_ADMIN_EMAILS`).
- Default seeded admin (if seed ran): **`admin@linexforsa.com`** — password from seed output / `prisma/seed.ts`. **Rotate after login.**

---

## S. Health check

```bash
curl -s http://YOUR_PUBLIC_IP/api/health
```

Expect JSON with **`status`** and service checks (database, storage, etc.).

---

## T. Troubleshooting quick map

| Symptom | Things to check |
|--------|------------------|
| SSH fails | Security group **22**, correct **IP**, correct **key** path |
| DB connection errors | RDS SG allows **EC2 SG** on **5432**, correct **endpoint**, password **URL-encoded** |
| `npm ci` / build **Killed** | **Add swap** (L), use **`npm install`**, reduce parallelism |
| **Bus error** / broken Next | Clean **`rm -rf node_modules .next`**, rebuild with **`NEXT_DISABLE_TURBOPACK=1`** |
| S3 **credentials** errors | **IAM role** on EC2, **`AWS_REGION`** / **`AWS_S3_BUCKET`**, latest code with S3 client fix |
| Admin login fails | **Seed** ran on **same** DB, **`AUTH_SECRET`** stable, cookie **`Secure`** vs **HTTP** (`NEXT_PUBLIC_APP_URL`) |

---

## U. Security checklist (production)

- Rotate **RDS password**, **AUTH_SECRET**, default **admin password**.
- Restrict **SSH** to known IPs.
- Prefer **HTTPS** + correct cookie settings for production domains.
- Do **not** commit **`.env`**, **`.pem`**, or backups with secrets.
- Review **S3** public access and bucket policy.

---

## V. Summary one-liner deploy (experienced)

On EC2 after code is on disk and `.env` exists:

```bash
cd ~/linex && git pull && bash infra/deploy-ec2.sh
```

---

*This doc describes patterns used in this project’s deployment; adjust names, regions, and instance sizes to your AWS account and policies.*
