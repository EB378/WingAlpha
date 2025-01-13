// hooks/useBooking.ts
import { useState } from "react";

interface BookingDetails {
  id: number;
  title: string;
  details: string;
  starttime: string;
  endtime: string;
  user: string; // Assuming the user field holds a user identifier.
}

export const useBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiCall = async (
    url: string,
    method: string,
    body: Partial<BookingDetails> = {},
  ) => {
    setLoading(true);
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "API call failed");
      }
      return data;
    } catch (err) {
      setError((err as Error).message);
      throw err; // Re-throw to handle in component
    } finally {
      setLoading(false);
    }
  };

  const createBooking = (booking: BookingDetails) =>
    handleApiCall("/app/api/Bookings", "POST", booking);
  const updateBooking = (booking: BookingDetails) =>
    handleApiCall(`/app/api/Bookings/${booking.id}`, "PUT", booking);
  const deleteBooking = (id: number) =>
    handleApiCall(`/app/api/Bookings/${id}`, "DELETE");

  return { createBooking, updateBooking, deleteBooking, loading, error };
};
