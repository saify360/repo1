import express, { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { LedgerService } from '../services/ledger.service';
import { z } from 'zod';

const router = express.Router();

const PurchaseCreditsSchema = z.object({
  user_id: z.string().uuid(),
  amount: z.number().positive().min(1).max(10000),
  payment_method_id: z.string()
});

const TipCreatorSchema = z.object({
  from_user_id: z.string().uuid(),
  to_creator_username: z.string(),
  amount: z.number().positive(),
  content_id: z.string().uuid().optional()
});

const WithdrawalSchema = z.object({
  user_id: z.string().uuid(),
  amount: z.number().positive().min(10),
  method: z.enum(['wise', 'airwallex']),
  destination_details: z.record(z.any())
});

// Create payment intent
router.post('/intent', async (req: Request, res: Response) => {
  try {
    const { user_id, amount } = req.body;
    const paymentIntent = await PaymentService.createPaymentIntent(user_id, amount);
    res.json({ success: true, client_secret: paymentIntent.client_secret });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Purchase credits
router.post('/credits/purchase', async (req: Request, res: Response) => {
  try {
    const data = PurchaseCreditsSchema.parse(req.body);
    const paymentIntentId = await PaymentService.purchaseCredits(
      data.user_id,
      data.amount,
      data.payment_method_id
    );
    res.json({ success: true, payment_intent_id: paymentIntentId });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Tip creator
router.post('/tip', async (req: Request, res: Response) => {
  try {
    const data = TipCreatorSchema.parse(req.body);
    
    // Get creator user ID from username
    const result = await (await import('../utils/database')).query(
      'SELECT id FROM users WHERE username = $1',
      [data.to_creator_username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Creator not found' });
    }

    const toUserId = result.rows[0].id;
    const transaction = await LedgerService.transfer(
      data.from_user_id,
      toUserId,
      data.amount,
      data.amount === 3 ? 'superlike' : 'tip',
      data.content_id,
      'content'
    );

    res.json({ success: true, transaction });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get balance
router.get('/balance/:userId', async (req: Request, res: Response) => {
  try {
    const ledger = await LedgerService.getBalance(req.params.userId);
    res.json({ success: true, ledger });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Request withdrawal
router.post('/withdraw', async (req: Request, res: Response) => {
  try {
    const data = WithdrawalSchema.parse(req.body);
    const payoutId = await LedgerService.requestWithdrawal(
      data.user_id,
      data.amount,
      data.method,
      data.destination_details
    );
    res.json({ success: true, payout_id: payoutId });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    await PaymentService.handleWebhook(req.body, signature);
    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Reconcile payments
router.post('/reconcile', async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.body;
    const result = await LedgerService.reconcilePayments(
      new Date(start_date),
      new Date(end_date)
    );
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
