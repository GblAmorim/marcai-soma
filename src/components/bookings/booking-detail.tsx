"use client";

import {
  format,
  getHours,
  isBefore,
  parseISO,
  set,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BuildingIcon,
  CalendarIcon,
  ClockIcon,
  PencilIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { type Booking, STATUS_CLASS, STATUS_LABEL } from "@/lib/bookings";
import { generateTimeSlots, getSlotState, parseHour, slotIndex, toggleSlot } from "@/lib/slots";
import { cn } from "@/lib/utils";

import { DetailRow } from "./detail-row";

type SheetMode = "view" | "edit" | "confirm-cancel";

interface BookingDetailProps {
  booking: Booking | null;
  /** Whether the current user can edit/cancel this booking */
  canModify: boolean;
  /** Show the requester name line in the cancel confirmation — intended for admin views */
  showUser?: boolean;
  onClose: () => void;
  onSave: (id: string, startDate: string, endDate: string) => void;
  onCancel: (id: string) => void;
}

export const BookingDetail = ({
  booking,
  canModify,
  showUser = false,
  onClose,
  onSave,
  onCancel,
}: BookingDetailProps) => {
  const [mode, setMode] = useState<SheetMode>("view");
  const [editDate, setEditDate] = useState<Date | undefined>();
  const [editSlots, setEditSlots] = useState<string[]>([]);

  if (!booking) return null;

  const openingHour = parseHour(booking.room.openingTime);
  const closingHour = parseHour(booking.room.closingTime);
  const timeSlots = generateTimeSlots(openingHour, closingHour);
  const maxHours = closingHour - openingHour;
  const today = startOfDay(new Date());

  const dateFormatted = format(
    parseISO(booking.startDate),
    "EEEE, dd 'de' MMMM 'de' yyyy",
    { locale: ptBR },
  );
  const createdFormatted = format(
    parseISO(booking.createdAt),
    "dd/MM/yyyy 'às' HH:mm",
    { locale: ptBR },
  );

  const startEdit = () => {
    setEditDate(parseISO(booking.startDate));
    const startH = getHours(parseISO(booking.startDate));
    const endH = getHours(parseISO(booking.endDate));
    const pre: string[] = [];
    for (let h = startH; h < endH; h++)
      pre.push(`${String(h).padStart(2, "0")}:00`);
    setEditSlots(pre.filter((s) => timeSlots.includes(s)));
    setMode("edit");
  };

  const handleSave = () => {
    if (!editDate || editSlots.length === 0) return;
    const sorted = [...editSlots].sort();
    const startH = parseInt(sorted[0], 10);
    const endH = parseInt(sorted[sorted.length - 1], 10) + 1;
    const newStart = set(editDate, { hours: startH, minutes: 0, seconds: 0 });
    const newEnd = set(editDate, { hours: endH, minutes: 0, seconds: 0 });
    onSave(booking.id, newStart.toISOString(), newEnd.toISOString());
    setMode("view");
    onClose();
  };

  const handleConfirmCancel = () => {
    onCancel(booking.id);
    setMode("view");
    onClose();
  };

  const handleClose = () => {
    setMode("view");
    onClose();
  };

  return (
    <Sheet
      open={!!booking}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <SheetContent
        side="bottom"
        className="max-h-[92dvh] overflow-y-auto rounded-t-2xl pb-8"
      >
        {/* ── VIEW mode ── */}
        {mode === "view" && (
          <>
            <SheetHeader className="mb-4">
              <SheetTitle>Detalhes da reserva</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={booking.room.imageUrl}
                    alt={booking.room.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">
                    Espaço reservado
                  </p>
                  <p className="font-semibold">{booking.room.name}</p>
                  <span
                    className={cn(
                      "mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                      STATUS_CLASS[booking.status],
                    )}
                  >
                    {STATUS_LABEL[booking.status]}
                  </span>
                </div>
              </div>

              <div className="divide-y rounded-2xl border">
                <DetailRow
                  icon={<CalendarIcon className="h-4 w-4" />}
                  label="Data"
                  value={dateFormatted}
                />
                <DetailRow
                  icon={<ClockIcon className="h-4 w-4" />}
                  label="Horário de entrada"
                  value={format(parseISO(booking.startDate), "HH:mm")}
                />
                <DetailRow
                  icon={<ClockIcon className="h-4 w-4" />}
                  label="Horário de devolução"
                  value={format(parseISO(booking.endDate), "HH:mm")}
                />
                <DetailRow
                  icon={<BuildingIcon className="h-4 w-4" />}
                  label="Apartamento"
                  value={`Apto ${booking.user.apartment.apartmentNumber}`}
                />
                <DetailRow
                  icon={<UserIcon className="h-4 w-4" />}
                  label="Solicitante"
                  value={`${booking.user.firstName} ${booking.user.lastName}`}
                />
              </div>

              <p className="text-muted-foreground text-center text-xs">
                Reserva criada em {createdFormatted} · #{booking.id}
              </p>

              {canModify && (
                <div className="flex flex-col gap-2">
                  <Button onClick={startEdit} className="w-full gap-2">
                    <PencilIcon className="h-4 w-4" />
                    Editar reserva
                  </Button>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive w-full gap-2"
                    onClick={() => setMode("confirm-cancel")}
                  >
                    <Trash2Icon className="h-4 w-4" />
                    Cancelar reserva
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── EDIT mode ── */}
        {mode === "edit" && (
          <>
            <SheetHeader className="mb-4">
              <SheetTitle>Editar reserva</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-2 text-sm font-medium">Nova data</p>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={editDate}
                    onSelect={(d) => {
                      setEditDate(d);
                      setEditSlots([]);
                    }}
                    disabled={(d) => isBefore(d, today)}
                    fromMonth={startOfMonth(today)}
                    locale={ptBR}
                    classNames={{
                      selected:
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
                    }}
                  />
                </div>
              </div>

              {editDate && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Horário</p>
                    <p className="text-muted-foreground text-xs">
                      {editSlots.length}/{maxHours}h selecionadas
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((slot) => {
                      const state = getSlotState(
                        slot,
                        editSlots,
                        timeSlots,
                        maxHours,
                      );
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={state === "disabled"}
                          onClick={() =>
                            setEditSlots(
                              toggleSlot(slot, editSlots, timeSlots, maxHours),
                            )
                          }
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
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setMode("view")}
                >
                  Voltar
                </Button>
                <Button
                  className="flex-1"
                  disabled={!editDate || editSlots.length === 0}
                  onClick={handleSave}
                >
                  Salvar alterações
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ── CONFIRM CANCEL mode ── */}
        {mode === "confirm-cancel" && (
          <>
            <SheetHeader className="mb-4">
              <SheetTitle>Cancelar reserva</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-5">
              <div className="bg-destructive/10 rounded-2xl p-4 text-center">
                <Trash2Icon className="text-destructive mx-auto mb-2 h-8 w-8" />
                <p className="font-semibold">Tem certeza?</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {showUser && (
                    <>
                      A reserva de{" "}
                      <strong>
                        {booking.user.firstName} {booking.user.lastName}
                      </strong>{" "}
                      no{" "}
                    </>
                  )}
                  {!showUser && <>A reserva de </>}
                  <strong>{booking.room.name}</strong> em{" "}
                  <strong>
                    {format(parseISO(booking.startDate), "dd/MM/yyyy")}
                  </strong>{" "}
                  será cancelada. Essa ação não pode ser desfeita.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setMode("view")}
                >
                  Voltar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleConfirmCancel}
                >
                  Confirmar cancelamento
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
