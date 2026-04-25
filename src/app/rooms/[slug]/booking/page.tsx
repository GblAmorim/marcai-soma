"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeftIcon,
  BuildingIcon,
  CalendarIcon,
  ClockIcon,
} from "lucide-react";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { getRoomBySlug } from "@/lib/rooms";

import SwipeBack from "../components/swipe-back";
import { ConfirmBookingButton } from "./components/confirm-booking-button";

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
  const isDayUse = searchParams.get("dayuse") === "1";

  if (!dateParam) notFound();
  if (!isDayUse && (!startTime || !endTime)) notFound();

  const resolvedStart = isDayUse ? room.openingTime.slice(0, 5) : startTime!;
  const resolvedEnd = isDayUse ? room.closingTime.slice(0, 5) : endTime!;

  const dateFormatted = format(
    parseISO(dateParam),
    "EEEE, dd 'de' MMMM 'de' yyyy",
    { locale: ptBR },
  );

  const user = session?.user as
    | ({ apartment?: string } & Record<string, unknown>)
    | undefined;

  return (
    <>
      <Header />
      <SwipeBack href={`/rooms/${params.slug}`} />

      <div className="flex flex-col gap-6 px-5 pb-10">
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => router.push(`/rooms/${params.slug}`)}
            aria-label="Voltar para a sala"
            className="text-muted-foreground hover:text-foreground -ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Confirmar reserva</h1>
            <p className="text-muted-foreground text-sm">
              Revise os detalhes antes de confirmar.
            </p>
          </div>
        </div>

        <div className="divide-y rounded-2xl border">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-muted-foreground shrink-0">
              <BuildingIcon className="h-4 w-4" />
            </span>
            <div className="flex flex-1 items-center justify-between gap-2">
              <span className="text-muted-foreground text-sm">Espaço</span>
              <span className="text-right text-sm font-medium">
                {room.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-muted-foreground shrink-0">
              <CalendarIcon className="h-4 w-4" />
            </span>
            <div className="flex flex-1 items-center justify-between gap-2">
              <span className="text-muted-foreground text-sm">Data</span>
              <span className="text-right text-sm font-medium capitalize">
                {dateFormatted}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-muted-foreground shrink-0">
              <ClockIcon className="h-4 w-4" />
            </span>
            <div className="flex flex-1 items-center justify-between gap-2">
              <span className="text-muted-foreground text-sm">Horário</span>
              <span className="text-right text-sm font-medium">
                {isDayUse ? "Dia todo" : `${resolvedStart} – ${resolvedEnd}`}
              </span>
            </div>
          </div>
          {user?.apartment && (
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-muted-foreground shrink-0">
                <BuildingIcon className="h-4 w-4" />
              </span>
              <div className="flex flex-1 items-center justify-between gap-2">
                <span className="text-muted-foreground text-sm">
                  Apartamento
                </span>
                <span className="text-right text-sm font-medium">
                  Apto {user.apartment}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <ConfirmBookingButton
            slug={params.slug}
            date={dateParam}
            startTime={resolvedStart}
            endTime={resolvedEnd}
          />
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
