// Usage: node scripts/update-test-user-password.js
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const email = 'test@veraneural.com';
  const newPassword = 'TestVera2025!'; // Set your desired password here
  const passwordHash = await bcrypt.hash(newPassword, 10);
  try {
    const result = await pool.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2 RETURNING id, email, updated_at`,
      [passwordHash, email]
    );
    if (result.rowCount === 0) {
      console.log('❌ No user found with email:', email);
    } else {
      console.log('✅ Password updated for:', result.rows[0]);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);