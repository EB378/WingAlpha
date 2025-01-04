// App.tsx
"use client";

import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createClient } from "@/utils/supabase/client";
import CalendarScheduler from "@/components/Cal";
import { Session, User } from "@supabase/supabase-js";

const supabase = createClient();

interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO string for start date
  end: string; // ISO string for end date
}


const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [start, setStart] = useState<Date>(new Date());
  const [end, setEnd] = useState<Date>(new Date());
  const [eventName, setEventName] = useState<string>("");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);


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

  const googleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: "https://www.googleapis.com/auth/calendar",
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      alert("Error logging in to Google. Please try again.");
      console.error("Google Sign-In Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      alert("Signed out successfully");
    } catch (error) {
      alert("Error signing out. Please try again.");
      console.error("Sign-Out Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCalendarEvent = async () => {
    if (!session || !session.provider_token) {
      alert("You must be logged in to create an event.");
      return;
    }

    const event = {
      summary: eventName,
      description: eventDescription,
      start: {
        dateTime: start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    setLoading(true);
    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("Event created successfully! Check your Google Calendar.");
        setEventName("");
        setEventDescription("");
        setStart(new Date());
        setEnd(new Date());
      } else {
        alert(`Failed to create event: ${data.error?.message || "Unknown error"}`);
        console.error("API Error Response:", data);
      }
    } catch (error) {
      alert("Error creating calendar event. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaysEvents = async () => {
    if (!session || !session.provider_token) {
      alert("You must be logged in to fetch events.");
      return;
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    setLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startOfDay}&timeMax=${endOfDay}&singleEvents=true&orderBy=startTime`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setEvents(data.items || []);
      } else {
        alert(`Failed to fetch events: ${data.error?.message || "Unknown error"}`);
        console.error("API Error Response:", data);
      }
    } catch (error) {
      alert("Error fetching events. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col w-screen items-center p-6 bg-gray-100 min-h-screen">
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-xl font-bold">Loading...</div>
        </div>
      )}
      {user ? (
        <div className="w-full max-w-md space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Welcome, {user.email}</h2>
          <div>
            <label className="block text-gray-700 font-medium">Start Time:</label>
            <DatePicker
              selected={start}
              onChange={(date) => setStart(date || new Date())}
              showTimeSelect
              dateFormat="Pp"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">End Time:</label>
            <DatePicker
              selected={end}
              onChange={(date) => setEnd(date || new Date())}
              showTimeSelect
              dateFormat="Pp"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Event Name:</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Enter event name"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Event Description:</label>
            <textarea
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="Enter event description"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            onClick={createCalendarEvent}
            className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Create Event
          </button>
          <button
            onClick={signOut}
            className="w-full p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Sign Out
          </button>
          <div className="w-full">
            <button
              onClick={fetchTodaysEvents}
              className="w-full p-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Fetch Today&apos;s Events
            </button>
            <CalendarScheduler/>
            <pre className="mt-4 bg-gray-200 p-2 rounded text-sm text-black">
              {JSON.stringify(events, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <button
          onClick={googleSignIn}
          className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Sign In with Google
        </button>
      )}
    </div>
  );
};

export default App;
