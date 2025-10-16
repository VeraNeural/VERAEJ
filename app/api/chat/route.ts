// Get recent conversation context (last 5 messages from previous sessions)
    let conversationContext = '';
    try {
      const recentResult = await query(
        `SELECT content, role, created_at 
         FROM messages 
         WHERE user_id = $1 
         AND session_id != $2 
         ORDER BY created_at DESC 
         LIMIT 5`,
        [payload.userId, sessionId || '00000000-0000-0000-0000-000000000000']
      );

      if (recentResult.rows && recentResult.rows.length > 0) {
        const recentTopics = recentResult.rows
          .filter(m => m.role === 'user')
          .map(m => m.content.substring(0, 50))
          .join(', ');
        
        conversationContext = `[Context: You've spoken with this person before. Recent topics they mentioned: ${recentTopics}...]`;
        console.log('🧠 Added conversation memory:', conversationContext);
      }
    } catch (contextError) {
      console.error('⚠️ Could not fetch conversation context:', contextError);
      // Continue without context - not critical
    }

    // Map messages with optional context
    const claudeMessages = conversationContext 
      ? [
          {
            role: 'user' as const,
            content: conversationContext
          },
          ...messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          }))
        ]
      : messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }));

    console.log('📚 Sending to Claude with memory context');

    const claudeResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: VERA_SYSTEM_PROMPT,
      messages: claudeMessages,
    });