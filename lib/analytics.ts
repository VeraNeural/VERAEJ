// Simple analytics event tracker
// You can replace this with Google Analytics, Plausible, etc. later

type AnalyticsEvent = {
  event: string;
  properties?: Record<string, any>;
  timestamp: Date;
};

class Analytics {
  private events: AnalyticsEvent[] = [];
  private maxEvents = 1000;

  track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date(),
    };

    this.events.push(analyticsEvent);

    // Keep only last 1000 events in memory
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics:', event, properties);
    }

    // In production, you'd send this to your analytics service
    // Example: Send to your backend or analytics platform
  }

  page(pageName: string, properties?: Record<string, any>) {
    this.track('page_view', { page: pageName, ...properties });
  }

  getEvents() {
    return this.events;
  }

  clear() {
    this.events = [];
  }
}

export const analytics = new Analytics();

// Helper functions for common events
export const trackEvent = {
  signup: (method: string = 'email') => {
    analytics.track('user_signup', { method });
  },

  signin: (method: string = 'email') => {
    analytics.track('user_signin', { method });
  },

  messageSent: (tier: string) => {
    analytics.track('message_sent', { tier });
  },

  upgradePromptShown: (fromTier: string, toTier: string) => {
    analytics.track('upgrade_prompt_shown', { fromTier, toTier });
  },

  upgradeClicked: (tier: string) => {
    analytics.track('upgrade_clicked', { tier });
  },

  protocolGenerated: (tier: string) => {
    analytics.track('protocol_generated', { tier });
  },

  checkInCompleted: (mood: number, energy: number, stress: number) => {
    analytics.track('check_in_completed', { mood, energy, stress });
  },

  journalEntryCreated: (promptId: string) => {
    analytics.track('journal_entry_created', { promptId });
  },

  fileUploaded: (fileType: string, fileSize: number) => {
    analytics.track('file_uploaded', { fileType, fileSize });
  },
};
