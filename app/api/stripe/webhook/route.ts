import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { query } from '@/lib/db';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');
    
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('⚠️ Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    console.log('✅ Stripe webhook received:', event.type);
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerEmail = session.customer_email || session.customer_details?.email;
        
        if (!customerEmail) {
          console.error('❌ No customer email in session');
          break;
        }
        
        // Determine tier
        let tier = 'explorer';
        if (session.metadata?.tier) {
          tier = session.metadata.tier;
        } else {
          const amount = session.amount_total;
          if (amount === 3900) tier = 'regulator';
          else if (amount === 9900) tier = 'integrator';
        }
        
        // Get user
        const userResult = await query(
          'SELECT id, name, email FROM users WHERE email = $1',
          [customerEmail]
        );
        
        if (userResult.rows.length === 0) {
          console.error('❌ User not found:', customerEmail);
          break;
        }
        
        const user = userResult.rows[0];
        
        // Update user - trial converted to ACTIVE subscription
        await query(
          `UPDATE users 
           SET subscription_tier = $1,
               subscription_status = 'active',
               stripe_customer_id = $2,
               trial_ends_at = NULL,
               updated_at = NOW()
           WHERE email = $3`,
          [tier, session.customer, customerEmail]
        );
        
        console.log(`✅ Trial converted to ACTIVE: ${customerEmail} - ${tier.toUpperCase()}`);
        
        // Email to USER
        try {
          await resend.emails.send({
            from: 'VERA <support@veraneural.com>',
            to: customerEmail,
            subject: `Your ${tier.charAt(0).toUpperCase() + tier.slice(1)} subscription is now active! 🎉`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #8b5cf6;">Welcome to VERA ${tier.charAt(0).toUpperCase() + tier.slice(1)}, ${user.name}! 🌟</h1>
                <p style="font-size: 16px; color: #475569;">
                  Your 7-day trial has ended and your payment was successful! Your <strong>${tier.charAt(0).toUpperCase() + tier.slice(1)}</strong> subscription is now active.
                </p>
                <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="color: #8b5cf6; margin-top: 0;">Continue your journey</h2>
                  <p style="color: #475569;">VERA is here for you 24/7. Keep exploring, regulating, and growing.</p>
                </div>
                <a href="https://veraneural.com/chat" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                  Continue to Chat →
                </a>
                <p style="color: #94a3b8; font-size: 14px; margin-top: 30px;">
                  Questions? Reply to this email anytime.
                </p>
              </div>
            `,
          });
          console.log('✅ Subscription confirmation email sent');
        } catch (emailError) {
          console.error('❌ Failed to send user email:', emailError);
        }
        
        // Email to ADMIN
        try {
          await resend.emails.send({
            from: 'VERA Notifications <notifications@veraneural.com>',
            to: 'your-admin-email@example.com', // REPLACE WITH YOUR EMAIL
            subject: `💰 Trial Converted! ${tier.toUpperCase()} - ${user.name}`,
            html: `
              <div style="font-family: Arial, sans-serif;">
                <h2 style="color: #10b981;">🎉 Trial Converted to Paid!</h2>
                <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
                  <p><strong>Customer:</strong> ${user.name} (${customerEmail})</p>
                  <p><strong>Tier:</strong> ${tier.toUpperCase()}</p>
                  <p><strong>Amount:</strong> $${(session.amount_total / 100).toFixed(2)}</p>
                  <p><strong>Stripe Customer:</strong> ${session.customer}</p>
                  <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                </div>
              </div>
            `,
          });
          console.log('✅ Admin notification sent');
        } catch (emailError) {
          console.error('❌ Failed to send admin email:', emailError);
        }
        
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await query(
          `UPDATE users 
           SET subscription_status = $1,
               updated_at = NOW()
           WHERE stripe_customer_id = $2`,
          [subscription.status, subscription.customer]
        );
        console.log('✅ Subscription updated:', subscription.customer);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await query(
          `UPDATE users 
           SET subscription_status = 'canceled',
               updated_at = NOW()
           WHERE stripe_customer_id = $1`,
          [subscription.customer]
        );
        console.log('✅ Subscription canceled:', subscription.customer);
        break;
      }
      
      default:
        console.log('ℹ️ Unhandled event type:', event.type);
    }
    
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    );
  }
}
