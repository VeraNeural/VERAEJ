import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get user from database
    const userResult = await query(
      'SELECT id, name, email FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    // Always return success (security: don't reveal if email exists)
    if (userResult.rows.length === 0) {
      console.log('❌ User not found:', email);
      return NextResponse.json({ 
        message: 'If that email exists, we sent reset instructions' 
      }, { status: 200 });
    }

    const user = userResult.rows[0];

    // Generate reset token (valid for 1 hour)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Save token to database
    await query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET token = $2, expires_at = $3, created_at = NOW(), used = FALSE`,
      [user.id, token, expiresAt]
    );

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`;

    try {
      await resend.emails.send({
        from: 'VERA <support@veraneural.com>',
        to: email,
        subject: 'Reset your VERA password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8b5cf6;">Reset Your Password</h1>
            <p style="font-size: 16px; color: #475569;">
              Hi ${user.name},
            </p>
            <p style="font-size: 16px; color: #475569;">
              We received a request to reset your password for your VERA account. Click the button below to create a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: #8b5cf6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 14px; color: #64748b;">
              Or copy and paste this link into your browser:
            </p>
            <p style="font-size: 14px; color: #8b5cf6; word-break: break-all;">
              ${resetUrl}
            </p>
            <p style="font-size: 14px; color: #94a3b8; margin-top: 30px;">
              This link will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            <p style="font-size: 12px; color: #94a3b8;">
              Need help? Reply to this email or contact support@veraneural.com
            </p>
          </div>
        `,
      });

      console.log('✅ Password reset email sent to:', email);
    } catch (emailError) {
      console.error('❌ Failed to send reset email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'If that email exists, we sent reset instructions' 
    }, { status: 200 });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
