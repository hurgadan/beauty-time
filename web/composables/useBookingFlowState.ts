export interface BookingServiceOption {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
}

export interface BookingStaffOption {
  id: string;
  fullName: string;
  role: "owner" | "staff";
}

export interface BookingFlowState {
  service: BookingServiceOption | null;
  staff: BookingStaffOption | null;
  dateIso: string;
  slotIso: string;
  clientName: string;
  clientEmail: string;
  otp: string;
  clientToken: string;
  appointmentId: string;
}

function createInitialState(): BookingFlowState {
  return {
    service: null,
    staff: null,
    dateIso: new Date().toISOString().slice(0, 10),
    slotIso: "",
    clientName: "",
    clientEmail: "",
    otp: "",
    clientToken: "",
    appointmentId: "",
  };
}

export function useBookingFlowState(): {
  flow: Ref<BookingFlowState>;
  resetFlow: () => void;
} {
  const flow = useState<BookingFlowState>(
    "booking-flow-state",
    createInitialState,
  );

  function resetFlow(): void {
    flow.value = createInitialState();
  }

  return { flow, resetFlow };
}
