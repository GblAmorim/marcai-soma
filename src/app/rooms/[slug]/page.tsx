import {
  CalendarDaysIcon,
  CheckIcon,
  LayersIcon,
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
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                      <UsersIcon className="text-primary h-4 w-4" />
                      <span className="text-sm font-medium">
                        Até {room.maxCapacity} pessoas
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <LayersIcon className="text-primary h-4 w-4" />
                      <span className="text-sm font-medium">
                        Andar {room.floor}
                      </span>
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
