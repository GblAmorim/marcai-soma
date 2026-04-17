"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ClockIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  type Resolver,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { SectionHeading } from "@/components/admin/section-heading";
import { ToggleChip } from "@/components/admin/toggle-chip";
import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import {
  type QuotaPeriod,
  type Room,
  type RoomItem,
  ROOMS,
  type WeekDay,
} from "@/lib/rooms";

// ── Constants ─────────────────────────────────────────────────

const WEEK_DAYS: { label: string; value: WeekDay }[] = [
  { label: "Dom", value: 0 },
  { label: "Seg", value: 1 },
  { label: "Ter", value: 2 },
  { label: "Qua", value: 3 },
  { label: "Qui", value: 4 },
  { label: "Sex", value: 5 },
  { label: "Sáb", value: 6 },
];

const QUOTA_PERIOD_LABELS: Record<QuotaPeriod, string> = {
  day: "por dia",
  week: "por semana",
  month: "por mês",
};

const textareaClass =
  "border-input placeholder:text-muted-foreground flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-1";

// ── Schema ────────────────────────────────────────────────────

const itemSchema = z.object({
  name: z.string().min(1, "Obrigatório"),
  quantity: z.coerce.number().int().min(1, "Mínimo 1"),
  note: z.string().optional(),
});

const roomSchema = z.object({
  name: z.string().min(1, "Obrigatório"),
  slug: z
    .string()
    .min(1, "Obrigatório")
    .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífens"),
  openingHour: z.coerce.number().int().min(0).max(23),
  closingHour: z.coerce.number().int().min(1).max(24),
  availableWeekDays: z
    .array(z.coerce.number().int().min(0).max(6))
    .min(1, "Selecione ao menos um dia"),
  closedDates: z.string(),
  minorAllowedAlone: z.boolean(),
  hasMinAge: z.boolean(),
  minAge: z.coerce.number().int().min(0).max(120).optional(),
  floor: z.string().min(1, "Obrigatório"),
  description: z.string().min(1, "Obrigatório"),
  hasFee: z.boolean(),
  usageFeeInCents: z.coerce.number().int().min(0).optional(),
  rules: z.string().min(1, "Informe ao menos uma regra"),
  items: z.array(itemSchema),
  maxConcurrentBookings: z.coerce.number().int().min(1),
  capacity: z.coerce.number().int().min(1, "Mínimo 1"),
  maxBookingsPerPeriod: z.coerce.number().int().min(1),
  quotaPeriod: z.enum(["day", "week", "month"]),
  imageUrl: z.string().min(1, "Obrigatório"),
  area: z.string().min(1, "Obrigatório"),
  category: z.string().min(1, "Obrigatório"),
  amenities: z.string(),
  maxHours: z.coerce.number().int().min(1),
});

type RoomFormValues = z.infer<typeof roomSchema>;

// ── Helpers ───────────────────────────────────────────────────

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function roomToForm(room: Room): RoomFormValues {
  return {
    name: room.name,
    slug: room.slug,
    openingHour: room.openingHour,
    closingHour: room.closingHour,
    availableWeekDays: [...room.availableWeekDays],
    closedDates: room.closedDates.join(", "),
    minorAllowedAlone: room.minorAllowedAlone,
    hasMinAge: room.minAge !== undefined && room.minAge > 0,
    minAge: room.minAge ?? 0,
    floor: room.floor,
    description: room.description,
    hasFee: (room.usageFeeInCents ?? 0) > 0,
    usageFeeInCents: room.usageFeeInCents ?? 0,
    rules: room.rules.join("\n"),
    items: room.items.map((i) => ({ ...i })),
    maxConcurrentBookings: room.maxConcurrentBookings,
    capacity: room.capacity,
    maxBookingsPerPeriod: room.maxBookingsPerPeriod,
    quotaPeriod: room.quotaPeriod,
    imageUrl: room.imageUrl,
    area: room.area,
    category: room.category,
    amenities: room.amenities.join("\n"),
    maxHours: room.maxHours,
  };
}

function formToRoom(values: RoomFormValues, existing?: Room): Room {
  return {
    slug: values.slug,
    name: values.name,
    description: values.description,
    imageUrl: values.imageUrl,
    capacity: values.capacity,
    area: values.area,
    category: values.category,
    floor: values.floor,
    amenities: values.amenities
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    rules: values.rules
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    items: values.items as RoomItem[],
    bookedDates: existing?.bookedDates ?? [],
    openingHour: values.openingHour,
    closingHour: values.closingHour,
    maxHours: values.maxHours,
    availableWeekDays: values.availableWeekDays as WeekDay[],
    closedDates: values.closedDates
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    minorAllowedAlone: values.minorAllowedAlone,
    minAge: values.hasMinAge ? values.minAge : undefined,
    usageFeeInCents: values.hasFee ? values.usageFeeInCents : 0,
    maxConcurrentBookings: values.maxConcurrentBookings,
    maxBookingsPerPeriod: values.maxBookingsPerPeriod,
    quotaPeriod: values.quotaPeriod,
  };
}

const DEFAULT_VALUES: RoomFormValues = {
  name: "",
  slug: "",
  openingHour: 8,
  closingHour: 22,
  availableWeekDays: [1, 2, 3, 4, 5, 6],
  closedDates: "",
  minorAllowedAlone: false,
  hasMinAge: false,
  minAge: 0,
  floor: "",
  description: "",
  hasFee: false,
  usageFeeInCents: 0,
  rules: "",
  items: [],
  maxConcurrentBookings: 1,
  capacity: 50,
  maxBookingsPerPeriod: 1,
  quotaPeriod: "week",
  imageUrl: "/banner-01.png",
  area: "",
  category: "",
  amenities: "",
  maxHours: 4,
};

// ── Room form sheet ───────────────────────────────────────────

interface RoomFormSheetProps {
  open: boolean;
  onClose: () => void;
  editRoom: Room | null;
  onSave: (room: Room, isNew: boolean) => void;
}

const RoomFormSheet = ({
  open,
  onClose,
  editRoom,
  onSave,
}: RoomFormSheetProps) => {
  const isNew = !editRoom;

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema) as Resolver<RoomFormValues>,
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      form.reset(editRoom ? roomToForm(editRoom) : DEFAULT_VALUES);
    }
    // form.reset is stable across renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editRoom]);

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control: form.control, name: "items" });

  const hasMinAge = useWatch({ control: form.control, name: "hasMinAge" });
  const hasFee = useWatch({ control: form.control, name: "hasFee" });
  const availableWeekDays = useWatch({
    control: form.control,
    name: "availableWeekDays",
  });

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      form.reset();
      onClose();
    }
  };

  const onSubmit = (values: RoomFormValues) => {
    const room = formToRoom(values, editRoom ?? undefined);
    onSave(room, isNew);
    form.reset();
    onClose();
  };

  const toggleWeekDay = (day: WeekDay) => {
    const current = form.getValues("availableWeekDays") as WeekDay[];
    if (current.includes(day)) {
      form.setValue(
        "availableWeekDays",
        current.filter((d) => d !== day),
        { shouldValidate: true },
      );
    } else {
      form.setValue(
        "availableWeekDays",
        [...current, day].sort() as WeekDay[],
        { shouldValidate: true },
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[95dvh] overflow-y-auto rounded-t-2xl pb-10"
      >
        <SheetHeader className="mb-4">
          <SheetTitle>{isNew ? "Cadastrar sala" : "Editar sala"}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            {/* ── Identificação ── */}
            <SectionHeading>Identificação</SectionHeading>

            <div className="grid grid-cols-2 gap-3">
              {/* 1. Nome */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nome da sala</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Salão de Festa 1"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (isNew)
                            form.setValue("slug", toSlug(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="salao-de-festa-1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Input placeholder="Salão de Festas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 8. Andar */}
              <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Andar</FormLabel>
                    <FormControl>
                      <Input placeholder="Térreo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área</FormLabel>
                    <FormControl>
                      <Input placeholder="200m²" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>URL da imagem</FormLabel>
                    <FormControl>
                      <Input placeholder="/banner-01.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 9. Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <textarea
                      rows={3}
                      placeholder="Descreva o espaço..."
                      className={textareaClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Horários e disponibilidade ── */}
            <SectionHeading>Horários e disponibilidade</SectionHeading>

            <div className="grid grid-cols-3 gap-3">
              {/* 2. Abertura */}
              <FormField
                control={form.control}
                name="openingHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Abertura</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={23} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 3. Fechamento */}
              <FormField
                control={form.control}
                name="closingHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fechamento</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={24} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máx. horas</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 4. Dias da semana */}
            <FormField
              control={form.control}
              name="availableWeekDays"
              render={() => (
                <FormItem>
                  <FormLabel>Dias disponíveis</FormLabel>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {WEEK_DAYS.map((d) => (
                      <ToggleChip
                        key={d.value}
                        label={d.label}
                        active={(availableWeekDays as number[]).includes(
                          d.value,
                        )}
                        onClick={() => toggleWeekDay(d.value)}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 5. Dias fechados */}
            <FormField
              control={form.control}
              name="closedDates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Datas fechadas{" "}
                    <span className="text-muted-foreground font-normal">
                      (separadas por vírgula, ex: 2026-12-25)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="2026-12-25, 2027-01-01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Restrições de acesso ── */}
            <SectionHeading>Restrições de acesso</SectionHeading>

            {/* 6. Menor desacompanhado */}
            <FormField
              control={form.control}
              name="minorAllowedAlone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Menor pode entrar desacompanhado?</FormLabel>
                  <div className="flex gap-2 pt-1">
                    <ToggleChip
                      label="Sim"
                      active={field.value === true}
                      onClick={() => field.onChange(true)}
                    />
                    <ToggleChip
                      label="Não"
                      active={field.value === false}
                      onClick={() => field.onChange(false)}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 7. Idade mínima */}
            <FormField
              control={form.control}
              name="hasMinAge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exige idade mínima?</FormLabel>
                  <div className="flex gap-2 pt-1">
                    <ToggleChip
                      label="Sim"
                      active={field.value === true}
                      onClick={() => field.onChange(true)}
                    />
                    <ToggleChip
                      label="Não"
                      active={field.value === false}
                      onClick={() => field.onChange(false)}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {hasMinAge && (
              <FormField
                control={form.control}
                name="minAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idade mínima (anos)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={120} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* ── Capacidade e limites ── */}
            <SectionHeading>Capacidade e limites de reserva</SectionHeading>

            <div className="grid grid-cols-2 gap-3">
              {/* 14. Máximo de pessoas */}
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máx. pessoas</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 13. Máx. reservas simultâneas */}
              <FormField
                control={form.control}
                name="maxConcurrentBookings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reservas simultâneas</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 15. Cota por período */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="maxBookingsPerPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máx. reservas por período</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quotaPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Período</FormLabel>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(["day", "week", "month"] as const).map((p) => (
                        <ToggleChip
                          key={p}
                          label={QUOTA_PERIOD_LABELS[p]}
                          active={field.value === p}
                          onClick={() => field.onChange(p)}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ── Cobrança ── */}
            <SectionHeading>Cobrança</SectionHeading>

            {/* 10. Valor de uso */}
            <FormField
              control={form.control}
              name="hasFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cobrar pelo uso?</FormLabel>
                  <div className="flex gap-2 pt-1">
                    <ToggleChip
                      label="Sim"
                      active={field.value === true}
                      onClick={() => field.onChange(true)}
                    />
                    <ToggleChip
                      label="Não (gratuito)"
                      active={field.value === false}
                      onClick={() => field.onChange(false)}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {hasFee && (
              <FormField
                control={form.control}
                name="usageFeeInCents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Valor{" "}
                      <span className="text-muted-foreground font-normal">
                        (centavos — ex: 5000 = R$ 50,00)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={100} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* ── Conteúdo do espaço ── */}
            <SectionHeading>Conteúdo do espaço</SectionHeading>

            <FormField
              control={form.control}
              name="amenities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comodidades (uma por linha)</FormLabel>
                  <FormControl>
                    <textarea
                      rows={3}
                      placeholder={
                        "Cozinha equipada\nSistema de som\nAr-condicionado"
                      }
                      className={textareaClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 11. Regras */}
            <FormField
              control={form.control}
              name="rules"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Regras (uma por linha)</FormLabel>
                  <FormControl>
                    <textarea
                      rows={4}
                      placeholder={
                        "Reserva mínima de 4 horas\nLimpeza obrigatória ao término"
                      }
                      className={textareaClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 12. Itens da sala */}
            <FormItem>
              <FormLabel>
                Itens disponíveis na sala{" "}
                <span className="text-muted-foreground font-normal">
                  (opcional)
                </span>
              </FormLabel>
              <p className="text-muted-foreground mb-2 text-xs">
                Ex: pipoqueira (levar o milho), mesas (conferir ao sair)
              </p>

              <div className="flex flex-col gap-3">
                {itemFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-start gap-2 rounded-lg border p-3"
                  >
                    <div className="grid flex-1 grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.name`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Item</FormLabel>
                            <FormControl>
                              <Input placeholder="Pipoqueira" {...f} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Qtd</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} {...f} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.note`}
                        render={({ field: f }) => (
                          <FormItem className="col-span-2">
                            <FormLabel className="text-xs">
                              Observação (opcional)
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Levar o milho" {...f} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive mt-6 h-8 w-8 shrink-0"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() =>
                    appendItem({ name: "", quantity: 1, note: "" })
                  }
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  Adicionar item
                </Button>
              </div>
            </FormItem>

            {/* ── Actions ── */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  form.reset();
                  onClose();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {isNew ? "Cadastrar sala" : "Salvar alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

// ── Admin room card ────────────────────────────────────────────

interface AdminRoomCardProps {
  room: Room;
  onEdit: () => void;
  onDelete: () => void;
}

const AdminRoomCard = ({ room, onEdit, onDelete }: AdminRoomCardProps) => (
  <div className="overflow-hidden rounded-2xl border">
    <div className="relative h-36 w-full">
      <Image
        src={room.imageUrl}
        alt={room.name}
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
      <div className="absolute bottom-0 left-0 p-3">
        <p className="text-sm font-bold text-white">{room.name}</p>
        <p className="text-xs text-white/80">
          {room.category} · {room.floor}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3 px-4 py-3">
      <div className="text-muted-foreground flex flex-1 gap-3 text-xs">
        <span className="flex items-center gap-1">
          <UsersIcon className="h-3.5 w-3.5" />
          {room.capacity} pessoas
        </span>
        <span className="flex items-center gap-1">
          <ClockIcon className="h-3.5 w-3.5" />
          {String(room.openingHour).padStart(2, "0")}:00–
          {String(room.closingHour).padStart(2, "0")}:00
        </span>
      </div>

      <div className="flex gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={onEdit}
        >
          <PencilIcon className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="text-destructive hover:text-destructive h-8 w-8"
          onClick={onDelete}
        >
          <Trash2Icon className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────

const AdminRoomsPage = () => {
  const { data: session, isPending } = authClient.useSession();

  const [localRooms, setLocalRooms] = useState<Room[]>(ROOMS);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const user = session?.user as
    | (NonNullable<typeof session>["user"] & { role?: string })
    | undefined;

  if (!isPending && user?.role !== "admin") {
    redirect("/");
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return localRooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q),
    );
  }, [localRooms, search]);

  const openCreate = () => {
    setEditingRoom(null);
    setSheetOpen(true);
  };

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setSheetOpen(true);
  };

  const handleSave = (room: Room, isNew: boolean) => {
    if (isNew) {
      setLocalRooms((prev) => [...prev, room]);
      toast.success("Sala cadastrada!");
    } else {
      setLocalRooms((prev) =>
        prev.map((r) => (r.slug === room.slug ? room : r)),
      );
      toast.success("Sala atualizada!");
    }
  };

  const handleDelete = (slug: string) => {
    setLocalRooms((prev) => prev.filter((r) => r.slug !== slug));
    toast.success("Sala removida.");
  };

  return (
    <>
      <Header />

      <div className="flex flex-col gap-5 px-5 pb-10">
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <SettingsIcon className="text-primary h-5 w-5" />
            <h1 className="text-lg font-bold">Gerenciar salas</h1>
          </div>
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <PlusIcon className="h-4 w-4" />
            Nova sala
          </Button>
        </div>

        <div className="relative">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nome ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((room) => (
              <AdminRoomCard
                key={room.slug}
                room={room}
                onEdit={() => openEdit(room)}
                onDelete={() => handleDelete(room.slug)}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-10 text-center text-sm">
            Nenhuma sala encontrada.
          </p>
        )}
      </div>

      <RoomFormSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        editRoom={editingRoom}
        onSave={handleSave}
      />
    </>
  );
};

export default AdminRoomsPage;
