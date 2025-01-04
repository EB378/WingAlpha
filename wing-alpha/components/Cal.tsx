// Cal.tsx
"use client";

import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { createClient } from "@/utils/supabase/client";
import { User, Session } from "@supabase/supabase-js";

const supabase = createClient();

interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO date string
  end: string; // ISO date string
}

const CalendarScheduler: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user || null);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  interface GoogleCalendarEvent {
    id: string;
    summary: string;
    start: { dateTime?: string; date?: string };
    end: { dateTime?: string; date?: string };
  }
  
  interface GoogleCalendarResponse {
    items: GoogleCalendarEvent[];
  }
  
  const fetchEvents = async () => {
    if (!session || !session.provider_token) {
      alert("You must be logged in to fetch events.");
      return;
    }
  
    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data: GoogleCalendarResponse = await response.json();
  
      if (response.ok) {
        const formattedEvents: CalendarEvent[] = data.items.map((item) => ({
          id: item.id,
          title: item.summary,
          start: item.start.dateTime || item.start.date || "",
          end: item.end.dateTime || item.end.date || "",
        }));
        setEvents(formattedEvents);
      } else {
        console.error("Error fetching events:", data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };
  

  const handleEventAdd = async ({ event }: { event: { title: string; start: Date | null; end: Date | null } }) => {
    if (!session || !session.provider_token) {
      alert("You must be logged in to create an event.");
      return;
    }

    if (!event.start || !event.end) {
      console.error("Event start or end time is missing.");
      return;
    }

    const newEvent = {
      summary: event.title,
      start: { dateTime: event.start.toISOString() },
      end: { dateTime: event.end.toISOString() },
    };

    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEvent),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error("Error adding event:", data);
      } else {
        fetchEvents(); // Refresh events after adding
      }
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  const handleEventChange = async ({ event }: { event: { id: string; title: string; start: Date | null; end: Date | null } }) => {
    if (!session || !session.provider_token) {
      alert("You must be logged in to update an event.");
      return;
    }

    if (!event.start || !event.end) {
      console.error("Event start or end time is missing.");
      return;
    }

    const updatedEvent = {
      id: event.id,
      summary: event.title,
      start: { dateTime: event.start.toISOString() },
      end: { dateTime: event.end.toISOString() },
    };

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedEvent),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error("Error updating event:", data);
      } else {
        fetchEvents(); // Refresh events after updating
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchEvents();
    }
  }, [session]);

  return (
    <div className="container w-full mx-auto p-4 text-black">
      <h1 className="text-2xl font-bold mb-4">Google Calendar Scheduler</h1>
      {user ? (
        <div>
          <h2>Welcome, {user.email}</h2>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            editable={true}
            selectable={true}
            events={events}
            eventAdd={handleEventAdd} // Correctly typed handler
            eventChange={handleEventChange} // Correctly typed handler
            height="auto"
          />
          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-4 p-2 bg-red-500 text-white rounded"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                scopes: "https://www.googleapis.com/auth/calendar",
                redirectTo: `${window.location.origin}/auth/callback`,
              },
            })
          }
          className="p-2 bg-blue-500 text-white rounded"
        >
          Sign In with Google
        </button>
      )}
    </div>
  );
};

export default CalendarScheduler;
