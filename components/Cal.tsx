"use client";

import React, { useState } from "react";
import { parseISO } from "date-fns";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";

interface Event {
  id: string;
  title: string;
  details: string;
  starttime: string; // ISO string
  endtime: string; // ISO string
  User: string; // User ID
}

interface CalProps {
  user: { id: string; email?: string };
  bookings: Event[];
}

const Cal: React.FC<CalProps> = ({ user, bookings }) => {
  const [localBookings, setLocalBookings] = useState<Event[]>(bookings);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newBookingTitle, setNewBookingTitle] = useState<string>("");
  const [starttime, setStarttime] = useState<string>("");
  const [endtime, setEndtime] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Handle event selection for new bookings
  const handleDateSelect = (selection: { start: Date; end: Date }) => {
    const starttimeValue = selection.start.toISOString();
    const endtimeValue = selection.end.toISOString();
    setStarttime(starttimeValue);
    setEndtime(endtimeValue);
    setSelectedEvent({
      id: "0",
      title: "",
      details: "",
      starttime: starttimeValue,
      endtime: endtimeValue,
      User: user.id, // Use the logged-in user's ID
    });
    setNewBookingTitle("");
  };

  // Handle event click for editing
  const handleEventClick = (info: EventClickArg) => {
    // Log the clicked event ID
    console.log("Clicked event ID:", info.event.id);
  
    // Log all bookings for comparison
    console.log("Current bookings state:", bookings);
  
    // Find the clicked event in the bookings array

    const clickedEvent = bookings.find((b) => String(b.id) === String(info.event.id)); // Match event by ID

  
    if (clickedEvent) {
      // Event found, set it for editing
      setSelectedEvent(clickedEvent);
      setNewBookingTitle(clickedEvent.title);
      setStarttime(clickedEvent.starttime);
      setEndtime(clickedEvent.endtime);
    } else {
      // Event not found, log error
      console.error(`Error: Event not found. Event ID: ${info.event.id}`);
      alert("Error: The selected event could not be found. Please try again.");
    }
  };
  
  

  // Save a new or updated booking
  const handleSaveBooking = async () => {
    if (!selectedEvent || !newBookingTitle) return;

    if (selectedEvent.id === "0") {
      // Add a new booking
      const newEvent: Event = {
        id: Math.random().toString(36).substr(2, 9), // Generate a temporary ID
        title: newBookingTitle,
        details: selectedEvent.details,
        starttime,
        endtime,
        User: user.id,
      };
      setLocalBookings([...localBookings, newEvent]);
    } else {
      // Update an existing booking
      setLocalBookings(
        localBookings.map((b) =>
          b.id === selectedEvent.id
            ? { ...b, title: newBookingTitle, starttime, endtime, details: selectedEvent.details }
            : b
        )
      );
    }

    setSelectedEvent(null);
    setNewBookingTitle("");
  };

  // Delete a booking
  const handleDeleteBooking = () => {
    if (!selectedEvent || !selectedEvent.id) return;

    setLocalBookings(localBookings.filter((b) => b.id !== selectedEvent.id));
    setSelectedEvent(null);
  };

  return (
    <div className="relative w-screen text-black p-6 bg-gray-100">
      <h1 className="text-4xl font-bold mb-6 text-center">Bookings Scheduler</h1>
      {error && (
        <div className="text-red-500 text-center mb-4">
          <p>{error}</p>
        </div>
      )}
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
        events={localBookings.map((event) => {
          console.log("Event in calendar:", event.id);
          return {
          id: event.id,
          title: event.title,
          start: event.starttime,
          end: event.endtime,
        };
        })}
        eventClick={handleEventClick}
        select={handleDateSelect}
        height="auto"
      />
      <pre className="text-xs font-mono p-3 rounded border px-14 max-h-32 overflow-auto">
          {JSON.stringify(bookings, null, 2)}
        </pre>

      {/* Booking Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-black">
              {selectedEvent.id === "0" ? "New Booking" : "Edit Booking"}
            </h2>
            <label className="block mb-2 font-medium text-black">Title</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 bg-white rounded-md mb-4"
              value={newBookingTitle}
              onChange={(e) => setNewBookingTitle(e.target.value)}
            />
            <label className="block mb-2 font-medium text-black">Details</label>
            <textarea
              className="w-full p-2 border border-gray-300 bg-white rounded-md mb-4"
              value={selectedEvent.details}
              onChange={(e) =>
                setSelectedEvent((prev) =>
                  prev ? { ...prev, details: e.target.value } : null
                )
              }
            />
            <label className="block mb-2 font-medium text-black">Start Time</label>
            <input
              type="datetime-local"
              className="w-full p-2 border border-gray-300 bg-white rounded-md mb-4"
              value={parseISO(starttime).toISOString().slice(0, -8)}
              onChange={(e) => setStarttime(e.target.value + ":00Z")}
            />
            <label className="block mb-2 font-medium text-black">End Time</label>
            <input
              type="datetime-local"
              className="w-full p-2 border border-gray-300 bg-white rounded-md mb-4"
              value={parseISO(endtime).toISOString().slice(0, -8)}
              onChange={(e) => setEndtime(e.target.value + ":00Z")}
            />
            <div className="flex justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                onClick={handleSaveBooking}
              >
                Save
              </button>
              {selectedEvent.id !== "0" && (
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                  onClick={handleDeleteBooking}
                >
                  Delete
                </button>
              )}
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                onClick={() => setSelectedEvent(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cal;
