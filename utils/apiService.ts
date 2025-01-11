// utils/apiService.ts
interface BookingDetails {
    id?: number;
    title: string;
    details: string;
    starttime: string;
    endtime: string;
    user: string;
  }

export const createBooking = async (bookingDetails: BookingDetails): Promise<any> => {
  try {
    const response = await fetch('/api/Bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingDetails),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create booking');
    return data;
  } catch (error) {
    const e = error as Error;
    console.error("API Error:", e.message);
    throw e;
  }
};
