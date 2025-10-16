import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId } = await request.json();
    
    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Missing session ID or user ID' },
        { status: 400 }
      );
    }

    // For now, just activate the trial without verifying with Stripe
    // You can add Stripe verification later via webhooks
    
    // Calculate trial end date (7 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    // Default to explorer tier (can be enhanced later)
    const tier = 'explorer';

    // Update user in database
    await query(
      `UPDATE users 
       SET subscription_status = 'trial',
           subscription_tier = $1,
           trial_ends_at = $2
       WHERE id = $3`,
      [tier, trialEndsAt, userId]
    );

    console.log('✅ Trial activated for user:', userId);

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
