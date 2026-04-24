"use client";

import { format, isBefore, startOfDay, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarClockIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { generateTimeSlots, parseHour, slotIndex } from "@/lib/slots";
import { cn } from "@/lib/utils";

interface RoomBookingCalendarProps {
  slug: string;
  openingTime: string; // "HH:MM"
  closingTime: string; // "HH:MM"
  availableWeekDays: number[];
  dayUse: boolean;
}

const RoomBookingCalendar = ({
  slug,
  openingTime,
  closingTime,
  availableWeekDays,
  dayUse,
}: RoomBookingCalendarProps) => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const slotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedDate && slotsRef.current) {
      setTimeout(() => {
        slotsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [selectedDate]);

  const today = startOfDay(new Date());
  const openingHour = parseHour(openingTime);
  const closingHour = parseHour(closingTime);
  const maxHours = closingHour - openingHour;
  const timeSlots = generateTimeSlots(openingHour, closingHour);

  const isDateDisabled = (date: Date): boolean => {
    if (isBefore(date, today)) return true;
    if (!availableWeekDays.includes(date.getDay())) return true;
    return false;
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlots([]);
  };

  const isSlotDisabled = (slot: string): boolean => {
    if (selectedSlots.length === 0) return false;

    const idx = slotIndex(slot, timeSlots);
    const selectedIndices = selectedSlots.map((s) => slotIndex(s, timeSlots));
    const minIdx = Math.min(...selectedIndices);
    const maxIdx = Math.max(...selectedIndices);

    if (selectedSlots.includes(slot)) return false;

    const wouldExtendLeft = idx === minIdx - 1;
    const wouldExtendRight = idx === maxIdx + 1;

    if (!wouldExtendLeft && !wouldExtendRight) return true;
    if (selectedSlots.length >= maxHours) return true;

    return false;
  };

  const handleSlotClick = (slot: string) => {
    if (selectedSlots.includes(slot)) {
      const idx = slotIndex(slot, timeSlots);
      const selectedIndices = selectedSlots.map((s) => slotIndex(s, timeSlots));
      const minIdx = Math.min(...selectedIndices);
      const maxIdx = Math.max(...selectedIndices);

      if (idx === minIdx || idx === maxIdx) {
        setSelectedSlots((prev) => prev.filter((s) => s !== slot));
      }
      return;
    }

    if (isSlotDisabled(slot)) return;
    setSelectedSlots((prev) => [...prev, slot].sort());
  };

  const getSlotState = (
    slot: string,
  ): "selected" | "edge" | "disabled" | "default" => {
    if (selectedSlots.includes(slot)) {
      const selectedIndices = selectedSlots.map((s) => slotIndex(s, timeSlots));
      const minIdx = Math.min(...selectedIndices);
      const maxIdx = Math.max(...selectedIndices);
      const idx = slotIndex(slot, timeSlots);
      if (idx === minIdx || idx === maxIdx) return "edge";
      return "selected";
    }
    if (isSlotDisabled(slot)) return "disabled";
    return "default";
  };

  const startTime = selectedSlots.length ? selectedSlots[0] : null;
  const endHour = selectedSlots.length
    ? openingHour +
      slotIndex(selectedSlots[selectedSlots.length - 1], timeSlots) +
      1
    : null;
  const endTime =
    endHour !== null ? `${String(endHour).padStart(2, "0")}:00` : null;

  const canConfirm = dayUse
    ? !!selectedDate
    : !!(selectedDate && selectedSlots.length > 0);

  const handleConfirm = () => {
    if (!selectedDate) return;
    const dateParam = format(selectedDate, "yyyy-MM-dd");
    if (dayUse) {
      router.push(
        `/rooms/${slug}/booking?date=${dateParam}&start=${openingTime.slice(0, 5)}&end=${closingTime.slice(0, 5)}&dayuse=1`,
      );
      toast.success(
        `Reserva para o dia inteiro em ${format(selectedDate, "dd/MM/yyyy")}!`,
      );
    } else {
      if (!startTime || !endTime) return;
      router.push(
        `/rooms/${slug}/booking?date=${dateParam}&start=${startTime}&end=${endTime}`,
      );
      toast.success(
        `Reserva para ${format(selectedDate, "dd/MM/yyyy")} das ${startTime} às ${endTime}!`,
      );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={isDateDisabled}
          fromMonth={startOfMonth(today)}
          locale={ptBR}
          classNames={{
            selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
          }}
        />
      </div>

      {selectedDate && (
        <div ref={slotsRef} className="flex flex-col gap-3">
          {dayUse ? (
            /* ── Day-use: full day, no slot picker ── */
            <div className="flex items-start gap-3 rounded-2xl border p-4">
              <CalendarClockIcon className="text-primary mt-0.5 h-5 w-5 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold">Reserva por dia</p>
                <p className="text-muted-foreground text-xs">
                  Este espaço é reservado pelo período completo de
                  funcionamento:{" "}
                  <span className="font-medium">
                    {openingTime.slice(0, 5)} às {closingTime.slice(0, 5)}
                  </span>
                  .
                </p>
              </div>
            </div>
          ) : (
            /* ── Regular: slot picker ── */
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Selecione o período</p>
                <p className="text-muted-foreground text-xs">
                  {selectedSlots.length}/{maxHours}h selecionadas
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => {
                  const state = getSlotState(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={state === "disabled"}
                      onClick={() => handleSlotClick(slot)}
                      className={cn(
                        "rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors",
                        state === "selected" &&
                          "bg-primary/20 text-primary border-primary/40",
                        state === "edge" &&
                          "bg-primary text-primary-foreground border-primary",
                        state === "disabled" &&
                          "text-muted-foreground cursor-not-allowed opacity-40",
                        state === "default" &&
                          "hover:border-primary/50 hover:bg-accent cursor-pointer",
                      )}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
              <p className="text-muted-foreground text-xs">
                Clique no primeiro e no último horário para selecionar o bloco.
                Para remover, clique nos horários das extremidades.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border p-4">
              <p className="text-muted-foreground text-xs">Data selecionada</p>
              <p className="text-sm font-semibold">
                {format(selectedDate, "dd/MM/yyyy")}
              </p>
              <p className="text-muted-foreground text-xs capitalize">
                {format(selectedDate, "EEEE", { locale: ptBR })}
              </p>
            </div>

            <div className="rounded-2xl border p-4">
              <p className="text-muted-foreground text-xs">
                Período selecionado
              </p>
              {dayUse ? (
                <>
                  <p className="text-sm font-semibold">Dia todo</p>
                  <p className="text-muted-foreground text-xs">
                    {openingTime.slice(0, 5)} – {closingTime.slice(0, 5)}
                  </p>
                </>
              ) : selectedSlots.length > 0 ? (
                <>
                  <p className="text-sm font-semibold">
                    {startTime} às {endTime}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {selectedSlots.length}h de duração
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">Nenhum horário</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={handleConfirm}
        disabled={!canConfirm}
        size="lg"
        className="w-full"
      >
        {!selectedDate
          ? "Selecione uma data"
          : dayUse
            ? `Reservar dia ${format(selectedDate, "dd/MM/yyyy")}`
            : selectedSlots.length > 0
              ? `Reservar das ${startTime} às ${endTime}`
              : "Selecione um horário"}
      </Button>
    </div>
  );
};

export default RoomBookingCalendar;
