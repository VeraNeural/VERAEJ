import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user from database
    const userResult = await query(
      'SELECT id, name, email, subscription_tier FROM users WHERE id = $1',
      [payload.userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];
    const tier = user.subscription_tier;

    // Define pricing based on tier
    const priceIds: { [key: string]: { priceId: string; amount: number } } = {
      explorer: {
        priceId: process.env.STRIPE_EXPLORER_PRICE_ID || 'price_explorer',
        amount: 1900, // $19/month
      },
      regulator: {
        priceId: process.env.STRIPE_REGULATOR_PRICE_ID || 'price_regulator',
        amount: 3900, // $39/month
      },
      integrator: {
        priceId: process.env.STRIPE_INTEGRATOR_PRICE_ID || 'price_integrator',
        amount: 9900, // $99/month
      },
    };

    if (!priceIds[tier]) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const { priceId } = priceIds[tier];

    // Create Stripe Checkout Session with 7-day trial
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7, // 7-day FREE trial
        metadata: {
          user_id: user.id,
          tier: tier,
        },
      },
      metadata: {
        user_id: user.id,
        tier: tier,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/orientation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/signup?canceled=true`,
    });

    console.log('✅ Stripe checkout session created:', session.id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('❌ Create checkout error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
