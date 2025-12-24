import Stripe from 'stripe';
import { LedgerService } from './ledger.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export class PaymentService {
  // Create payment intent
  static async createPaymentIntent(
    userId: string,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<Stripe.PaymentIntent> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        user_id: userId,
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    return paymentIntent;
  }

  // Handle Stripe webhook
  static async handleWebhook(
    rawBody: Buffer,
    signature: string
  ): Promise<void> {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }

  private static async handlePaymentSuccess(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    const userId = paymentIntent.metadata.user_id;
    const amount = paymentIntent.amount / 100; // Convert from cents

    try {
      await LedgerService.addFunds(userId, amount, paymentIntent.id);
      console.log(`Payment successful: ${paymentIntent.id}, User: ${userId}, Amount: $${amount}`);
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  private static async handlePaymentFailure(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    console.error(`Payment failed: ${paymentIntent.id}`);
    // Implement failure handling (notify user, etc.)
  }

  // Purchase credits
  static async purchaseCredits(
    userId: string,
    amount: number,
    paymentMethodId: string
  ): Promise<string> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method: paymentMethodId,
      metadata: { user_id: userId, type: 'credit_purchase' },
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      }
    });

    return paymentIntent.id;
  }
}
