export type BookingStatus = "pending" | "active" | "completed" | "cancelled";

export interface BookingRoom {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
  openingTime: string; // "HH:MM"
  closingTime: string; // "HH:MM"
}

export interface BookingApartment {
  tower: string;
  apartmentNumber: string;
  apartmentBlock: string;
}

export interface BookingUser {
  id: string;
  firstName: string;
  lastName: string;
  apartment: BookingApartment;
}

export interface Booking {
  id: string;
  startDate: string; // ISO timestamp
  endDate: string; // ISO timestamp
  status: BookingStatus;
  createdAt: string; // ISO string
  room: BookingRoom;
  user: BookingUser;
}

// Mock data — replace with real DB calls when backend is ready
export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "bk-001",
    startDate: "2026-04-15T14:00:00.000Z",
    endDate: "2026-04-15T18:00:00.000Z",
    status: "active",
    createdAt: "2026-04-10T10:00:00Z",
    room: {
      id: "r1",
      slug: "salao-de-festa-1",
      name: "Salão de Festa 1",
      imageUrl: "/banner-01.png",
      openingTime: "08:00",
      closingTime: "24:00",
    },
    user: {
      id: "u1",
      firstName: "João",
      lastName: "Silva",
      apartment: { tower: "1", apartmentNumber: "101", apartmentBlock: "A" },
    },
  },
  {
    id: "bk-002",
    startDate: "2026-04-20T18:00:00.000Z",
    endDate: "2026-04-20T22:00:00.000Z",
    status: "active",
    createdAt: "2026-04-10T12:00:00Z",
    room: {
      id: "r1",
      slug: "salao-de-festa-1",
      name: "Salão de Festa 1",
      imageUrl: "/banner-01.png",
      openingTime: "08:00",
      closingTime: "24:00",
    },
    user: {
      id: "u2",
      firstName: "Maria",
      lastName: "Souza",
      apartment: { tower: "2", apartmentNumber: "202", apartmentBlock: "B" },
    },
  },
  {
    id: "bk-003",
    startDate: "2026-04-05T10:00:00.000Z",
    endDate: "2026-04-05T14:00:00.000Z",
    status: "completed",
    createdAt: "2026-04-01T08:00:00Z",
    room: {
      id: "r1",
      slug: "salao-de-festa-1",
      name: "Salão de Festa 1",
      imageUrl: "/banner-01.png",
      openingTime: "08:00",
      closingTime: "24:00",
    },
    user: {
      id: "u1",
      firstName: "João",
      lastName: "Silva",
      apartment: { tower: "1", apartmentNumber: "101", apartmentBlock: "A" },
    },
  },
];

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pendente",
  active: "Confirmada",
  completed: "Concluída",
  cancelled: "Cancelada",
};

export const STATUS_CLASS: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
  completed: "bg-zinc-100 text-zinc-500",
};
