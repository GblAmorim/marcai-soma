"use client";

import {
  BuildingIcon,
  KeyRoundIcon,
  LogOutIcon,
  MailIcon,
  PencilIcon,
  PhoneIcon,
  UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Header } from "@/components/common/header";
import ChangePasswordModal from "@/components/profile/change-password-modal";
import EditContactModal from "@/components/profile/edit-contact-modal";
import { InfoCell } from "@/components/profile/info-cell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { maskPhone } from "@/lib/masks";

// ── SessionUser type ──────────────────────────────────────────────────────────

interface SessionUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  lastName?: string;
  cpf?: string;
  rg?: string;
  phoneNumber?: string;
  birthDate?: string;
  role?: "admin" | "resident";
}

interface ProfileExtras {
  condominiumName: string | null;
  apartment: {
    tower: string;
    apartmentBlock: string;
    apartmentNumber: string;
  } | null;
  responsibleName: string | null;
}

// ── ProfilePage ───────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [extras, setExtras] = useState<ProfileExtras | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: ProfileExtras) => setExtras(data))
      .catch(() => {});
  }, []);

  if (!isPending && !session?.user) {
    router.replace("/authentication");
    return null;
  }

  const user = session?.user as SessionUser | undefined;

  const fullName =
    user?.name && user?.lastName
      ? `${user.name} ${user.lastName}`
      : (user?.name ?? null);

  const initials =
    [user?.name?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() ||
    [user?.name?.split(" ")[0]?.[0], user?.name?.split(" ")[1]?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() ||
    "?";

  const formattedPhone = user?.phoneNumber ? maskPhone(user.phoneNumber) : null;

  const handleLogout = async () => {
    await authClient.signOut();
    router.replace("/authentication");
  };

  return (
    <>
      <Header />

      <div className="flex flex-col gap-6 px-5 pb-10">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 pt-6">
          <Avatar className="h-28 w-28">
            <AvatarImage src={user?.image as string | undefined} />
            <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
          </Avatar>
        </div>

        {/* Dados pessoais */}
        <div className="rounded-2xl border">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Dados pessoais</h2>
          </div>
          <div className="border-b px-4">
            <InfoCell
              icon={<UserIcon className="h-4 w-4" />}
              label="Nome"
              value={fullName}
            />
          </div>
          <div className="grid grid-cols-2 divide-x px-0">
            <div className="divide-y px-4">
              <InfoCell
                icon={<MailIcon className="h-4 w-4" />}
                label="E-mail"
                value={user?.email}
              />
            </div>
            <div className="divide-y px-4">
              <InfoCell
                icon={<PhoneIcon className="h-4 w-4" />}
                label="Celular"
                value={formattedPhone}
              />
            </div>
          </div>
          {extras?.responsibleName && (
            <div className="border-t px-4">
              <InfoCell
                icon={<UserIcon className="h-4 w-4" />}
                label="Responsável"
                value={extras.responsibleName}
              />
            </div>
          )}
        </div>

        {/* Unidade */}
        {(extras?.condominiumName || extras?.apartment) && (
          <div className="rounded-2xl border">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Unidade</h2>
            </div>
            <div className="border-b px-4">
              <InfoCell
                icon={<BuildingIcon className="h-4 w-4" />}
                label="Condomínio"
                value={extras?.condominiumName}
              />
            </div>
            <div className="grid grid-cols-2 divide-x px-0">
              {extras?.apartment && (
                <div className="px-4">
                  <InfoCell
                    icon={<BuildingIcon className="h-4 w-4" />}
                    label="Apartamento"
                    value={`Apto ${extras.apartment.apartmentNumber}`}
                  />
                </div>
              )}
              <div className="divide-y px-4">
                <InfoCell
                  icon={<BuildingIcon className="h-4 w-4" />}
                  label="Torre / Bloco"
                  value={
                    extras?.apartment
                      ? `Torre ${extras.apartment.tower} – Bl. ${extras.apartment.apartmentBlock}`
                      : null
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Documento enviado */}
        {/* <div className="rounded-2xl border">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Verificação de identidade</h2>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="text-muted-foreground mt-0.5 shrink-0">
                <ShieldCheckIcon className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground text-xs">
                  Documento de identidade
                </span>
                <span className="text-sm font-medium">Consultar</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDocumentOpen(true)}
            >
              Ver documento
            </Button>
          </div>
        </div> */}

        {/* Ações da conta */}
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setEditContactOpen(true)}
          >
            <PencilIcon className="mr-2 h-4 w-4" />
            Editar e-mail / celular
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setChangePasswordOpen(true)}
          >
            <KeyRoundIcon className="mr-2 h-4 w-4" />
            Redefinir senha
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOutIcon className="mr-2 h-4 w-4" />
            Sair da conta
          </Button>
        </div>
      </div>

      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
      <EditContactModal
        open={editContactOpen}
        onClose={() => setEditContactOpen(false)}
        initialEmail={user?.email ?? ""}
        initialPhone={formattedPhone ?? ""}
      />
      {/* <DocumentModal
        open={documentOpen}
        onClose={() => setDocumentOpen(false)}
      /> */}
    </>
  );
};

export default ProfilePage;
