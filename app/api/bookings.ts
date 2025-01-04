// /app/api/bookings.ts

import { NextApiRequest, NextApiResponse } from "next";

const bookings = [
  {
    title: "Sample Event",
    starttime: "2025-01-03T10:00:00",
    endtime: "2025-01-03T12:00:00",
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json(bookings);
  } else if (req.method === "POST") {
    const newBooking = req.body;
    bookings.push(newBooking);
    return res.status(201).json(newBooking);
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}
