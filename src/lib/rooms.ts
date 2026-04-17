export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface Room {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  /** Usage fee in BRL cents (0 = free) */
  priceInCents: number;
  /** Opening time in "HH:MM" format */
  openingTime: string;
  /** Closing time in "HH:MM" format */
  closingTime: string;
  /** Floor where the room is located */
  floor: string;
  /** Maximum number of people allowed */
  maxCapacity: number;
  /** Maximum simultaneous bookings allowed (0 = only one at a time) */
  maxOverlaps: number;
  /** Whether the room is bookable for the full day */
  dayUse: boolean;
  maxBookingsDailyLimit: number;
  maxBookingsWeeklyLimit: number;
  maxBookingsMonthlyLimit: number;
  /** Days of the week the room is available (0=Sun … 6=Sat) */
  availableWeekDays: WeekDay[];
  /** Whether minors are allowed unaccompanied */
  minorAloneAllowed: boolean;
  /** Minimum age required (null = no restriction) */
  minAge: number | null;
  category: { id: string; name: string; slug: string };
  rules: string[];
  /** Items / amenities available in the room */
  items: string[];
}

export const ROOMS: Room[] = [
  {
    id: "static-1",
    slug: "salao-de-festa-1",
    name: "Salão de Festa 1",
    description:
      "Espaço amplo para festas e eventos. Capacidade para até 100 pessoas, com cozinha equipada e área de lazer.",
    imageUrl: "/banner-01.png",
    priceInCents: 0,
    openingTime: "08:00",
    closingTime: "24:00",
    floor: "1",
    maxCapacity: 100,
    maxOverlaps: 0,
    dayUse: false,
    maxBookingsDailyLimit: 1,
    maxBookingsWeeklyLimit: 1,
    maxBookingsMonthlyLimit: 1,
    availableWeekDays: [0, 1, 2, 3, 4, 5, 6],
    minorAloneAllowed: false,
    minAge: 18,
    category: { id: "c1", name: "Salão de Festas", slug: "salao-de-festas" },
    rules: [
      "Reserva máxima de 4 horas",
      "Limpeza obrigatória ao término",
      "Proibido animais de estimação",
      "Encerramento até meia-noite",
    ],
    items: [
      "Cozinha equipada",
      "Sistema de som",
      "Projetor",
      "Ar-condicionado",
      "Banheiros",
      "Estacionamento",
    ],
  },
  {
    id: "static-2",
    slug: "churrasqueira-1",
    name: "Churrasqueira 1",
    description:
      "Espaço amplo para churrascos e eventos. Capacidade para até 50 pessoas, com churrasqueira equipada e área de lazer.",
    imageUrl: "/banner-02.png",
    priceInCents: 10000,
    openingTime: "08:00",
    closingTime: "24:00",
    floor: "5",
    maxCapacity: 50,
    maxOverlaps: 0,
    dayUse: false,
    maxBookingsDailyLimit: 1,
    maxBookingsWeeklyLimit: 1,
    maxBookingsMonthlyLimit: 1,
    availableWeekDays: [0, 1, 2, 3, 4, 5, 6],
    minorAloneAllowed: false,
    minAge: 18,
    category: { id: "c2", name: "Churrasqueira", slug: "churrasqueira" },
    rules: [
      "Reserva diária",
      "Limpeza obrigatória ao término",
      "Proibido animais de estimação",
      "Encerramento até meia-noite",
    ],
    items: [
      "Churrasqueira equipada",
      "Pia",
      "Mesa de sinuca",
      "Piscina",
      "Banheiros",
      "Mesas e cadeiras",
    ],
  },
  {
    id: "static-3",
    slug: "sala-de-musica",
    name: "Sala de Música",
    description:
      "Espaço para ensaios e apresentações musicais. Capacidade para até 20 pessoas, com equipamentos de som e instrumentos disponíveis.",
    imageUrl: "/banner-02.png",
    priceInCents: 10000,
    openingTime: "08:00",
    closingTime: "22:00",
    floor: "5",
    maxCapacity: 20,
    maxOverlaps: 0,
    dayUse: false,
    maxBookingsDailyLimit: 1,
    maxBookingsWeeklyLimit: 1,
    maxBookingsMonthlyLimit: 1,
    availableWeekDays: [0, 1, 2, 3, 4, 5, 6],
    minorAloneAllowed: true,
    minAge: null,
    category: { id: "c3", name: "Sala de Música", slug: "sala-de-musica" },
    rules: [
      "Reserva mínima de 1 hora",
      "Limpeza obrigatória ao término",
      "Proibido animais de estimação",
      "Encerramento até 22:00",
    ],
    items: [
      "Instrumentos musicais",
      "Sistema de som",
      "Microfones",
      "Banheiros",
      "Mesas e cadeiras",
    ],
  },
];

export function getRoomBySlug(slug: string): Room | undefined {
  return ROOMS.find((room) => room.slug === slug);
}
