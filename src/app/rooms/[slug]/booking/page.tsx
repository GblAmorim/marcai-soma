"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BuildingIcon, CalendarIcon, CheckCircleIcon, ClockIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { getRoomBySlug } from "@/lib/rooms";

const BookingConfirmPage = () => {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const room = getRoomBySlug(params.slug);
  if (!room) notFound();

  const dateParam = searchParams.get("date");
  const startTime = searchParams.get("start");
  const endTime = searchParams.get("end");

  if (!dateParam || !startTime || !endTime) notFound();

  const dateFormatted = format(
    parseISO(dateParam),
    "EEEE, dd 'de' MMMM 'de' yyyy",
    { locale: ptBR },
  );

  const user = session?.user as
    | (typeof session.user & { apartment?: string })
    | undefined;

  const handleConfirm = () => {
    toast.success("Reserva confirmada com sucesso!");
    router.push("/bookings");
  };

  return (
    <>
      <Header />

      <div className="flex flex-col gap-6 px-5 pb-10">
        <div className="pt-1">
          <h1 className="text-lg font-bold">Confirmar reserva</h1>
          <p className="text-muted-foreground text-sm">
            Revise os detalhes antes de confirmar.
          </p>
        </div>

        <div className="divide-y rounded-2xl border">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-muted-foreground shrink-0">
              <BuildingIcon className="h-4 w-4" />
            </span>
            <div className="flex flex-1 items-center justify-between gap-2">
              <span className="text-muted-foreground text-sm">Espaço</span>
              <span className="text-right text-sm font-medium">{room.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-muted-foreground shrink-0">
              <CalendarIcon className="h-4 w-4" />
            </span>
            <div className="flex flex-1 items-center justify-between gap-2">
              <span className="text-muted-foreground text-sm">Data</span>
              <span className="text-right text-sm font-medium capitalize">{dateFormatted}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-muted-foreground shrink-0">
              <ClockIcon className="h-4 w-4" />
            </span>
            <div className="flex flex-1 items-center justify-between gap-2">
              <span className="text-muted-foreground text-sm">Horário</span>
              <span className="text-right text-sm font-medium">
                {startTime} – {endTime}
              </span>
            </div>
          </div>
          {user?.apartment && (
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-muted-foreground shrink-0">
                <BuildingIcon className="h-4 w-4" />
              </span>
              <div className="flex flex-1 items-center justify-between gap-2">
                <span className="text-muted-foreground text-sm">Apartamento</span>
                <span className="text-right text-sm font-medium">
                  Apto {user.apartment}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleConfirm} className="w-full gap-2">
            <CheckCircleIcon className="h-4 w-4" />
            Confirmar reserva
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.back()}
          >
            Voltar
          </Button>
        </div>
      </div>
    </>
  );
};

export default BookingConfirmPage;
