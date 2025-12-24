-- 3AM Phase 1 Database Schema
-- Postgres/Supabase with fraud prevention and audit trails

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with username field
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(20) NOT NULL CHECK (role IN ('viewer', 'creator')) DEFAULT 'viewer',
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  profile_image TEXT,
  banner_image TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (creator customization)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  theme_color VARCHAR(7) DEFAULT '#5a67d8',
  background_style VARCHAR(50) DEFAULT 'gradient',
  layout_type VARCHAR(20) DEFAULT 'feed-first' CHECK (layout_type IN ('feed-first', 'store-first')),
  social_links JSONB DEFAULT '{}',
  custom_buttons JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content table
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('post', 'video', 'image')),
  title VARCHAR(200),
  description TEXT,
  preview_url TEXT NOT NULL,
  full_content_url TEXT,
  embed_url TEXT,
  is_gated BOOLEAN DEFAULT FALSE,
  gate_type VARCHAR(20) CHECK (gate_type IN ('subscribe', 'paid', 'free')),
  price DECIMAL(10, 2),
  duration_seconds INTEGER,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores table
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'digital',
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  delivery_url TEXT,
  stock_unlimited BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  monthly_price DECIMAL(10, 2) NOT NULL CHECK (monthly_price >= 0),
  benefits JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  next_billing_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(subscriber_id, creator_id)
);

-- Ledger table with fraud prevention
CREATE TABLE ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  balance DECIMAL(10, 2) DEFAULT 0.00 CHECK (balance >= 0),
  reserved_balance DECIMAL(10, 2) DEFAULT 0.00 CHECK (reserved_balance >= 0),
  currency VARCHAR(3) DEFAULT 'USD',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

-- Transactions table with full audit trail
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  platform_fee DECIMAL(10, 2) DEFAULT 0.00,
  charity_fee DECIMAL(10, 2) DEFAULT 0.00,
  net_amount DECIMAL(10, 2) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('purchase', 'subscription', 'tip', 'superlike', 'payout', 'deposit', 'refund')),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_id TEXT,
  reference_id UUID,
  reference_type VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchases table
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  subscription_id UUID REFERENCES subscriptions(id),
  content_id UUID REFERENCES content(id),
  amount DECIMAL(10, 2) NOT NULL,
  transaction_id UUID REFERENCES transactions(id),
  access_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE UNIQUE,
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  watch_time_seconds INTEGER DEFAULT 0,
  unlocks INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  revenue_generated DECIMAL(10, 2) DEFAULT 0.00,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion Sessions
CREATE TABLE discussion_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(200),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  ai_summary TEXT,
  participant_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payouts table
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  method VARCHAR(50) NOT NULL,
  destination_details JSONB,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  wise_transfer_id TEXT,
  failure_reason TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fraud detection logs
CREATE TABLE fraud_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  transaction_id UUID REFERENCES transactions(id),
  rule_triggered VARCHAR(100),
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_content_creator ON content(creator_id);
CREATE INDEX idx_content_created ON content(created_at DESC);
CREATE INDEX idx_content_published ON content(is_published, created_at DESC);
CREATE INDEX idx_transactions_user_to ON transactions(to_user_id);
CREATE INDEX idx_transactions_user_from ON transactions(from_user_id);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_analytics_content ON analytics(content_id);
CREATE INDEX idx_user_subscriptions ON user_subscriptions(subscriber_id, creator_id);
CREATE INDEX idx_payouts_user ON payouts(user_id);
CREATE INDEX idx_payouts_status ON payouts(status);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ledger optimistic locking trigger
CREATE OR REPLACE FUNCTION increment_ledger_version()
RETURNS TRIGGER AS $$
BEGIN
   NEW.version = OLD.version + 1;
   NEW.last_updated = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER ledger_version_trigger BEFORE UPDATE ON ledger
    FOR EACH ROW EXECUTE FUNCTION increment_ledger_version();
