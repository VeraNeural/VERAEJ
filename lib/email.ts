import { Resend } from 'resend';
import { passwordResetEmail, welcomeEmail } from './email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'VERA <hello@veraneural.com>';
const REPLY_TO_EMAIL = 'support@veraneural.com';

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetToken: string
) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
  const { subject, html, text } = passwordResetEmail(name, resetLink);

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      to,
      subject,
      html,
      text,
    });

    console.log('✅ Password reset email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  const { subject, html, text } = welcomeEmail(name);

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO_EMAIL,
      to,
      subject,
      html,
      text,
    });

    console.log('✅ Welcome email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    return { success: false, error };
  }
}