const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTestUser() {
  try {
    console.log('🔧 Creating test user...');
    const password = 'TestVera2025!';
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO test_users (name, email, password_hash, subscription_tier, subscription_status)
       VALUES ($1, $2, $3, 'integrator', 'active')
       RETURNING id, name, email, subscription_tier`,
      ['Test Staff', 'test@veraneural.com', passwordHash]
    );
    console.log('✅ Test user created successfully!');
    console.log('');
    console.log('📧 Login Credentials:');
    console.log('   Email:', 'test@veraneural.com');
    console.log('   Password:', password);
    console.log('   Tier: Integrator (Unlimited Voice)');
    console.log('');
    console.log('🧪 User Details:', result.rows[0]);
    await pool.end();
    process.exit(0);
  } catch (error) {
    if (error.code === '23505') {
      console.log('⚠️  Test user already exists!');
      console.log('📧 Email: test@veraneural.com');
      console.log('🔑 Password: TestVera2025!');
    } else {
      console.error('❌ Error:', error.message);
    }
    await pool.end();
    process.exit(1);
  }
}

createTestUser();
