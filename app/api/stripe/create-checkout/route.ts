import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    console.log('📨 Create checkout request received');

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

    console.log('👤 User:', user.email, '- Tier:', tier);

    // Block Integrator
    if (tier === 'integrator') {
      return NextResponse.json(
        { error: 'Integrator tier is not available yet. Please choose Explorer or Regulator.' },
        { status: 400 }
      );
    }

    // Define pricing based on tier
    const priceIds: { [key: string]: string } = {
      explorer: process.env.STRIPE_EXPLORER_PRICE_ID!,
      regulator: process.env.STRIPE_REGULATOR_PRICE_ID!,
    };

    if (!priceIds[tier]) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const priceId = priceIds[tier];

    console.log('💳 Creating Stripe checkout for:', tier, '- Price ID:', priceId);

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
