"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from "next/image";

import { type Booking, STATUS_CLASS, STATUS_LABEL } from "@/lib/bookings";
import { cn } from "@/lib/utils";

interface BookingCardProps {
  booking: Booking;
  onClick: () => void;
  /** Show the requester's name — intended for admin views */
  showUser?: boolean;
}

export const BookingCard = ({
  booking,
  onClick,
  showUser = false,
}: BookingCardProps) => {
  const dateFormatted = format(parseISO(booking.startDate), "dd/MM/yyyy", {
    locale: ptBR,
  });
  const weekday = format(parseISO(booking.startDate), "EEE", { locale: ptBR });
  const startTime = format(parseISO(booking.startDate), "HH:mm");
  const endTime = format(parseISO(booking.endDate), "HH:mm");
  const userName = `${booking.user.firstName} ${booking.user.lastName}`;
  const aptLabel = booking.user.apartment.apartmentNumber;

  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:bg-accent w-full rounded-2xl border p-4 text-left transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl">
          <Image
            src={booking.room.imageUrl}
            alt={booking.room.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold">
              {booking.room.name}
            </p>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                STATUS_CLASS[booking.status],
              )}
            >
              {STATUS_LABEL[booking.status]}
            </span>
          </div>
          <p className="text-muted-foreground text-xs capitalize">
            {weekday}, {dateFormatted} · {startTime}–{endTime}
          </p>
          <p className="text-muted-foreground text-xs">
            {showUser ? `${userName} · ` : ""}Apto {aptLabel}
          </p>
        </div>
      </div>
    </button>
  );
};
