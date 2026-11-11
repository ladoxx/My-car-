# FMKAL VEHICLE CONTACT SYSTEM (기아 레이 차량 연락 시스템)

Production-ready, mobile-first vehicle contact website and administration dashboard built for a **Kia Ray (기아 레이)** vehicle in South Korea, accessible via physical QR code decal/card on the vehicle dashboard.

---

## 🌟 Key Features

1. **Premium Automotive Visual Aesthetic**:
   - Dark cinematic aesthetic (`#08090C`, deep obsidian with glassmorphism).
   - High-fidelity **Kia Ray** compact vehicle SVG visual with glowing LED headlights, signature Korean license plate (`KIA RAY`), and neon green underglow (`#A3F542`).
   - Pulsing live availability indicator (`연락 가능 · 통화 및 메시지 환영` / `부재중` / `이동 주차 가능`).
   - Native Korean typography (Pretendard).
   - Touch-optimized for Samsung Galaxy, iPhone, Safari, and Chrome mobile browsers.

2. **One-Tap Korean Contact Channels**:
   - **WhatsApp (`#25D366`)**: Direct link using `wa.me/<number>?text=...` with predefined Korean message:
     `안녕하세요. 차량 관련하여 연락드립니다.` (configurable).
   - **KakaoTalk (`#FEE500`)**: Direct link to KakaoTalk Open Chat / Channel. Safely hides or informs visitors if not configured.
   - **Phone Call**: Native dialer trigger (`tel:`) with formatted phone display and one-tap number copying.

3. **Secure Admin Dashboard (`/admin`)**:
   - Bilingual admin interface (**English** / **Turkish** toggle).
   - Rate-limited login protection against brute-force attacks (max 5 failed attempts per 15 min).
   - Bcrypt password hashing + HTTP-only secure JWT cookies.
   - Live contact settings: phone, WhatsApp number & message, KakaoTalk URL, status toggle.
   - Korean public copy editor (headline, greetings, instructions, footer note).
   - Live analytics: Total visits, QR scans (`?src=qr`), contact button clicks, 14-day activity chart, conversion rates.
   - QR Code Studio: Download High-Res PNG (1024px/2048px), Scalable SVG with Level H Error Correction, and one-click Printable Dashboard Card.

4. **Permanent QR Code Architecture**:
   - Permanent entry point: `https://YOUR_DOMAIN/car?src=qr`.
   - Contact numbers and messages can be updated anytime in `/admin` without changing or re-printing the QR decal.

5. **Self-Hosted & Cloudflare Tunnel Friendly**:
   - Multi-stage Docker build with minimal footprint.
   - Zero inbound ports required; connects seamlessly behind Cloudflare Tunnel.
   - Persistent volume database (SQLite with Prisma ORM and LibSQL adapter).
   - Automated health check endpoint: `/api/health`.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20+ or 22+
- npm 10+

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

*Initial default admin credentials:*
- **Username**: `admin`
- **Password**: `admin1234!`

### 3. Start Development Server
```bash
npm run dev
```

Visit:
- Public Korean Vehicle Contact Page: [http://localhost:1234/car](http://localhost:1234/car)
- Admin Portal: [http://localhost:1234/admin](http://localhost:1234/admin)
- Health Check: [http://localhost:1234/api/health](http://localhost:1234/api/health)

---

## 🐳 Production Deployment (Docker & Cloudflare Tunnel)

### 1. Configure Environment
Create `.env` based on `.env.example`:
```bash
cp .env.example .env
```
Generate a random secret for JWT:
```bash
openssl rand -base64 32
```
Update `JWT_SECRET` and your desired `ADMIN_PASSWORD` in `.env`.

### 2. Deploy with Docker Compose
```bash
docker compose up -d --build
```

The container automatically:
- Applies database migrations and seeds initial credentials if not already present.
- Mounts persistent storage into `fmkal-data` volume at `/app/data/prod.db`.
- Performs internal health checks every 30 seconds.

### 3. Connect to Cloudflare Tunnel (Zero Open Inbound Ports)
In your Cloudflare Zero Trust Dashboard:
1. Go to **Networks** → **Tunnels**.
2. Add a Public Hostname:
   - **Subdomain / Domain**: `car.fmkal.com`
   - **Path**: Leave blank or `/`
   - **Service Type**: `HTTP`
   - **URL**: `localhost:1234` (or `fmkal-vehicle-contact:1234` on the same Docker network)
3. Save. The website is now live globally over Cloudflare's edge network without opening any firewall ports!

---

## 🧪 Automated Testing

Run the full end-to-end automated verification suite:
```bash
npx tsx scripts/test-e2e.ts
```

This tests:
- `/api/health` status
- Public page layout & Korean copy
- Anonymous analytics event tracking
- Admin brute-force rate limiting & auth rejection
- Valid JWT admin login & session verification
- Contact details update API
- High-res PNG & SVG QR generation with error correction
- Admin logout

---

## 💾 Backup & Restore

### Database Backup
The database is stored in the Docker volume `fmkal-data` as `/app/data/prod.db`:
```bash
docker compose exec fmkal-vehicle-contact cp /app/data/prod.db /app/data/backup_$(date +%Y%m%d_%H%M%S).db
```
Or copy it to your host machine:
```bash
docker cp fmkal-vehicle-contact:/app/data/prod.db ./backup.db
```

### Database Restore
```bash
docker compose down
docker cp ./backup.db fmkal-vehicle-contact:/app/data/prod.db
docker compose up -d
```

---

## 🔒 Security Summary

- **Authentication**: Bcrypt-hashed credentials with 10 salt rounds.
- **Session Management**: Cryptographically signed JWT stored in secure HTTP-only cookies (`SameSite: Lax`).
- **Brute-Force Protection**: Server-side rate limiter blocks IPs after 5 failed login attempts for 15 minutes.
- **Privacy & GDPR**: Public contact page collects zero visitor PII (personal identifiable information). Analytics only tracks anonymous counts and device category (iOS / Android / Desktop).
- **HTTP Security Headers**: Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy configured in `next.config.ts`.
