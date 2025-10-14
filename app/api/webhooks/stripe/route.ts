import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const event = JSON.parse(body);

    console.log('📨 Stripe webhook received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('❌ Stripe webhook error:', error);
    return NextResponse.json({ 
      error: 'Webhook handler failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
}

// Handle successful checkout
async function handleCheckoutCompleted(session: any) {
  const customerEmail = session.customer_email || session.customer_details?.email;
  const stripeCustomerId = session.customer;
  const stripeSubscriptionId = session.subscription;

  if (!customerEmail) {
    console.error('No email in checkout session');
    return;
  }

  try {
    // Update user to Explorer tier
    await query(
      `UPDATE users 
       SET 
         subscription_status = 'active',
         subscription_tier = 'explorer',
         stripe_customer_id = $1,
         stripe_subscription_id = $2,
         subscription_started_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
       WHERE email = $3`,
      [stripeCustomerId, stripeSubscriptionId, customerEmail]
    );

    // Mark lead as converted
    await query(
      `UPDATE leads 
       SET converted_to_user = TRUE 
       WHERE email = $1`,
      [customerEmail]
    );

    console.log('✅ User upgraded to Explorer:', customerEmail);

  } catch (error) {
    console.error('Failed to upgrade user:', error);
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription: any) {
  const stripeSubscriptionId = subscription.id;
  const status = subscription.status; // active, canceled, etc.

  try {
    await query(
      `UPDATE users 
       SET 
         subscription_status = $1,
         updated_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = $2`,
      [status, stripeSubscriptionId]
    );

    console.log('✅ Subscription updated:', stripeSubscriptionId, status);

  } catch (error) {
    console.error('Failed to update subscription:', error);
  }
}

// Handle subscription deleted/canceled
async function handleSubscriptionDeleted(subscription: any) {
  const stripeSubscriptionId = subscription.id;

  try {
    await query(
      `UPDATE users 
       SET 
         subscription_status = 'cancelled',
         subscription_tier = 'free',
         subscription_ends_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = $1`,
      [stripeSubscriptionId]
    );

    console.log('✅ Subscription cancelled:', stripeSubscriptionId);

  } catch (error) {
    console.error('Failed to cancel subscription:', error);
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice: any) {
  const stripeSubscriptionId = invoice.subscription;

  try {
    await query(
      `UPDATE users 
       SET 
         subscription_status = 'active',
         updated_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = $1`,
      [stripeSubscriptionId]
    );

    console.log('✅ Payment succeeded:', stripeSubscriptionId);

  } catch (error) {
    console.error('Failed to update payment status:', error);
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice: any) {
  const stripeSubscriptionId = invoice.subscription;

  try {
    await query(
      `UPDATE users 
       SET 
         subscription_status = 'past_due',
         updated_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = $1`,
      [stripeSubscriptionId]
    );

    console.log('⚠️ Payment failed:', stripeSubscriptionId);

  } catch (error) {
    console.error('Failed to update payment failure:', error);
  }
}
