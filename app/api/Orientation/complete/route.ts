import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify user is authenticated
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = payload.userId;

    // 2. Get orientation data
    const { name, whatBringsYou, nervousSystemNeeds, consentGiven, understandsNotMedical, understandsComplement } = await request.json();

    // 3. Verify all consent given
    if (!consentGiven || !understandsNotMedical || !understandsComplement) {
      return NextResponse.json({ 
        error: 'All consent items must be accepted' 
      }, { status: 400 });
    }

    // 4. Save orientation completion to database
    await query(
      `UPDATE users 
       SET 
         name = $1,
         orientation_completed = TRUE,
         orientation_data = $2,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [
        name,
        JSON.stringify({
          whatBringsYou,
          nervousSystemNeeds,
          consentGiven,
          understandsNotMedical,
          understandsComplement,
          completedAt: new Date().toISOString()
        }),
        userId
      ]
    );

    console.log('✅ Orientation completed for user:', userId);

    return NextResponse.json({ 
      success: true,
      message: 'Orientation completed successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Orientation completion error:', error);
    return NextResponse.json({ 
      error: 'Failed to complete orientation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
