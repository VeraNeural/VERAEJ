import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify token
    const resetToken = await db.getResetToken(token);

    if (!resetToken) {
      return NextResponse.json({ 
        error: 'Invalid or expired reset token' 
      }, { status: 400 });
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user password
    await db.updateUserPassword(resetToken.user_id, passwordHash);

    // Mark token as used
    await db.markTokenUsed(token);

    return NextResponse.json({ 
      message: 'Password reset successfully' 
    }, { status: 200 });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ 
      error: 'Failed to reset password' 
    }, { status: 500 });
  }
}
