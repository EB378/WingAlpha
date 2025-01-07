"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

interface Event {
  id: string;
  title: string;
  details: string;
  starttime: string; // ISO string
  endtime: string; // ISO string
  userid: string; // User ID
}

const Cal: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [Bookings, setBookings] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newBookingTitle, setNewBookingTitle] = useState<string>("");
  const [starttime, setStarttime] = useState<string>("");
  const [endtime, setEndtime] = useState<string>("");
  const loggedInUser = "00000000-0000-0000-0000-000000000000"; // Mock User ID

  const timeSlots = Array.from({ length: 24 }, (_, i) =>
    `${i.toString().padStart(2, "0")}:00`
  );

  // Fetch Bookings from the server
  const fetchBookings = useCallback(async () => {
    try {
      const response = await fetch(`/api/Bookings?date=${format(selectedDate, "yyyy-MM-dd")}`);
      if (!response.ok) throw new Error("Failed to fetch Bookings");
      const data: Event[] = await response.json();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching Bookings:", error);
    }
  }, [selectedDate]);

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
      userid: loggedInUser,
    });
    setNewBookingTitle("");
  };

  // Handle event click for editing
  const handleEventClick = (info: any) => {
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
    const endpoint = selectedEvent.id === "0" ? `/api/bookings` : `/api/bookings/${selectedEvent.id}`;

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
      fetchBookings();
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
      fetchBookings();
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };


  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <div className="relative w-screen text-black p-6 bg-gray-100">
      <h1 className="text-4xl font-bold mb-6 text-center">Bookings Scheduler</h1>
      <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto text-black">
              {JSON.stringify(Bookings, null, 2)}
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
        events={Bookings.map((event) => ({
          id: event.id,
          title: event.title,
          start: event.starttime,
          end: event.endtime
        }))}
        eventClick={handleEventClick}
        //eventAdd={handleBookingAdd}
        //eventChange={handleBookingChange}
        height="auto"
      />

      {/* Booking Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
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
