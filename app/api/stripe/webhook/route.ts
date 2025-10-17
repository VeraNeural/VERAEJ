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
      console.error('❌ No signature in webhook');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }
    
    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('⚠️ Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    console.log('✅ Stripe webhook received:', event.type);
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        console.log('💳 Checkout session completed:', session.id);
        
        // Get customer email
        const customerEmail = session.customer_email || session.customer_details?.email;
        
        if (!customerEmail) {
          console.error('❌ No customer email in session');
          break;
        }
        
        console.log('📧 Customer email:', customerEmail);
        
        // Determine tier from metadata or amount
        let tier = 'explorer';
        
        if (session.metadata?.tier) {
          tier = session.metadata.tier;
        } else {
          const amount = session.amount_total;
          if (amount === 1900) tier = 'explorer';
          else if (amount === 3900) tier = 'regulator';
          else if (amount === 9900) tier = 'integrator';
        }
        
        console.log('🎯 Tier:', tier);
        
        // Get user from database
        const userResult = await query(
          'SELECT id, name, email FROM users WHERE email = $1',
          [customerEmail]
        );
        
        if (userResult.rows.length === 0) {
          console.error('❌ User not found:', customerEmail);
          break;
        }
        
        const user = userResult.rows[0];
        console.log('👤 User found:', user.name);
        
        // Update user in database
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
        
        console.log(`✅ User upgraded: ${customerEmail} - ${tier.toUpperCase()}`);
        
        // Send email to USER
        try {
          console.log('📧 Sending welcome email to user...');
          
          const emailResult = await resend.emails.send({
            from: 'VERA <support@veraneural.com>', // ← Make sure this domain is verified in Resend
            to: customerEmail,
            subject: `Welcome to VERA ${tier.charAt(0).toUpperCase() + tier.slice(1)}! 🎉`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #8b5cf6;">Welcome to VERA, ${user.name}! 🌟</h1>
                <p style="font-size: 16px; color: #475569;">
                  Your payment was successful! You now have access to <strong>${tier.charAt(0).toUpperCase() + tier.slice(1)}</strong> tier.
                </p>
                <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="color: #8b5cf6; margin-top: 0;">What's next?</h2>
                  <ul style="color: #475569; line-height: 1.8;">
                    <li>Start chatting with VERA anytime, 24/7</li>
                    <li>Explore your ${tier} features</li>
                    <li>Access wellness tools and resources</li>
                  </ul>
                </div>
                <a href="https://veraneural.com/chat" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                  Start Chatting with VERA →
                </a>
                <p style="color: #94a3b8; font-size: 14px; margin-top: 30px;">
                  Need help? Reply to this email or visit our support page.
                </p>
              </div>
            `,
          });
          
          console.log('✅ Welcome email sent to user:', emailResult);
        } catch (emailError: any) {
          console.error('❌ Failed to send user email:', emailError);
          console.error('Email error details:', emailError.message);
        }
        
        // Send email to ADMIN (YOU)
        try {
          console.log('📧 Sending notification email to admin...');
          
          const adminEmailResult = await resend.emails.send({
            from: 'VERA Notifications <notifications@veraneural.com>', // ← Make sure this domain is verified
            to: 'eva@evaleka.com', // ← REPLACE WITH YOUR ACTUAL EMAIL
            subject: `💰 New ${tier.toUpperCase()} Subscription!`,
            html: `
              <div style="font-family: Arial, sans-serif;">
                <h2 style="color: #10b981;">🎉 New Payment Received!</h2>
                <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
                  <p><strong>Customer:</strong> ${user.name} (${customerEmail})</p>
                  <p><strong>Tier:</strong> ${tier.toUpperCase()}</p>
                  <p><strong>Amount:</strong> $${(session.amount_total / 100).toFixed(2)}</p>
                  <p><strong>Stripe Customer ID:</strong> ${session.customer}</p>
                  <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                </div>
              </div>
            `,
          });
          
          console.log('✅ Admin notification sent:', adminEmailResult);
        } catch (emailError: any) {
          console.error('❌ Failed to send admin email:', emailError);
          console.error('Email error details:', emailError.message);
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
