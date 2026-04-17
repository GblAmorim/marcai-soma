import { type Room, type WeekDay } from "@/lib/rooms";

import { db } from ".";

type DbRoomRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  priceInCents: number;
  openingTime: string;
  closingTime: string;
  availableWeekDays: number[];
  minorAloneAllowed: boolean;
  minAge: number | null;
  floor: "1" | "2" | "3" | "4" | "5" | "28";
  maxCapacity: number;
  maxOverlaps: number;
  dayUse: boolean;
  maxBookingsDailyLimit: number;
  maxBookingsWeeklyLimit: number;
  maxBookingsMonthlyLimit: number;
  category: { id: string; name: string; slug: string };
  rules: { rule: string }[];
  items: { item: string }[];
};

function dbRoomToRoom(row: DbRoomRow): Room {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    imageUrl: row.imageUrl,
    priceInCents: row.priceInCents,
    openingTime: row.openingTime,
    closingTime: row.closingTime,
    floor: row.floor,
    maxCapacity: row.maxCapacity,
    maxOverlaps: row.maxOverlaps,
    dayUse: row.dayUse,
    maxBookingsDailyLimit: row.maxBookingsDailyLimit,
    maxBookingsWeeklyLimit: row.maxBookingsWeeklyLimit,
    maxBookingsMonthlyLimit: row.maxBookingsMonthlyLimit,
    availableWeekDays: row.availableWeekDays as WeekDay[],
    minorAloneAllowed: row.minorAloneAllowed,
    minAge: row.minAge,
    category: {
      id: row.category.id,
      name: row.category.name,
      slug: row.category.slug,
    },
    rules: row.rules.map((r) => r.rule),
    items: row.items.map((i) => i.item),
  };
}

export async function getRooms(): Promise<Room[]> {
  const rows = await db.query.roomTable.findMany({
    where: (r, { isNull }) => isNull(r.deletedAt),
    with: {
      category: true,
      rules: { where: (r, { isNull }) => isNull(r.deletedAt) },
      items: { where: (r, { isNull }) => isNull(r.deletedAt) },
    },
    orderBy: (r, { asc }) => [asc(r.name)],
  });
  return rows.map(dbRoomToRoom);
}

export async function getRoomBySlug(slug: string): Promise<Room | null> {
  const row = await db.query.roomTable.findFirst({
    where: (r, { eq, isNull, and }) =>
      and(eq(r.slug, slug), isNull(r.deletedAt)),
    with: {
      category: true,
      rules: { where: (r, { isNull }) => isNull(r.deletedAt) },
      items: { where: (r, { isNull }) => isNull(r.deletedAt) },
    },
  });
  return row ? dbRoomToRoom(row) : null;
}
