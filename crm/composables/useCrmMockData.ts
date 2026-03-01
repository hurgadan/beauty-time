export interface AppointmentRow {
  id: string;
  client: string;
  service: string;
  time: string;
  status:
    | "booked"
    | "confirmed_by_reminder"
    | "completed"
    | "cancelled_by_client"
    | "cancelled_by_staff"
    | "no_show";
}

export function useCrmMockData(): { appointments: AppointmentRow[] } {
  return {
    appointments: [
      {
        id: "a1",
        client: "Lea M.",
        service: "Cut + Styling",
        time: "09:00",
        status: "confirmed_by_reminder",
      },
      {
        id: "a2",
        client: "Jana R.",
        service: "Manicure Premium",
        time: "10:00",
        status: "booked",
      },
      {
        id: "a3",
        client: "Sofia L.",
        service: "Pedicure Classic",
        time: "11:00",
        status: "booked",
      },
    ],
  };
}
