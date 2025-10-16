'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_link: string;
  recording_url: string | null;
  status: string;
  host_name: string;
  attendee_count: number;
  user_rsvp_status: string | null;
  max_attendees: number | null;
}

export default function EventsPage() {
  const router = useRouter();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setUpcomingEvents(data.upcoming || []);
        setPastEvents(data.past || []);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRSVP(eventId: string, action: 'register' | 'unregister') {
    try {
      const res = await fetch('/api/events/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, action }),
      });

      if (res.ok) {
        loadEvents();
      }
    } catch (error) {
      console.error('Failed to RSVP:', error);
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getEventTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'workshop': 'Workshop',
      'qna': 'Q&A Session',
      'webinar': 'Webinar',
      'guest': 'Guest Speaker'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-purple-600">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="bg-white/90 backdrop-blur-xl border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/community')}
              className="text-purple-600 hover:text-purple-700"
            >
              Back to Community
            </button>
            <h1 className="text-2xl font-normal bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">
              Events & Workshops
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'upcoming'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Upcoming Events ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'past'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Past Events ({pastEvents.length})
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === 'upcoming' ? (
            upcomingEvents.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 p-12 text-center">
                <p className="text-slate-500">No upcoming events scheduled</p>
                <p className="text-sm text-slate-400 mt-2">Check back soon for new workshops and sessions</p>
              </div>
            ) : (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 p-8"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {getEventTypeLabel(event.event_type)}
                        </span>
                        {event.user_rsvp_status === 'registered' && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            Registered
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-medium text-slate-900 mb-2">{event.title}</h2>
                      <p className="text-slate-600 mb-4">{event.description}</p>
                      <div className="flex items-center gap-6 text-sm text-slate-500">
                        <span>{formatDate(event.scheduled_at)}</span>
                        <span>{event.duration_minutes} minutes</span>
                        <span>Hosted by {event.host_name}</span>
                      </div>
                      {event.max_attendees && (
                        <p className="text-sm text-slate-500 mt-2">
                          {event.attendee_count} / {event.max_attendees} spots filled
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {event.user_rsvp_status === 'registered' ? (
                      <>
                        {event.meeting_link && (
                          
                            href={event.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all"
                          >
                            Join Event
                          </a>
                        )}
                        <button
                          onClick={() => handleRSVP(event.id, 'unregister')}
                          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all"
                        >
                          Cancel Registration
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRSVP(event.id, 'register')}
                        disabled={event.max_attendees !== null && event.attendee_count >= event.max_attendees}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {event.max_attendees !== null && event.attendee_count >= event.max_attendees
                          ? 'Event Full'
                          : 'Register'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )
          ) : (
            pastEvents.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 p-12 text-center">
                <p className="text-slate-500">No past events yet</p>
              </div>
            ) : (
              pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-purple-100 p-8"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                          {getEventTypeLabel(event.event_type)}
                        </span>
                      </div>
                      <h2 className="text-2xl font-medium text-slate-900 mb-2">{event.title}</h2>
                      <p className="text-slate-600 mb-4">{event.description}</p>
                      <div className="flex items-center gap-6 text-sm text-slate-500">
                        <span>{formatDate(event.scheduled_at)}</span>
                        <span>{event.attendee_count} attended</span>
                      </div>
                    </div>
                  </div>

                  {event.recording_url && (
                    
                      href={event.recording_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-all"
                    >
                      Watch Recording
                    </a>
                  )}
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}
