// Usage: node scripts/create-test-user-in-users.js
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const name = 'Test Staff';
  const email = 'test@veraneural.com';
  const password = 'TestVera2025!';
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, subscription_status, subscription_tier, trial_ends_at)
       VALUES ($1, $2, $3, 'active', 'integrator', NOW() + interval '7 days')
       RETURNING id, name, email, subscription_status, subscription_tier, trial_ends_at`,
      [name, email, passwordHash]
    );
    console.log('✅ Test user created in users table:', result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      console.log('⚠️  Test user already exists in users table!');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await pool.end();
  }
}

main().catch(console.error);