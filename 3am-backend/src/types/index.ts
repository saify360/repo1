export interface User {
  id: string;
  role: 'viewer' | 'creator';
  email: string;
  username: string;
  display_name: string;
  profile_image?: string;
  banner_image?: string;
  bio?: string;
  is_verified: boolean;
  is_suspended: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Ledger {
  id: string;
  user_id: string;
  balance: number;
  reserved_balance: number;
  currency: string;
  last_updated: Date;
  version: number;
}

export interface Transaction {
  id: string;
  from_user_id?: string;
  to_user_id?: string;
  amount: number;
  platform_fee: number;
  charity_fee: number;
  net_amount: number;
  type: 'purchase' | 'subscription' | 'tip' | 'superlike' | 'payout' | 'deposit' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripe_payment_id?: string;
  reference_id?: string;
  reference_type?: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export interface CreateUserDTO {
  email: string;
  username: string;
  display_name: string;
  password: string;
  role?: 'viewer' | 'creator';
}

export interface PurchaseCreditsDTO {
  user_id: string;
  amount: number;
  payment_method_id: string;
}

export interface TipCreatorDTO {
  from_user_id: string;
  to_creator_username: string;
  amount: number;
  content_id?: string;
}

export interface WithdrawalDTO {
  user_id: string;
  amount: number;
  method: 'wise' | 'airwallex';
  destination_details: Record<string, any>;
}

export interface FraudCheckResult {
  is_fraudulent: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  rules_triggered: string[];
  should_block: boolean;
}
