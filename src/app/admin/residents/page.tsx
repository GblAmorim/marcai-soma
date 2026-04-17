"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BuildingIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
  Trash2Icon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import {
  type Apartment,
  MOCK_APARTMENTS,
  MOCK_WORKERS,
  PERMISSION_LABEL,
  type Worker,
  type WorkerPermission,
} from "@/lib/residents";
import { cn } from "@/lib/utils";

// ── Constants ─────────────────────────────────────────────────

const ALL_PERMISSIONS = Object.keys(PERMISSION_LABEL) as WorkerPermission[];

// ── Schemas ───────────────────────────────────────────────────

const personSchema = z.object({
  name: z.string().min(1, "Obrigatório"),
  lastName: z.string().min(1, "Obrigatório"),
  cpf: z.string().min(1, "Obrigatório"),
  rg: z.string().min(1, "Obrigatório"),
  email: z.string().email("E-mail inválido").or(z.literal("")),
  phone: z.string().min(1, "Obrigatório"),
});

const apartmentSchema = z.object({
  id: z.string().min(1, "Obrigatório"),
  residentCount: z.coerce.number().int().min(1),
  residents: z.array(personSchema),
});

type ApartmentFormValues = z.infer<typeof apartmentSchema>;

const workerSchema = z.object({
  name: z.string().min(1, "Obrigatório"),
  lastName: z.string().min(1, "Obrigatório"),
  cpf: z.string().min(1, "Obrigatório"),
  rg: z.string().min(1, "Obrigatório"),
  email: z.string().email("E-mail inválido").or(z.literal("")),
  phone: z.string().min(1, "Obrigatório"),
  permissions: z.array(z.string()).min(1, "Selecione ao menos uma permissão"),
});

type WorkerFormValues = z.infer<typeof workerSchema>;

// ── Default values ────────────────────────────────────────────

const BLANK_RESIDENT = {
  name: "",
  lastName: "",
  cpf: "",
  rg: "",
  email: "",
  phone: "",
};

const DEFAULT_APARTMENT: ApartmentFormValues = {
  id: "",
  residentCount: 1,
  residents: [{ ...BLANK_RESIDENT }],
};

const DEFAULT_WORKER: WorkerFormValues = {
  name: "",
  lastName: "",
  cpf: "",
  rg: "",
  email: "",
  phone: "",
  permissions: [],
};

// ── Apartment form sheet ──────────────────────────────────────

interface ApartmentSheetProps {
  open: boolean;
  editApartment: Apartment | null;
  onClose: () => void;
  onSave: (apt: Apartment, isNew: boolean) => void;
  existingIds: string[];
}

const ApartmentSheet = ({
  open,
  editApartment,
  onClose,
  onSave,
  existingIds,
}: ApartmentSheetProps) => {
  const isNew = !editApartment;

  const form = useForm<ApartmentFormValues>({
    resolver: zodResolver(apartmentSchema) as Resolver<ApartmentFormValues>,
    defaultValues: DEFAULT_APARTMENT,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "residents",
  });

  const residentCount = useWatch({
    control: form.control,
    name: "residentCount",
  });

  useEffect(() => {
    if (open) {
      form.reset(
        editApartment
          ? {
              id: editApartment.id,
              residentCount: editApartment.residentCount,
              residents: editApartment.residents.map((r) => ({ ...r })),
            }
          : DEFAULT_APARTMENT,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editApartment]);

  const onSubmit = (values: ApartmentFormValues) => {
    if (isNew && existingIds.includes(values.id)) {
      form.setError("id", {
        message: `Apartamento ${values.id} já cadastrado`,
      });
      return;
    }
    const apt: Apartment = {
      id: values.id,
      residentCount: values.residentCount,
      residents: values.residents,
      workers: editApartment?.workers ?? [],
    };
    onSave(apt, isNew);
    onClose();
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          form.reset();
          onClose();
        }
      }}
    >
      <SheetContent
        side="bottom"
        className="max-h-[95dvh] overflow-y-auto rounded-t-2xl pb-10"
      >
        <SheetHeader className="mb-4">
          <SheetTitle>
            {isNew
              ? "Cadastrar apartamento"
              : `Apartamento ${editApartment?.id}`}
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <SectionHeading>Identificação</SectionHeading>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do apartamento</FormLabel>
                    <FormControl>
                      <Input placeholder="101" disabled={!isNew} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="residentCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nº de moradores</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Residents */}
            <SectionHeading>Moradores</SectionHeading>

            <div className="flex flex-col gap-4">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-xl border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium">Morador {index + 1}</p>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-7 w-7"
                        onClick={() => remove(index)}
                      >
                        <Trash2Icon className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`residents.${index}.name`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="João" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`residents.${index}.lastName`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Sobrenome</FormLabel>
                          <FormControl>
                            <Input placeholder="Silva" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`residents.${index}.cpf`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">CPF</FormLabel>
                          <FormControl>
                            <Input placeholder="000.000.000-00" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`residents.${index}.rg`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">RG</FormLabel>
                          <FormControl>
                            <Input placeholder="00.000.000-0" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`residents.${index}.email`}
                      render={({ field: f }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-xs">
                            E-mail{" "}
                            <span className="text-muted-foreground font-normal">
                              (opcional)
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="joao@email.com"
                              {...f}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`residents.${index}.phone`}
                      render={({ field: f }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-xs">Celular</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-0000" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => append({ ...BLANK_RESIDENT })}
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Adicionar morador
              </Button>
            </div>

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
                {isNew ? "Cadastrar apartamento" : "Salvar alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

// ── Worker form sheet ─────────────────────────────────────────

interface WorkerSheetProps {
  open: boolean;
  editWorker: Worker | null;
  onClose: () => void;
  onSave: (worker: Worker, isNew: boolean) => void;
}

const WorkerSheet = ({
  open,
  editWorker,
  onClose,
  onSave,
}: WorkerSheetProps) => {
  const isNew = !editWorker;

  const form = useForm<WorkerFormValues>({
    resolver: zodResolver(workerSchema) as Resolver<WorkerFormValues>,
    defaultValues: DEFAULT_WORKER,
  });

  const permissions = useWatch({ control: form.control, name: "permissions" });

  useEffect(() => {
    if (open) {
      form.reset(editWorker ? { ...editWorker } : DEFAULT_WORKER);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editWorker]);

  const togglePermission = (p: WorkerPermission) => {
    const current = (permissions ?? []) as WorkerPermission[];
    if (current.includes(p)) {
      form.setValue(
        "permissions",
        current.filter((x) => x !== p),
        { shouldValidate: true },
      );
    } else {
      form.setValue("permissions", [...current, p], { shouldValidate: true });
    }
  };

  const onSubmit = (values: WorkerFormValues) => {
    const worker: Worker = {
      ...values,
      permissions: values.permissions as WorkerPermission[],
    };
    onSave(worker, isNew);
    onClose();
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          form.reset();
          onClose();
        }
      }}
    >
      <SheetContent
        side="bottom"
        className="max-h-[95dvh] overflow-y-auto rounded-t-2xl pb-10"
      >
        <SheetHeader className="mb-4">
          <SheetTitle>
            {isNew
              ? "Cadastrar trabalhador"
              : `${editWorker?.name} ${editWorker?.lastName}`}
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <SectionHeading>Dados pessoais</SectionHeading>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Roberto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome</FormLabel>
                    <FormControl>
                      <Input placeholder="Costa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RG</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000-0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>
                      E-mail{" "}
                      <span className="text-muted-foreground font-normal">
                        (opcional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="roberto@condominio.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Celular</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 97777-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SectionHeading>Permissionamento</SectionHeading>

            <FormField
              control={form.control}
              name="permissions"
              render={() => (
                <FormItem>
                  <FormLabel>Acessos e permissões</FormLabel>
                  <p className="text-muted-foreground mb-2 text-xs">
                    Selecione todos os níveis de acesso deste trabalhador
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_PERMISSIONS.map((p) => (
                      <ToggleChip
                        key={p}
                        label={PERMISSION_LABEL[p]}
                        active={(permissions ?? []).includes(p)}
                        onClick={() => togglePermission(p)}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isNew ? "Cadastrar trabalhador" : "Salvar alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

// ── Apartment card ────────────────────────────────────────────

interface ApartmentCardProps {
  apt: Apartment;
  onEdit: () => void;
  onDelete: () => void;
}

const ApartmentCard = ({ apt, onEdit, onDelete }: ApartmentCardProps) => (
  <div className="rounded-2xl border p-4">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
          <BuildingIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">Apto {apt.id}</p>
          <p className="text-muted-foreground flex items-center gap-1 text-xs">
            <UsersIcon className="h-3 w-3" />
            {apt.residentCount} morador{apt.residentCount !== 1 ? "es" : ""}
          </p>
        </div>
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

    {apt.residents.length > 0 && (
      <div className="mt-3 flex flex-col gap-1">
        {apt.residents.map((r, i) => (
          <p key={i} className="text-muted-foreground text-xs">
            · {r.name} {r.lastName}
            {r.email ? ` — ${r.email}` : ""}
          </p>
        ))}
      </div>
    )}
  </div>
);

// ── Worker card ───────────────────────────────────────────────

interface WorkerCardProps {
  worker: Worker;
  onEdit: () => void;
  onDelete: () => void;
}

const WorkerCard = ({ worker, onEdit, onDelete }: WorkerCardProps) => (
  <div className="rounded-2xl border p-4">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
          <UserIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">
            {worker.name} {worker.lastName}
          </p>
          <p className="text-muted-foreground text-xs">{worker.phone}</p>
        </div>
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

    <div className="mt-3 flex flex-wrap gap-1.5">
      {worker.permissions.map((p) => (
        <span
          key={p}
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            p === "admin"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground",
          )}
        >
          {PERMISSION_LABEL[p]}
        </span>
      ))}
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────

type TabValue = "apartments" | "workers";

const AdminResidentsPage = () => {
  const { data: session, isPending } = authClient.useSession();

  const [tab, setTab] = useState<TabValue>("apartments");
  const [search, setSearch] = useState("");

  const [apartments, setApartments] = useState<Apartment[]>(MOCK_APARTMENTS);
  const [workers, setWorkers] = useState<Worker[]>(MOCK_WORKERS);

  const [aptSheetOpen, setAptSheetOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<Apartment | null>(null);

  const [workerSheetOpen, setWorkerSheetOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  const user = session?.user as
    | (NonNullable<typeof session>["user"] & { role?: string })
    | undefined;

  if (!isPending && user?.role !== "admin") {
    redirect("/");
  }

  const filteredApts = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return apartments;
    return apartments.filter(
      (a) =>
        a.id.includes(q) ||
        a.residents.some(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.lastName.toLowerCase().includes(q) ||
            r.cpf.includes(q),
        ),
    );
  }, [apartments, search]);

  const filteredWorkers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return workers;
    return workers.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.lastName.toLowerCase().includes(q) ||
        w.cpf.includes(q) ||
        w.permissions.some((p) =>
          PERMISSION_LABEL[p].toLowerCase().includes(q),
        ),
    );
  }, [workers, search]);

  // Apartment handlers
  const openCreateApt = () => {
    setEditingApt(null);
    setAptSheetOpen(true);
  };
  const openEditApt = (apt: Apartment) => {
    setEditingApt(apt);
    setAptSheetOpen(true);
  };
  const handleSaveApt = (apt: Apartment, isNew: boolean) => {
    if (isNew) {
      setApartments((prev) => [...prev, apt]);
      toast.success(`Apartamento ${apt.id} cadastrado!`);
    } else {
      setApartments((prev) => prev.map((a) => (a.id === apt.id ? apt : a)));
      toast.success(`Apartamento ${apt.id} atualizado!`);
    }
  };
  const handleDeleteApt = (id: string) => {
    setApartments((prev) => prev.filter((a) => a.id !== id));
    toast.success("Apartamento removido.");
  };

  // Worker handlers
  const openCreateWorker = () => {
    setEditingWorker(null);
    setWorkerSheetOpen(true);
  };
  const openEditWorker = (w: Worker) => {
    setEditingWorker(w);
    setWorkerSheetOpen(true);
  };
  const handleSaveWorker = (worker: Worker, isNew: boolean) => {
    if (isNew) {
      setWorkers((prev) => [...prev, worker]);
      toast.success(`${worker.name} ${worker.lastName} cadastrado!`);
    } else {
      setWorkers((prev) =>
        prev.map((w) => (w.cpf === worker.cpf ? worker : w)),
      );
      toast.success(`${worker.name} ${worker.lastName} atualizado!`);
    }
  };
  const handleDeleteWorker = (cpf: string) => {
    setWorkers((prev) => prev.filter((w) => w.cpf !== cpf));
    toast.success("Trabalhador removido.");
  };

  return (
    <>
      <Header />

      <div className="flex flex-col gap-5 px-5 pb-10">
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-lg font-bold">Banco da verdade</h1>
            <p className="text-muted-foreground text-sm">
              Condôminos e trabalhadores
            </p>
          </div>

          <Button
            size="sm"
            className="gap-1.5"
            onClick={tab === "apartments" ? openCreateApt : openCreateWorker}
          >
            <PlusIcon className="h-4 w-4" />
            {tab === "apartments" ? "Novo apto" : "Novo trabalhador"}
          </Button>
        </div>

        <div className="relative">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={
              tab === "apartments"
                ? "Buscar por apto ou morador..."
                : "Buscar por nome, CPF ou permissão..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v as TabValue);
            setSearch("");
          }}
        >
          <TabsList className="w-full">
            <TabsTrigger value="apartments" className="flex-1 gap-1.5">
              <BuildingIcon className="h-3.5 w-3.5" />
              Apartamentos
              <span className="text-muted-foreground ml-1 text-xs">
                ({apartments.length})
              </span>
            </TabsTrigger>
            <TabsTrigger value="workers" className="flex-1 gap-1.5">
              <ShieldIcon className="h-3.5 w-3.5" />
              Trabalhadores
              <span className="text-muted-foreground ml-1 text-xs">
                ({workers.length})
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {tab === "apartments" && (
          <>
            {filteredApts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {filteredApts.map((apt) => (
                  <ApartmentCard
                    key={apt.id}
                    apt={apt}
                    onEdit={() => openEditApt(apt)}
                    onDelete={() => handleDeleteApt(apt.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-10 text-center text-sm">
                Nenhum apartamento encontrado.
              </p>
            )}
          </>
        )}

        {tab === "workers" && (
          <>
            {filteredWorkers.length > 0 ? (
              <div className="flex flex-col gap-3">
                {filteredWorkers.map((w) => (
                  <WorkerCard
                    key={w.cpf}
                    worker={w}
                    onEdit={() => openEditWorker(w)}
                    onDelete={() => handleDeleteWorker(w.cpf)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-10 text-center text-sm">
                Nenhum trabalhador encontrado.
              </p>
            )}
          </>
        )}
      </div>

      <ApartmentSheet
        open={aptSheetOpen}
        editApartment={editingApt}
        onClose={() => setAptSheetOpen(false)}
        onSave={handleSaveApt}
        existingIds={apartments.map((a) => a.id)}
      />

      <WorkerSheet
        open={workerSheetOpen}
        editWorker={editingWorker}
        onClose={() => setWorkerSheetOpen(false)}
        onSave={handleSaveWorker}
      />
    </>
  );
};

export default AdminResidentsPage;
