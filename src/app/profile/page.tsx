"use client";

import {
  BuildingIcon,
  CalendarIcon,
  IdCardIcon,
  MailIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react";
import { redirect } from "next/navigation";

import { Header } from "@/components/common/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}

const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <div className="flex items-start gap-3 py-3">
    <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  </div>
);

interface SessionUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  firstName?: string;
  lastName?: string;
  cpf?: string;
  rg?: string;
  phone?: string;
  birthDate?: string;
  role?: "admin" | "resident";
  apartment?: {
    tower: string;
    apartmentNumber: string;
    apartmentBlock: string;
  };
  /** Name of the responsible person (for minors) */
  responsible?: string;
}

const ProfilePage = () => {
  const { data: session, isPending } = authClient.useSession();

  if (!isPending && !session?.user) {
    redirect("/authentication");
  }

  const user = session?.user as SessionUser | undefined;

  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : (user?.name ?? null);

  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() ||
    [user?.name?.split(" ")[0]?.[0], user?.name?.split(" ")[1]?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() ||
    "?";

  const aptLabel = user?.apartment
    ? `Torre ${user.apartment.tower} – Bl. ${user.apartment.apartmentBlock} – Apto ${user.apartment.apartmentNumber}`
    : null;

  const roleLabel =
    user?.role === "admin"
      ? "Administrador"
      : user?.role === "resident"
        ? "Morador"
        : null;

  return (
    <>
      <Header />

      <div className="flex flex-col gap-6 px-5 pb-10">
        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.image as string | undefined} />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-lg font-bold">{fullName ?? "—"}</h1>
            {aptLabel && (
              <span className="text-muted-foreground text-sm">{aptLabel}</span>
            )}
            {roleLabel && (
              <span
                className={
                  user?.role === "admin"
                    ? "bg-primary text-primary-foreground rounded-full px-3 py-0.5 text-xs font-medium"
                    : "bg-secondary text-secondary-foreground rounded-full px-3 py-0.5 text-xs font-medium"
                }
              >
                {roleLabel}
              </span>
            )}
          </div>
        </div>

        {/* Info sections */}
        <div className="rounded-2xl border">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Dados pessoais</h2>
          </div>
          <div className="divide-y px-4">
            <InfoRow
              icon={<UserIcon className="h-4 w-4" />}
              label="Nome completo"
              value={fullName}
            />
            <InfoRow
              icon={<MailIcon className="h-4 w-4" />}
              label="E-mail"
              value={user?.email}
            />
            <InfoRow
              icon={<PhoneIcon className="h-4 w-4" />}
              label="Celular"
              value={user?.phone}
            />
            <InfoRow
              icon={<CalendarIcon className="h-4 w-4" />}
              label="Data de nascimento"
              value={user?.birthDate}
            />
            {roleLabel && (
              <InfoRow
                icon={<ShieldCheckIcon className="h-4 w-4" />}
                label="Perfil"
                value={roleLabel}
              />
            )}
          </div>
        </div>

        <div className="rounded-2xl border">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Documentos</h2>
          </div>
          <div className="divide-y px-4">
            <InfoRow
              icon={<IdCardIcon className="h-4 w-4" />}
              label="CPF"
              value={user?.cpf}
            />
            <InfoRow
              icon={<IdCardIcon className="h-4 w-4" />}
              label="RG"
              value={user?.rg}
            />
          </div>
        </div>

        {aptLabel && (
          <div className="rounded-2xl border">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Unidade</h2>
            </div>
            <div className="divide-y px-4">
              <InfoRow
                icon={<BuildingIcon className="h-4 w-4" />}
                label="Torre"
                value={`Torre ${user?.apartment?.tower}`}
              />
              <InfoRow
                icon={<BuildingIcon className="h-4 w-4" />}
                label="Bloco"
                value={`Bloco ${user?.apartment?.apartmentBlock}`}
              />
              <InfoRow
                icon={<BuildingIcon className="h-4 w-4" />}
                label="Apartamento"
                value={`Apto ${user?.apartment?.apartmentNumber}`}
              />
            </div>
          </div>
        )}

        {user?.responsible && (
          <div className="rounded-2xl border">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Responsável</h2>
            </div>
            <div className="px-4">
              <InfoRow
                icon={<UserIcon className="h-4 w-4" />}
                label="Nome do responsável"
                value={user.responsible}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePage;
