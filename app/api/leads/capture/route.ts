import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, source, utm_source, utm_medium, utm_campaign, referrer } = await request.json();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Save lead (ignore if email already exists)
    await query(
      `INSERT INTO leads (email, source, utm_source, utm_medium, utm_campaign, referrer)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [email, source || 'landing_page', utm_source, utm_medium, utm_campaign, referrer]
    );

    console.log('✅ Lead captured:', email);

    return NextResponse.json({ 
      success: true,
      message: 'Email saved successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Lead capture error:', error);
    return NextResponse.json({ 
      error: 'Failed to save email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
