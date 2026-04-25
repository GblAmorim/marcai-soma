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

// ── Slot selection helpers ────────────────────────────────────────────────────
// These power the contiguous-block selection UI used by the booking calendar
// and the booking-detail edit sheet.

export type SlotState = "selected" | "edge" | "disabled" | "default";

export function isSlotDisabled(
  slot: string,
  selectedSlots: string[],
  timeSlots: string[],
  maxHours: number,
): boolean {
  if (selectedSlots.length === 0) return false;
  if (selectedSlots.includes(slot)) return false;

  const idx = slotIndex(slot, timeSlots);
  const selectedIndices = selectedSlots.map((s) => slotIndex(s, timeSlots));
  const minIdx = Math.min(...selectedIndices);
  const maxIdx = Math.max(...selectedIndices);

  const extendsLeft = idx === minIdx - 1;
  const extendsRight = idx === maxIdx + 1;

  if (!extendsLeft && !extendsRight) return true;
  if (selectedSlots.length >= maxHours) return true;
  return false;
}

export function toggleSlot(
  slot: string,
  selectedSlots: string[],
  timeSlots: string[],
  maxHours: number,
): string[] {
  if (selectedSlots.includes(slot)) {
    const idx = slotIndex(slot, timeSlots);
    const selectedIndices = selectedSlots.map((s) => slotIndex(s, timeSlots));
    const minIdx = Math.min(...selectedIndices);
    const maxIdx = Math.max(...selectedIndices);
    // Only allow removing from the edges
    if (idx === minIdx || idx === maxIdx) {
      return selectedSlots.filter((s) => s !== slot);
    }
    return selectedSlots;
  }

  if (isSlotDisabled(slot, selectedSlots, timeSlots, maxHours)) {
    return selectedSlots;
  }
  return [...selectedSlots, slot].sort();
}

export function getSlotState(
  slot: string,
  selectedSlots: string[],
  timeSlots: string[],
  maxHours: number,
): SlotState {
  if (selectedSlots.includes(slot)) {
    const selectedIndices = selectedSlots.map((s) => slotIndex(s, timeSlots));
    const minIdx = Math.min(...selectedIndices);
    const maxIdx = Math.max(...selectedIndices);
    const idx = slotIndex(slot, timeSlots);
    return idx === minIdx || idx === maxIdx ? "edge" : "selected";
  }
  return isSlotDisabled(slot, selectedSlots, timeSlots, maxHours)
    ? "disabled"
    : "default";
}
