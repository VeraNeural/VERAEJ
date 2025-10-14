import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const db = {
  async getUserById(id: string) {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },
  async getUserByEmail(email: string) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },
  async createResetToken(userId: string, token: string) {
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 3600000);
    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at, used)
       VALUES ($1, $2, $3, false)`,
      [userId, token, expiresAt]
    );
  },
  // --- PASSWORD RESET ---
  async getResetToken(token: string) {
    const result = await pool.query(
      `SELECT * FROM password_reset_tokens WHERE token = $1 AND used = false AND expires_at > NOW()`,
      [token]
    );
    return result.rows[0];
  },

  async updateUserPassword(userId: string, passwordHash: string) {
    await pool.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [passwordHash, userId]
    );
  },

  async markTokenUsed(token: string) {
    await pool.query(
      `UPDATE password_reset_tokens SET used = true, used_at = NOW() WHERE token = $1`,
      [token]
    );
  },
  // Get all users
  async getAllUsers() {
    const result = await pool.query(`
      SELECT 
        id, name, email, subscription_status, subscription_tier,
        trial_ends_at, created_at, updated_at, email_updates, is_admin
      FROM users 
      ORDER BY created_at DESC
    `);
    return result.rows;
  },

  // Create new user
  async createUser(name: string, email: string, passwordHash: string) {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, subscription_status, subscription_tier, trial_ends_at)
       VALUES ($1, $2, $3, 'trial', 'free', $4)
       RETURNING id, name, email, subscription_status, trial_ends_at, created_at`,
      [name, email, passwordHash, trialEndsAt]
    );
    return result.rows[0];
  },

  // Update user subscription
  async updateUserSubscription(userId: string, subscriptionStatus: string) {
    const result = await pool.query(
      `UPDATE users 
       SET subscription_status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [subscriptionStatus, userId]
    );
    return result.rows[0];
  },

  // Get chat sessions
  async getChatSessions(userId: string) {
    const result = await pool.query(
      `SELECT * FROM chat_sessions 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // Create chat session
  async createChatSession(userId: string, title?: string) {
    const result = await pool.query(
      `INSERT INTO chat_sessions (user_id, title)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, title || 'New conversation']
    );
    return result.rows[0];
  },

  async getUserSessions(userId: string, limit: number = 20) {
    const result = await pool.query(
      `SELECT s.*, 
              (SELECT content FROM chat_messages 
               WHERE session_id = s.id 
               ORDER BY created_at ASC LIMIT 1) as first_message,
              (SELECT created_at FROM chat_messages 
               WHERE session_id = s.id 
               ORDER BY created_at DESC LIMIT 1) as last_activity
       FROM chat_sessions s
       WHERE s.user_id = $1
       ORDER BY s.updated_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },

  async getSession(sessionId: string) {
    const result = await pool.query(
      `SELECT * FROM chat_sessions WHERE id = $1`,
      [sessionId]
    );
    return result.rows[0];
  },

  async updateSessionTitle(sessionId: string, title: string) {
    await pool.query(
      `UPDATE chat_sessions 
       SET title = $1, updated_at = NOW() 
       WHERE id = $2`,
      [title, sessionId]
    );
  },

  async deleteSession(sessionId: string) {
    // Delete all messages first for referential integrity
    await pool.query(
      `DELETE FROM chat_messages WHERE session_id = $1`,
      [sessionId]
    );
    await pool.query(
      `DELETE FROM chat_sessions WHERE id = $1`,
      [sessionId]
    );
  },

  // Get messages
  async getMessages(sessionId: string) {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE session_id = $1 
       ORDER BY created_at ASC`,
      [sessionId]
    );
    return result.rows;
  },

  // Save message
  async saveMessage(sessionId: string, userId: string, role: string, content: string, audioUrl?: string) {
    const result = await pool.query(
      `INSERT INTO chat_messages (session_id, user_id, role, content, audio_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [sessionId, userId, role, content, audioUrl || null]
    );
    // Update session's updated_at and message_count
    await pool.query(
      `UPDATE chat_sessions 
       SET updated_at = NOW(), 
           message_count = message_count + 1
       WHERE id = $1`,
      [sessionId]
    );
    return result.rows[0];
  },

  async getSessionMessages(sessionId: string) {
    const result = await pool.query(
      `SELECT * FROM chat_messages 
       WHERE session_id = $1 
       ORDER BY created_at ASC`,
      [sessionId]
    );
    return result.rows;
  },

  // --- USER INSIGHTS ---
  async saveInsight(userId: string, insightType: string, content: string, confidence: number = 1.0) {
    const result = await pool.query(
      `INSERT INTO user_insights (user_id, insight_type, content, confidence_score)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, insight_type, content) 
       DO UPDATE SET confidence_score = $4, updated_at = NOW()
       RETURNING *`,
      [userId, insightType, content, confidence]
    );
    return result.rows[0];
  },

  async getUserInsights(userId: string) {
    const result = await pool.query(
      `SELECT * FROM user_insights 
       WHERE user_id = $1 
       ORDER BY confidence_score DESC, updated_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // Delete user
  async deleteUser(userId: string) {
    // Delete user's messages
    await pool.query(
      `DELETE FROM messages WHERE user_id = $1`,
      [userId]
    );
    // Delete user's chat sessions
    await pool.query(
      `DELETE FROM chat_sessions WHERE user_id = $1`,
      [userId]
    );
    // Delete user
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING *`,
      [userId]
    );
    return result.rows[0];
  },

  // Count messages today
  async countMessagesToday(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await pool.query(
      `SELECT COUNT(*) as count 
       FROM messages 
       WHERE user_id = $1 
       AND role = 'user'
       AND created_at >= $2`,
      [userId, today]
    );

    return parseInt(result.rows[0].count);
  },

  // Get user tier
  async getUserTier(userId: string) {
    const result = await pool.query(
      'SELECT subscription_status, subscription_tier, trial_ends_at FROM users WHERE id = $1',
      [userId]
    );
    
    const user = result.rows[0];
    if (!user) return 'free';
    
    const trialActive = user.subscription_status === 'trial' && new Date() < new Date(user.trial_ends_at);
    
    if (trialActive) {
      return 'explorer';
    }
    
    if (user.subscription_status === 'active') {
      return user.subscription_tier || 'explorer';
    }
    
    return 'free';
  },

  // Get total messages
  async getTotalMessages() {
    const result = await pool.query('SELECT COUNT(*) as count FROM messages');
    return parseInt(result.rows[0].count);
  },

  // Get active users count
  async getActiveUsersCount() {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const result = await pool.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM messages WHERE created_at >= $1',
      [oneDayAgo]
    );
    return parseInt(result.rows[0].count);
  },

  // Get conversion rate
  async getConversionRate() {
    const totalResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const paidResult = await pool.query(
      `SELECT COUNT(*) as count FROM users 
       WHERE subscription_status = 'active' 
       AND subscription_tier != 'free'`
    );
    
    const total = parseInt(totalResult.rows[0].count);
    const paid = parseInt(paidResult.rows[0].count);
    
    return total > 0 ? ((paid / total) * 100).toFixed(1) : '0';
  },
  // ...existing code...
  }

  // Create test user (for staff)
  export async function createTestUser(params: { name: string; email: string; password: string }) {
    const { name, email, password } = params;
    const saltRounds = 10;
    let passwordHash;
    try {
      passwordHash = await bcrypt.hash(password, saltRounds);
    } catch (err) {
      return { error: 'Password hashing failed' };
    }
    try {
      const result = await pool.query(
        `INSERT INTO test_users (name, email, password_hash, subscription_tier, subscription_status)
         VALUES ($1, $2, $3, 'integrator', 'active')
         RETURNING id, name, email, subscription_tier, subscription_status, created_at`,
        [name, email, passwordHash]
      );
      return { user: result.rows[0] };
    } catch (error) {
  const err = error as unknown as { code?: string };
      if (err.code === '23505') {
        return { error: 'Test user already exists' };
      }
      return { error: 'Database error' };
    }
  }
// End of db object

// Export query function for custom queries
export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('✅ Database connected successfully');
  }
});