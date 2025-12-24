# 3AM Backend - Phase 1 MVP

Creator-first monetization platform with internal ledger, fraud prevention, and seamless payments.

## 🏗️ **Architecture**

- **Backend**: Node.js + TypeScript + Express
- **Database**: Postgres (Supabase)
- **Queue**: Redis + BullMQ
- **Payments**: Stripe (in) + Wise/Airwallex (out)
- **Auth**: Supabase Auth

## 📦 **Project Structure**

```
3am-backend/
├── database/
│   └── schema.sql           # Complete Postgres schema
├── src/
│   ├── routes/              # API endpoints
│   │   ├── users.routes.ts
│   │   └── payments.routes.ts
│   ├── services/            # Business logic
│   │   ├── user.service.ts
│   │   ├── ledger.service.ts
│   │   └── payment.service.ts
│   ├── workers/             # Background jobs
│   │   └── index.ts
│   ├── utils/               # Helpers
│   │   └── database.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   └── index.ts             # Server entry
├── package.json
├── tsconfig.json
└── .env.example
```

## 🚀 **Quick Start**

### 1. Setup Database

```bash
# Connect to Supabase/Postgres
psql $DATABASE_URL

# Run schema
\i database/schema.sql
```

### 2. Install Dependencies

```bash
cd 3am-backend
yarn install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Fill in your credentials
```

### 4. Run Development Server

```bash
# Start API
yarn dev

# Start workers (separate terminal)
yarn worker
```

## 🔌 **API Endpoints**

### **Users**
```
POST   /api/users/register           - Create new user
GET    /api/users/:username          - Get user profile
POST   /api/users/:userId/upgrade    - Upgrade to creator
PUT    /api/users/:userId            - Update profile
```

### **Payments & Ledger**
```
POST   /api/payments/intent          - Create payment intent
POST   /api/payments/credits/purchase - Purchase credits (Stripe)
POST   /api/payments/tip             - Tip creator ($1 or $3)
GET    /api/payments/balance/:userId - Get user balance
POST   /api/payments/withdraw        - Request payout
POST   /api/payments/webhook         - Stripe webhook
POST   /api/payments/reconcile       - Reconcile transactions
```

## 💰 **Ledger System**

### **Features**
- ✅ Optimistic locking (version control)
- ✅ Reserved balance for pending payouts
- ✅ Atomic transactions with ACID guarantees
- ✅ 97/3 split (3% platform, 1% charity)
- ✅ Fraud detection (velocity, amount, self-transfer)
- ✅ Full audit trail

### **Fraud Rules**
1. **Large Transaction**: >$500 triggers `medium` severity
2. **High Velocity**: >10 transactions/hour triggers `high` severity
3. **High Volume**: >$1000/hour triggers `high` severity
4. **Self-Transfer**: Blocked immediately (`critical`)
5. **Suspended Account**: Blocked immediately (`critical`)

### **Transaction Flow**

```
User → Stripe → Ledger (deposit)
  ├─ Platform Fee (3%)
  ├─ Charity Fee (1%)
  └─ Net to Creator (97%)

Creator → Wise/Airwallex (payout)
  ├─ Reserve balance
  ├─ Process via worker
  └─ Release on completion
```

## 🔄 **Worker Jobs**

### **Payout Worker**
- Processes withdrawal requests
- Integrates with Wise/Airwallex
- Handles balance reservation/release
- Retries failed payouts

### **Email Worker**
- Sends transactional emails
- Receipt confirmations
- Payout notifications

### **AI Worker**
- Content title suggestions
- CTA text generation
- Content quality scoring

## 📊 **Database Schema Highlights**

### **Ledger Table**
```sql
CREATE TABLE ledger (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE,
  balance DECIMAL(10, 2) CHECK (balance >= 0),
  reserved_balance DECIMAL(10, 2) CHECK (reserved_balance >= 0),
  currency VARCHAR(3) DEFAULT 'USD',
  version INTEGER DEFAULT 1  -- Optimistic locking
);
```

### **Transactions Table**
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  from_user_id UUID,
  to_user_id UUID,
  amount DECIMAL(10, 2),
  platform_fee DECIMAL(10, 2),
  charity_fee DECIMAL(10, 2),
  net_amount DECIMAL(10, 2),
  type VARCHAR(50),  -- tip, superlike, purchase, payout
  status VARCHAR(20), -- pending, completed, failed, refunded
  stripe_payment_id TEXT,
  metadata JSONB
);
```

## 🛡️ **Security Features**

- ✅ Optimistic locking prevents race conditions
- ✅ Database-level constraints (CHECK, UNIQUE)
- ✅ Input validation with Zod
- ✅ Fraud detection with real-time logging
- ✅ Helmet.js security headers
- ✅ CORS configuration

## 📈 **Monitoring**

### **Key Metrics to Track**
- Transaction success rate
- Average payout time
- Fraud detection triggers
- API response times
- Worker queue lengths

### **Logs to Monitor**
- Fraud logs table
- Transaction failures
- Payout processing errors
- Reconciliation discrepancies

## 🚢 **Deployment**

### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd 3am-backend
vercel --prod
```

### **Environment Variables**
Set in Vercel dashboard:
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `REDIS_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `WISE_API_KEY`

### **Workers**
Deploy separately using:
- **Render** (Node.js worker)
- **Railway** (with Redis addon)
- **Heroku** (hobby dyno)

## 🧪 **Testing**

### **Test User Creation**
```bash
curl -X POST http://localhost:4000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@3am.app",
    "username": "creator1",
    "display_name": "Amazing Creator",
    "password": "securepass123",
    "role": "creator"
  }'
```

### **Test Credit Purchase**
```bash
curl -X POST http://localhost:4000/api/payments/credits/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "uuid-here",
    "amount": 50,
    "payment_method_id": "pm_card_visa"
  }'
```

### **Test Tip**
```bash
curl -X POST http://localhost:4000/api/payments/tip \
  -H "Content-Type: application/json" \
  -d '{
    "from_user_id": "viewer-uuid",
    "to_creator_username": "creator1",
    "amount": 1
  }'
```

## ⚠️ **Known Limitations (Phase 1)**

- Wise/Airwallex integration is mocked (needs API keys)
- OpenAI integration is mocked (needs implementation)
- No rate limiting yet
- No Redis clustering
- No database connection pooling tuning

## 📝 **Next Steps (Phase 2)**

- [ ] Implement real Wise/Airwallex integration
- [ ] Add OpenAI content suggestions
- [ ] Add rate limiting with Redis
- [ ] Implement subscription billing
- [ ] Add content management APIs
- [ ] Build admin dashboard APIs

## 🆘 **Support**

For issues or questions:
1. Check logs: `yarn dev` output
2. Check worker logs: `yarn worker` output
3. Verify database schema is applied
4. Confirm environment variables are set

---

**Built for 3AM Phase 1 MVP** 🌙
