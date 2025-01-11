"use client";

import React, { useState } from "react";
import { parseISO } from "date-fns";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";

interface Event {
  id: number;
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
  const [localBookings] = useState<Event[]>(bookings);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newBookingTitle, setNewBookingTitle] = useState<string>("");
  const [starttime, setStarttime] = useState<string>("");
  const [endtime, setEndtime] = useState<string>("");
  const [error] = useState<string | null>(null);

  // Handle event selection for new bookings
  const handleDateSelect = (selection: { start: Date; end: Date }) => {
    const starttimeValue = selection.start.toISOString();
    const endtimeValue = selection.end.toISOString();
    setStarttime(starttimeValue);
    setEndtime(endtimeValue);
    setSelectedEvent({
      id: 0,
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
    console.log("Clicked event ID:", info.event.id);
    const clickedEvent = bookings.find((b) => String(b.id) === info.event.id);

    if (clickedEvent) {
      setSelectedEvent(clickedEvent);
      setNewBookingTitle(clickedEvent.title);
      setStarttime(clickedEvent.starttime);
      setEndtime(clickedEvent.endtime);
    } else {
      console.error(`Error: Event not found. Event ID: ${info.event.id}`);
      alert("Error: The selected event could not be found. Please try again.");
    }
  };

  // Save a new or updated booking
  const handleSaveBooking = async () => {
    if (!selectedEvent || !newBookingTitle) return;

    const idAsString = String(selectedEvent.id);
    const idAsNumber = selectedEvent.id;

    const method = idAsNumber === 0 ? "POST" : "PUT";
    const endpoint = idAsNumber === 0 ? "/api/Bookings" : `/api/Bookings/${idAsString}`;

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selectedEvent,
          title: newBookingTitle,
          starttime,
          endtime,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to save booking.");
        return;
      }

      setSelectedEvent(null);
      setNewBookingTitle("");
    } catch (error) {
      console.error("Error saving booking:", error);
    }
  };

  // Delete a booking
  const handleDeleteBooking = async () => {
    if (!selectedEvent || !selectedEvent.id) return;

    const idAsString = String(selectedEvent.id);

    try {
      const response = await fetch(`/api/Bookings/${idAsString}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to delete booking.");
        return;
      }

      setSelectedEvent(null);
      setNewBookingTitle("");
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
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
            id: String(event.id), // Pass ID as string for FullCalendar
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
              {selectedEvent.id === 0 ? "New Booking" : "Edit Booking"}
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
              {selectedEvent.id !== 0 && (
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
