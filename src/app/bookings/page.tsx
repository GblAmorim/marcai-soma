"use client";

import { isBefore, parseISO, startOfDay } from "date-fns";
import { SearchIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { BookingCard } from "@/components/bookings/booking-card";
import { BookingDetail } from "@/components/bookings/booking-detail";
import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import {
  type Booking,
  type BookingStatus,
  MOCK_BOOKINGS,
} from "@/lib/bookings";

const ALL = "all" as const;
type FilterStatus = BookingStatus | typeof ALL;

function isUpcoming(booking: Booking) {
  return (
    booking.status === "active" &&
    !isBefore(parseISO(booking.startDate), startOfDay(new Date()))
  );
}

const BookingsPage = () => {
  const { data: session, isPending } = authClient.useSession();

  const [localBookings, setLocalBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>(ALL);

  const hasActiveFilters = search !== "" || statusFilter !== ALL;
  const clearFilters = () => {
    setSearch("");
    setStatusFilter(ALL);
  };
  const [selected, setSelected] = useState<Booking | null>(null);

  if (!isPending && !session?.user) {
    redirect("/authentication");
  }

  const user = session?.user as
    | (NonNullable<typeof session>["user"] & {
        role?: string;
        apartment?: string;
      })
    | undefined;
  const isAdmin = user?.role === "admin";
  const userApartment = user?.apartment as string | undefined;

  const bookings = useMemo(() => {
    let list = localBookings;
    if (!isAdmin && userApartment)
      list = list.filter(
        (b) => b.user.apartment.apartmentNumber === userApartment,
      );
    if (statusFilter !== ALL)
      list = list.filter((b) => b.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.room.name.toLowerCase().includes(q) ||
          b.user.apartment.apartmentNumber.includes(q) ||
          `${b.user.firstName} ${b.user.lastName}`.toLowerCase().includes(q),
      );
    }
    return [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [localBookings, isAdmin, userApartment, statusFilter, search]);

  const handleSave = (id: string, startDate: string, endDate: string) => {
    setLocalBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, startDate, endDate } : b)),
    );
    toast.success("Reserva atualizada!");
  };

  const handleCancel = (id: string) => {
    setLocalBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
    );
    toast.success("Reserva cancelada.");
  };

  const selectedBooking = selected
    ? (localBookings.find((b) => b.id === selected.id) ?? null)
    : null;

  return (
    <>
      <Header />

      <div className="flex flex-col gap-5 px-5 pb-10">
        <div className="flex items-center justify-between pt-1">
          <h1 className="text-lg font-bold">
            {isAdmin ? "Todas as reservas" : "Minhas reservas"}
          </h1>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={
                isAdmin
                  ? "Buscar por sala, apto ou nome..."
                  : "Buscar por sala..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpar busca
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as FilterStatus)}
          >
            <TabsList className="w-max min-w-full">
              <TabsTrigger value="all" className="flex-1">
                Todas
              </TabsTrigger>
              {/* <TabsTrigger value="pending" className="flex-1">
                Pendentes
              </TabsTrigger> 
              <TabsTrigger value="active" className="flex-1">
                Confirmadas
              </TabsTrigger>*/}
              <TabsTrigger value="completed" className="flex-1">
                Concluídas
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex-1">
                Canceladas
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {bookings.length > 0 ? (
          <div className="flex flex-col gap-3">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onClick={() => setSelected(booking)}
                showUser={isAdmin}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-10 text-center text-sm">
            Nenhuma reserva encontrada.
          </p>
        )}
      </div>

      <BookingDetail
        booking={selectedBooking}
        canModify={!!selectedBooking && isUpcoming(selectedBooking)}
        onClose={() => setSelected(null)}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </>
  );
};

export default BookingsPage;
