import { Ledger, Transaction, FraudCheckResult } from '../types';
import { query, getClient } from '../utils/database';

const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT || '3');
const CHARITY_FEE_PERCENT = parseFloat(process.env.CHARITY_FEE_PERCENT || '1');

export class LedgerService {
  // Get user balance
  static async getBalance(userId: string): Promise<Ledger | null> {
    const result = await query(
      'SELECT * FROM ledger WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  // Create ledger for new user
  static async createLedger(userId: string): Promise<Ledger> {
    const result = await query(
      'INSERT INTO ledger (user_id, balance, currency) VALUES ($1, 0, $2) RETURNING *',
      [userId, 'USD']
    );
    return result.rows[0];
  }

  // Add funds (deposit from Stripe)
  static async addFunds(
    userId: string,
    amount: number,
    stripePaymentId: string
  ): Promise<Transaction> {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Get current ledger with lock
      const ledgerResult = await client.query(
        'SELECT * FROM ledger WHERE user_id = $1 FOR UPDATE',
        [userId]
      );

      if (ledgerResult.rows.length === 0) {
        throw new Error('Ledger not found');
      }

      const ledger = ledgerResult.rows[0];
      const newBalance = parseFloat(ledger.balance) + amount;

      // Update balance
      await client.query(
        'UPDATE ledger SET balance = $1, last_updated = NOW() WHERE user_id = $2 AND version = $3',
        [newBalance, userId, ledger.version]
      );

      // Create transaction record
      const txResult = await client.query(
        `INSERT INTO transactions 
        (to_user_id, amount, platform_fee, charity_fee, net_amount, type, status, stripe_payment_id) 
        VALUES ($1, $2, 0, 0, $2, 'deposit', 'completed', $3) 
        RETURNING *`,
        [userId, amount, stripePaymentId]
      );

      await client.query('COMMIT');
      return txResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Transfer funds (tips, purchases)
  static async transfer(
    fromUserId: string,
    toUserId: string,
    amount: number,
    type: Transaction['type'],
    referenceId?: string,
    referenceType?: string
  ): Promise<Transaction> {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Fraud check
      const fraudCheck = await this.checkFraud(fromUserId, toUserId, amount, type);
      if (fraudCheck.should_block) {
        throw new Error(`Transaction blocked: ${fraudCheck.rules_triggered.join(', ')}`);
      }

      // Calculate fees
      const platformFee = (amount * PLATFORM_FEE_PERCENT) / 100;
      const charityFee = (amount * CHARITY_FEE_PERCENT) / 100;
      const netAmount = amount - platformFee;

      // Lock both ledgers
      const fromLedger = await client.query(
        'SELECT * FROM ledger WHERE user_id = $1 FOR UPDATE',
        [fromUserId]
      );

      const toLedger = await client.query(
        'SELECT * FROM ledger WHERE user_id = $1 FOR UPDATE',
        [toUserId]
      );

      if (fromLedger.rows.length === 0 || toLedger.rows.length === 0) {
        throw new Error('Ledger not found');
      }

      const fromBalance = parseFloat(fromLedger.rows[0].balance);
      const toBalance = parseFloat(toLedger.rows[0].balance);

      // Check sufficient balance
      if (fromBalance < amount) {
        throw new Error('Insufficient balance');
      }

      // Update balances
      await client.query(
        'UPDATE ledger SET balance = $1 WHERE user_id = $2 AND version = $3',
        [fromBalance - amount, fromUserId, fromLedger.rows[0].version]
      );

      await client.query(
        'UPDATE ledger SET balance = $1 WHERE user_id = $2 AND version = $3',
        [toBalance + netAmount, toUserId, toLedger.rows[0].version]
      );

      // Create transaction
      const txResult = await client.query(
        `INSERT INTO transactions 
        (from_user_id, to_user_id, amount, platform_fee, charity_fee, net_amount, type, status, reference_id, reference_type) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed', $8, $9) 
        RETURNING *`,
        [fromUserId, toUserId, amount, platformFee, charityFee, netAmount, type, referenceId, referenceType]
      );

      await client.query('COMMIT');
      return txResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Request withdrawal
  static async requestWithdrawal(
    userId: string,
    amount: number,
    method: string,
    destinationDetails: Record<string, any>
  ): Promise<string> {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Lock ledger
      const ledger = await client.query(
        'SELECT * FROM ledger WHERE user_id = $1 FOR UPDATE',
        [userId]
      );

      if (ledger.rows.length === 0) {
        throw new Error('Ledger not found');
      }

      const balance = parseFloat(ledger.rows[0].balance);
      const reserved = parseFloat(ledger.rows[0].reserved_balance);

      if (balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Reserve balance
      await client.query(
        'UPDATE ledger SET balance = $1, reserved_balance = $2 WHERE user_id = $3',
        [balance - amount, reserved + amount, userId]
      );

      // Create payout request
      const payoutResult = await client.query(
        `INSERT INTO payouts (user_id, amount, method, destination_details, status) 
        VALUES ($1, $2, $3, $4, 'pending') RETURNING id`,
        [userId, amount, method, JSON.stringify(destinationDetails)]
      );

      await client.query('COMMIT');
      return payoutResult.rows[0].id;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Fraud detection
  static async checkFraud(
    fromUserId: string,
    toUserId: string,
    amount: number,
    type: string
  ): Promise<FraudCheckResult> {
    const rulesTriggered: string[] = [];
    let severity: FraudCheckResult['severity'] = 'low';

    // Rule 1: Large single transaction (>$500)
    if (amount > 500) {
      rulesTriggered.push('large_transaction');
      severity = 'medium';
    }

    // Rule 2: Check transaction velocity
    const recentTxs = await query(
      `SELECT COUNT(*) as count, SUM(amount) as total 
       FROM transactions 
       WHERE from_user_id = $1 
       AND created_at > NOW() - INTERVAL '1 hour'`,
      [fromUserId]
    );

    const hourlyCount = parseInt(recentTxs.rows[0].count);
    const hourlyTotal = parseFloat(recentTxs.rows[0].total || 0);

    if (hourlyCount > 10) {
      rulesTriggered.push('high_velocity');
      severity = 'high';
    }

    if (hourlyTotal > 1000) {
      rulesTriggered.push('high_volume');
      severity = 'high';
    }

    // Rule 3: Self-transfer
    if (fromUserId === toUserId) {
      rulesTriggered.push('self_transfer');
      severity = 'critical';
    }

    // Rule 4: Check if accounts are suspended
    const userCheck = await query(
      'SELECT is_suspended FROM users WHERE id IN ($1, $2)',
      [fromUserId, toUserId]
    );

    if (userCheck.rows.some(u => u.is_suspended)) {
      rulesTriggered.push('suspended_account');
      severity = 'critical';
    }

    const shouldBlock = severity === 'critical';

    // Log fraud check
    if (rulesTriggered.length > 0) {
      await query(
        `INSERT INTO fraud_logs (user_id, rule_triggered, severity, details) 
         VALUES ($1, $2, $3, $4)`,
        [
          fromUserId,
          rulesTriggered.join(','),
          severity,
          JSON.stringify({ to_user: toUserId, amount, type })
        ]
      );
    }

    return {
      is_fraudulent: rulesTriggered.length > 0,
      severity,
      rules_triggered: rulesTriggered,
      should_block: shouldBlock
    };
  }

  // Reconcile payments (verify Stripe matches ledger)
  static async reconcilePayments(startDate: Date, endDate: Date): Promise<{
    matched: number;
    mismatched: number;
    discrepancies: any[];
  }> {
    const transactions = await query(
      `SELECT * FROM transactions 
       WHERE type = 'deposit' 
       AND created_at BETWEEN $1 AND $2 
       AND stripe_payment_id IS NOT NULL`,
      [startDate, endDate]
    );

    let matched = 0;
    let mismatched = 0;
    const discrepancies = [];

    // In production, verify each transaction against Stripe
    // For now, just count
    matched = transactions.rows.length;

    return { matched, mismatched, discrepancies };
  }
}
