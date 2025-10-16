import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId } = await request.json();
    
    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Missing session ID or user ID' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get subscription details
    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Determine tier based on price
    const priceId = subscription.items.data[0].price.id;
    let tier = 'explorer';
    
    // You'll need to replace these with your actual Stripe price IDs
    const explorerPriceId = process.env.STRIPE_EXPLORER_PRICE_ID;
    const regulatorPriceId = process.env.STRIPE_REGULATOR_PRICE_ID;
    
    if (priceId === regulatorPriceId) {
      tier = 'regulator';
    }

    // Calculate trial end date (7 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    // Update user in database
    await query(
      `UPDATE users 
       SET subscription_status = 'trial',
           subscription_tier = $1,
           trial_ends_at = $2,
           stripe_customer_id = $3,
           stripe_subscription_id = $4
       WHERE id = $5`,
      [tier, trialEndsAt, session.customer, subscriptionId, userId]
    );

    console.log('✅ Subscription activated for user:', userId, 'tier:', tier);

    return NextResponse.json({
      success: true,
      subscription: {
        tier,
        status: 'trial',
        trial_ends_at: trialEndsAt
      }
    });

  } catch (error) {
    console.error('❌ Payment confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
```

**Step 4: Add Your Stripe Secret Key to Vercel**

Go back to Vercel environment variables and add:
```
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
