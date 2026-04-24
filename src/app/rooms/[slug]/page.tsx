import {
  BanknoteIcon,
  CalendarDaysIcon,
  CheckIcon,
  ClockIcon,
  LayersIcon,
  ShieldCheckIcon,
  ShieldXIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Header } from "@/components/common/header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getRoomBySlug } from "@/db/queries";

import RoomBookingCalendar from "./components/room-booking-calendar";

interface RoomPageProps {
  params: Promise<{ slug: string }>;
}

const RoomPage = async ({ params }: RoomPageProps) => {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);

  if (!room) notFound();

  return (
    <>
      <Header />

      <div className="flex flex-col gap-6 pb-10">
        <div className="relative h-56 w-full overflow-hidden sm:h-72">
          <Image
            src={room.imageUrl}
            alt={room.name}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-5">
            <h1 className="text-2xl font-bold text-white">{room.name}</h1>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-5">
          <Accordion type="multiple" defaultValue={["about", "booking"]}>
            <AccordionItem value="about">
              <AccordionTrigger>Sobre o espaço</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {room.description}
                  </p>

                  {/* Info grid */}
                  <div className="rounded-2xl border divide-y">
                    {/* Price */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <BanknoteIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span className="text-muted-foreground flex-1 text-sm">Preço</span>
                      <span className="text-sm font-medium">
                        {room.priceInCents === 0
                          ? "Gratuito"
                          : `R$ ${(room.priceInCents / 100).toFixed(2).replace(".", ",")}`}
                      </span>
                    </div>
                    {/* Opening hours */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <ClockIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span className="text-muted-foreground flex-1 text-sm">Horário</span>
                      <span className="text-sm font-medium">
                        {room.openingTime.slice(0, 5)} – {room.closingTime.slice(0, 5)}
                      </span>
                    </div>
                    {/* Available weekdays */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <CalendarDaysIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span className="text-muted-foreground flex-1 text-sm">Dias disponíveis</span>
                      <span className="text-right text-sm font-medium">
                        {room.availableWeekDays.length === 7
                          ? "Todos os dias"
                          : room.availableWeekDays
                              .map((d) => ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d])
                              .join(", ")}
                      </span>
                    </div>
                    {/* Capacity */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <UsersIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span className="text-muted-foreground flex-1 text-sm">Capacidade máxima</span>
                      <span className="text-sm font-medium">{room.maxCapacity} pessoas</span>
                    </div>
                    {/* Max simultaneous apartments */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <LayersIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span className="text-muted-foreground flex-1 text-sm">Aptos simultâneos</span>
                      <span className="text-sm font-medium">
                        {room.maxOverlaps === 0 ? "1 por vez" : `Até ${room.maxOverlaps + 1}`}
                      </span>
                    </div>
                    {/* Minor alone */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      {room.minorAloneAllowed ? (
                        <ShieldCheckIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                      ) : (
                        <ShieldXIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                      )}
                      <span className="text-muted-foreground flex-1 text-sm">Menor desacompanhado</span>
                      <span className="text-sm font-medium">
                        {room.minorAloneAllowed ? "Permitido" : "Não permitido"}
                      </span>
                    </div>
                    {/* Daily limit */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <CalendarDaysIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span className="text-muted-foreground flex-1 text-sm">Máx. reservas por dia</span>
                      <span className="text-sm font-medium">{room.maxBookingsDailyLimit}</span>
                    </div>
                    {/* Weekly limit */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <CalendarDaysIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span className="text-muted-foreground flex-1 text-sm">Máx. reservas por semana</span>
                      <span className="text-sm font-medium">{room.maxBookingsWeeklyLimit}</span>
                    </div>
                    {/* Monthly limit */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <CalendarDaysIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span className="text-muted-foreground flex-1 text-sm">Máx. reservas por mês</span>
                      <span className="text-sm font-medium">{room.maxBookingsMonthlyLimit}</span>
                    </div>
                  </div>

                  <Accordion type="multiple" className="w-full">
                    {room.items.length > 0 && (
                      <AccordionItem value="amenities">
                        <AccordionTrigger className="text-sm">
                          Comodidades
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 gap-2">
                            {room.items.map((item) => (
                              <div
                                key={item}
                                className="flex items-center gap-2"
                              >
                                <CheckIcon className="text-primary h-4 w-4 shrink-0" />
                                <span className="text-muted-foreground text-sm">
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {room.rules.length > 0 && (
                      <AccordionItem value="rules">
                        <AccordionTrigger className="text-sm">
                          Regras
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="flex flex-col gap-1.5">
                            {room.rules.map((rule) => (
                              <li
                                key={rule}
                                className="text-muted-foreground flex items-start gap-2 text-sm"
                              >
                                <span className="text-primary mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                                {rule}
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="booking">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="text-primary h-4 w-4" />
                  Selecione uma data
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <RoomBookingCalendar
                  slug={room.slug}
                  openingTime={room.openingTime}
                  closingTime={room.closingTime}
                  availableWeekDays={room.availableWeekDays}
                  dayUse={room.dayUse}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  );
};

export default RoomPage;
