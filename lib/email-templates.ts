export const passwordResetEmail = (name: string, resetLink: string) => {
  return {
    subject: 'Reset Your VERA Password',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: bold; background: linear-gradient(to right, #ec4899, #a855f7, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                VERA
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 20px 40px;">
              <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #1e293b;">
                Reset Your Password
              </h2>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">
                Hi ${name},
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">
                We received a request to reset your VERA password. Click the button below to create a new password:
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="${resetLink}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(to right, #a855f7, #ec4899); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #64748b;">
                This link will expire in 1 hour for security reasons.
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #64748b;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
              
              <!-- Divider -->
              <div style="margin: 32px 0; height: 1px; background-color: #e2e8f0;"></div>
              
              <p style="margin: 0; font-size: 14px; color: #94a3b8;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 8px 0 0; font-size: 14px; color: #3b82f6; word-break: break-all;">
                ${resetLink}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; background-color: #f8fafc; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">
                Your companion for nervous system regulation
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} VERA AI. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Hi ${name},

We received a request to reset your VERA password.

Reset your password: ${resetLink}

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email.

— VERA
Your companion for nervous system regulation
    `
  };
};

export const welcomeEmail = (name: string) => {
  const chatLink = `${process.env.NEXT_PUBLIC_APP_URL}/chat`;
  
  return {
    subject: 'Welcome to VERA 💜',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to VERA</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header with gradient -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #fef3f8 0%, #f0f0ff 50%, #f0f9ff 100%); border-top-left-radius: 16px; border-top-right-radius: 16px;">
              <h1 style="margin: 0 0 16px; font-size: 32px; font-weight: bold; background: linear-gradient(to right, #ec4899, #a855f7, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                VERA
              </h1>
              <p style="margin: 0; font-size: 18px; color: #64748b;">
                I see you, and I am here.
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 32px 40px;">
              <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #1e293b;">
                Welcome, ${name} 💜
              </h2>
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #475569;">
                Thank you for choosing VERA as your companion for nervous system regulation.
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">
                I'm here for you 24/7 — no judgment, no waiting rooms, just support when you need it.
              </p>
              
              <!-- Features -->
              <div style="margin: 32px 0; padding: 24px; background-color: #f8fafc; border-radius: 12px; border-left: 4px solid #a855f7;">
                <p style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #1e293b;">
                  What you can do with VERA:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 15px; line-height: 1.8;">
                  <li>Chat anytime about what you're feeling</li>
                  <li>Track your daily check-ins and patterns</li>
                  <li>Journal with guided prompts</li>
                  <li>Get personalized wellness protocols</li>
                  <li>Save and review your conversations</li>
                </ul>
              </div>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="${chatLink}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(to right, #a855f7, #ec4899); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
                      Start Your First Chat
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; font-size: 15px; line-height: 1.6; color: #64748b; font-style: italic;">
                "Start with sensations, not stories. Your body speaks truth."
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; background-color: #f8fafc; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;">
              <p style="margin: 0 0 16px; font-size: 14px; color: #64748b;">
                Need help? Just reply to this email — a human will respond.
              </p>
              <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">
                Your companion for nervous system regulation
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} VERA AI. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Welcome to VERA 💜

Hi ${name},

Thank you for choosing VERA as your companion for nervous system regulation.

I'm here for you 24/7 — no judgment, no waiting rooms, just support when you need it.

What you can do with VERA:
- Chat anytime about what you're feeling
- Track your daily check-ins and patterns
- Journal with guided prompts
- Get personalized wellness protocols
- Save and review your conversations

Start your first chat: ${chatLink}

"Start with sensations, not stories. Your body speaks truth."

Need help? Just reply to this email — a human will respond.

— VERA
Your companion for nervous system regulation
    `
  };
};