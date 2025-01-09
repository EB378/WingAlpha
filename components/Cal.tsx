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
  user: { id: string; email: string }; // Logged-in user data
  bookings: Event[]; // Bookings data from parent
}

const Cal: React.FC<CalProps> = ({ user, bookings: initialBookings }) => {
  const [Bookings] = useState<Event[]>(initialBookings);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newBookingTitle, setNewBookingTitle] = useState<string>("");
  const [starttime, setStarttime] = useState<string>("");
  const [endtime, setEndtime] = useState<string>("");

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
    const event = Bookings.find((b) => b.id === info.event.id);
    if (event) {
      setSelectedEvent(event);
      setNewBookingTitle(event.title);
      setStarttime(event.starttime);
      setEndtime(event.endtime);
    }
  };

  // Save a new or updated booking
  const handleSaveBooking = async () => {
    if (!selectedEvent || !newBookingTitle) return;

    const method = selectedEvent.id === "0" ? "POST" : "PUT";
    const endpoint =
      selectedEvent.id === "0"
        ? `/api/bookings`
        : `/api/bookings/${selectedEvent.id}`;

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

    try {
      const response = await fetch(`/api/bookings/${selectedEvent.id}`, {
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
        events={Bookings.map((event) => ({
          id: event.id,
          title: event.title,
          start: event.starttime,
          end: event.endtime,
        }))}
        eventClick={handleEventClick}
        select={handleDateSelect}
        height="auto"
      />

      {/* Booking Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-black">
              {selectedEvent.id ? "Edit Booking" : "New Booking"}
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
