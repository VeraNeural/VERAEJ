import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('📨 Signup request received');
    
    const { name, email, password, tier } = await request.json();
    
    // Validate input
    if (!name || !email || !password || !tier) {
      return NextResponse.json(
        { error: 'Name, email, password, and tier are required' },
        { status: 400 }
      );
    }
    
    // Validate tier
    if (!['explorer', 'regulator', 'integrator'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier selected' },
        { status: 400 }
      );
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'This email is already registered' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Calculate trial end date (7 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);
    
    // Create user with 7-day FREE TRIAL
    const result = await query(
      `INSERT INTO users (name, email, password_hash, subscription_status, subscription_tier, trial_ends_at, created_at) 
       VALUES ($1, $2, $3, 'trial', $4, $5, NOW()) 
       RETURNING id, name, email, subscription_status, subscription_tier, trial_ends_at`,
      [name, email.toLowerCase(), hashedPassword, tier, trialEndsAt]
    );
    
    const user = result.rows[0];
    
    // Generate token and set cookie
    const token = generateToken(user.id, user.email);
    await setAuthCookie(token);
    
    console.log(`✅ User created: ${user.email} - ${tier.toUpperCase()} (7-day trial)`);
    
    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          subscription_status: 'trial',
          subscription_tier: tier,
          trial_ends_at: user.trial_ends_at,
          orientation_completed: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Signup error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create account. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
