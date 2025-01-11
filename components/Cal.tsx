// components/Cal.tsx
"use client";

import React, { useState } from "react";
import { formatISO, parseISO } from "date-fns";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useBooking } from "../hooks/useBooking"; // Make sure this path is correct
import { EventClickArg } from "@fullcalendar/core";

interface Event {
  id: number;
  title: string;
  details: string;
  starttime: string;
  endtime: string;
  user: string; // User ID
}

interface CalProps {
  user: { id: string; email?: string };
  initialBookings: Event[];
}

const Cal: React.FC<CalProps> = ({ user, initialBookings }) => {
  const { createBooking, updateBooking, deleteBooking } = useBooking();
  const [localBookings, setLocalBookings] = useState<Event[]>(initialBookings);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleEventClick = (info: EventClickArg) => {
    const clickedEvent = localBookings.find((b) => String(b.id) === String(info.event.id));
    if (clickedEvent) {
      setSelectedEvent(clickedEvent);
    }
  };

  const handleDateSelect = (selection: { start: Date; end: Date }) => {
    setSelectedEvent({
      id: 0,
      title: '',
      details: '',
      starttime: formatISO(selection.start),
      endtime: formatISO(selection.end),
      user: user.id,
    });
  };

  const saveBooking = async () => {
    if (!selectedEvent) return;

    const payload = {
      ...selectedEvent,
      user: user.id  // Ensure user ID is included in the booking details
    };
    
    const method = selectedEvent.id === 0 ? createBooking : updateBooking;

    try {
      const savedBooking = await method(payload);
      const updatedBookings = selectedEvent.id === 0
        ? [...localBookings, savedBooking]
        : localBookings.map((b) => b.id === savedBooking.id ? {...b, ...savedBooking} : b);
      setLocalBookings(updatedBookings);
      setSelectedEvent(null);
    } catch (err) {
      alert(`Failed to save booking: ${err}`);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent || selectedEvent.id === 0) return;

    try {
      await deleteBooking(selectedEvent.id);
      setLocalBookings(localBookings.filter((b) => b.id !== selectedEvent.id));
      setSelectedEvent(null);
    } catch (err) {
      alert(`Failed to delete booking: ${err}`);
    }
  };

  return (
    <div className="relative w-screen text-black p-6 bg-gray-100">
      <h1 className="text-4xl font-bold mb-6 text-center">Bookings Scheduler</h1>
      <pre className="text-xs font-mono p-3 rounded border px-14 max-h-32 overflow-auto">
          {JSON.stringify(user.id, null, 2)}
        </pre>
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
        events={localBookings.map((event) => ({
          id: String(event.id),
          title: event.title,
          start: event.starttime ? parseISO(event.starttime).toISOString() : undefined,
          end: event.endtime ? parseISO(event.endtime).toISOString() : undefined,
        }))}
        eventClick={handleEventClick}
        select={handleDateSelect}
        height="auto"
      />
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg">
            <h2 className="text-xl font-bold mb-4">{selectedEvent.id === 0 ? "New Booking" : "Edit Booking"}</h2>
            <input
              type="text"
              placeholder="Title"
              className="w-full p-2 border border-gray-300 rounded-md mb-4 bg-white"
              value={selectedEvent.title}
              onChange={(e) => setSelectedEvent({...selectedEvent, title: e.target.value})}
            />
            <textarea
              placeholder="Details"
              className="w-full p-2 border border-gray-300 rounded-md mb-4 bg-white"
              value={selectedEvent.details}
              onChange={(e) => setSelectedEvent({...selectedEvent, details: e.target.value})}
            />
            <input
              type="datetime-local"
              className="w-full p-2 border border-gray-300 rounded-md mb-4 bg-white"
              value={parseISO(selectedEvent.starttime).toISOString().slice(0, -8)}
              onChange={(e) => setSelectedEvent({...selectedEvent, starttime: e.target.value + ":00Z"})}
            />
            <input
              type="datetime-local"
              className="w-full p-2 border border-gray-300 rounded-md mb-4 bg-white"
              value={parseISO(selectedEvent.endtime).toISOString().slice(0, -8)}
              onChange={(e) => setSelectedEvent({...selectedEvent, endtime: e.target.value + ":00Z"})}
            />
            <div className="flex justify-between">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md" onClick={saveBooking}>Save</button>
              {selectedEvent.id !== 0 && (
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md" onClick={handleDelete}>Delete</button>
              )}
              <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md" onClick={() => setSelectedEvent(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cal;
