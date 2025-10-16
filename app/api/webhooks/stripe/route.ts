import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('⚠️ Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('✅ Stripe webhook received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Get customer email
        const customerEmail = session.customer_email || session.customer_details?.email;
        
        if (!customerEmail) {
          console.error('❌ No customer email in session');
          break;
        }

        // Determine tier from metadata or amount
        let tier = 'explorer';
        
        // Check metadata first
        if (session.metadata?.tier) {
          tier = session.metadata.tier;
        } else {
          // Fallback: determine by amount
          const amount = session.amount_total;
          if (amount === 3900) { // $39
            tier = 'regulator';
          } else if (amount === 9900) { // $99
            tier = 'integrator';
          }
        }

        // Update user in database
        await query(
          `UPDATE users 
           SET subscription_tier = $1,
               subscription_status = 'active',
               stripe_customer_id = $2
           WHERE email = $3`,
          [tier, session.customer, customerEmail]
        );

        console.log('✅ User upgraded:', customerEmail, 'to', tier);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        await query(
          `UPDATE users 
           SET subscription_status = $1
           WHERE stripe_customer_id = $2`,
          [subscription.status, subscription.customer]
        );
        
        console.log('✅ Subscription updated:', subscription.customer);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        await query(
          `UPDATE users 
           SET subscription_tier = 'free',
               subscription_status = 'canceled'
           WHERE stripe_customer_id = $1`,
          [subscription.customer]
        );
        
        console.log('✅ Subscription canceled:', subscription.customer);
        break;
      }

      default:
        console.log('ℹ️ Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    );
  }
}
