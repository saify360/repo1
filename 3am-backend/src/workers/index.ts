import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { query } from '../utils/database';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

// Queues
export const payoutQueue = new Queue('payouts', { connection });
export const emailQueue = new Queue('emails', { connection });
export const aiQueue = new Queue('ai-tasks', { connection });

// Payout Worker
const payoutWorker = new Worker(
  'payouts',
  async (job) => {
    console.log(`Processing payout: ${job.id}`);
    const { payout_id } = job.data;

    try {
      // Get payout details
      const result = await query(
        'SELECT * FROM payouts WHERE id = $1',
        [payout_id]
      );

      if (result.rows.length === 0) {
        throw new Error('Payout not found');
      }

      const payout = result.rows[0];

      // Update status to processing
      await query(
        'UPDATE payouts SET status = $1 WHERE id = $2',
        ['processing', payout_id]
      );

      // Process with Wise/Airwallex (mock for now)
      console.log(`Processing ${payout.method} payout for $${payout.amount}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mark as completed
      await query(
        'UPDATE payouts SET status = $1, completed_at = NOW() WHERE id = $2',
        ['completed', payout_id]
      );

      // Release reserved balance
      const client = await (await import('../utils/database')).getClient();
      try {
        await client.query('BEGIN');
        
        const ledger = await client.query(
          'SELECT * FROM ledger WHERE user_id = $1 FOR UPDATE',
          [payout.user_id]
        );

        const reserved = parseFloat(ledger.rows[0].reserved_balance);
        
        await client.query(
          'UPDATE ledger SET reserved_balance = $1 WHERE user_id = $2',
          [reserved - parseFloat(payout.amount), payout.user_id]
        );

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

      console.log(`Payout ${payout_id} completed successfully`);
      return { success: true };
    } catch (error: any) {
      console.error(`Payout ${payout_id} failed:`, error);
      
      // Mark as failed
      await query(
        'UPDATE payouts SET status = $1, failure_reason = $2 WHERE id = $3',
        ['failed', error.message, payout_id]
      );

      throw error;
    }
  },
  { connection }
);

// Email Worker
const emailWorker = new Worker(
  'emails',
  async (job) => {
    console.log(`Sending email: ${job.data.type}`);
    const { to, subject, body } = job.data;
    
    // Mock email sending
    console.log(`Email to ${to}: ${subject}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true };
  },
  { connection }
);

// AI Worker
const aiWorker = new Worker(
  'ai-tasks',
  async (job) => {
    console.log(`Processing AI task: ${job.data.task_type}`);
    const { task_type, input } = job.data;

    // Mock AI processing
    let result;
    switch (task_type) {
      case 'suggest_title':
        result = `AI Generated Title for: ${input.substring(0, 50)}`;
        break;
      case 'suggest_cta':
        result = 'Support My Work 💎';
        break;
      case 'score_content':
        result = { quality_score: 8.5, engagement_potential: 'high' };
        break;
      default:
        result = 'Task completed';
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true, result };
  },
  { connection }
);

console.log('Workers started: payouts, emails, ai-tasks');

export { payoutWorker, emailWorker, aiWorker };
