/** Generates an array of hourly time slot strings, e.g. ["08:00", "09:00", ...] */
export function generateTimeSlots(
  openingHour: number,
  closingHour: number,
): string[] {
  const slots: string[] = [];
  for (let h = openingHour; h < closingHour; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
  }
  return slots;
}

/** Returns the index of a slot string within a slots array */
export function slotIndex(slot: string, slots: string[]): number {
  return slots.indexOf(slot);
}

/** Parses a "HH:MM" time string to an integer hour (e.g. "08:30" → 8) */
export function parseHour(timeStr: string): number {
  return parseInt(timeStr.split(":")[0], 10);
}
