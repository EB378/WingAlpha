// Assuming the user field stores the user's ID or an object containing user details
interface BookingDetails {
  id: number;
  title: string;
  details: string;
  starttime: string;
  endtime: string;
  user: string; // This could also be an object if more user details are needed
}
