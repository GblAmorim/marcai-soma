"use client";

import {
  BuildingIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  LogOutIcon,
  MailIcon,
  PencilIcon,
  PhoneIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Header } from "@/components/common/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { maskPhone } from "@/lib/masks";

const PASSWORD_ERROR_MAP: Record<string, string> = {
  "Invalid password": "Senha atual incorreta.",
  "Password is incorrect": "Senha atual incorreta.",
  "Incorrect password": "Senha atual incorreta.",
  "Current password is incorrect": "Senha atual incorreta.",
  "Password too short": "A senha deve ter pelo menos 8 caracteres.",
};

function translatePasswordError(msg: string | undefined): string {
  if (!msg) return "Erro ao alterar senha.";
  for (const [key, value] of Object.entries(PASSWORD_ERROR_MAP)) {
    if (msg.toLowerCase().includes(key.toLowerCase())) return value;
  }
  return msg;
}

// ── PasswordInput ─────────────────────────────────────────────────────────────

const PasswordInput = ({
  id,
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        autoComplete={autoComplete}
        className="pr-10"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
      >
        {show ? (
          <EyeOffIcon className="h-4 w-4" />
        ) : (
          <EyeIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

// ── ChangePasswordModal ───────────────────────────────────────────────────────

const ChangePasswordModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });
      if (error) {
        toast.error(translatePasswordError(error.message));
        return;
      }
      toast.success("Senha alterada com sucesso!");
      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redefinir senha</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <PasswordInput
              id="currentPassword"
              placeholder="Digite sua senha atual"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newPassword">Nova senha</Label>
            <PasswordInput
              id="newPassword"
              placeholder="Mínimo 8 caracteres"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="Repita a nova senha"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar senha"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ── EditContactModal ──────────────────────────────────────────────────────────

const EditContactModal = ({
  open,
  onClose,
  initialEmail,
  initialPhone,
}: {
  open: boolean;
  onClose: () => void;
  initialEmail: string;
  initialPhone: string;
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail(initialEmail);
      setPhone(initialPhone);
    }
  }, [open, initialEmail, initialPhone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const emailChanged = email !== initialEmail;
      const rawPhone = phone.replace(/\D/g, "");
      const phoneChanged = rawPhone !== initialPhone.replace(/\D/g, "");

      if (!emailChanged && !phoneChanged) {
        onClose();
        return;
      }

      if (emailChanged) {
        const { error } = await authClient.changeEmail({
          newEmail: email,
          callbackURL: "/profile",
        });
        if (error) {
          toast.error(error.message ?? "Erro ao atualizar e-mail.");
          return;
        }
      }

      if (phoneChanged) {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: rawPhone }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          toast.error(data.error ?? "Erro ao atualizar celular.");
          return;
        }
      }

      toast.success("Dados atualizados com sucesso!");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar contato</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="editEmail">E-mail</Label>
            <div className="relative">
              <Input
                id="editEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={email ? "pr-9" : ""}
              />
              {email && (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setEmail("")}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                  aria-label="Limpar e-mail"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="editPhone">Celular</Label>
            <div className="relative">
              <Input
                id="editPhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                placeholder="(00) 90000-0000"
                autoComplete="tel"
                className={phone ? "pr-9" : ""}
              />
              {phone && (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setPhone("")}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                  aria-label="Limpar celular"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ── DocumentModal ─────────────────────────────────────────────────────────────

// const DocumentModal = ({
//   open,
//   onClose,
// }: {
//   open: boolean;
//   onClose: () => void;
// }) => (
//   <Dialog open={open} onOpenChange={onClose}>
//     <DialogContent className="max-w-sm">
//       <DialogHeader>
//         <DialogTitle>Documento enviado</DialogTitle>
//       </DialogHeader>
//       <div className="relative aspect-3/2 w-full overflow-hidden rounded-xl border">
//         <Image
//           src="/banner-01.png"
//           alt="Documento de identidade"
//           fill
//           className="object-cover"
//         />
//       </div>
//       <p className="text-muted-foreground text-center text-xs">
//         Este é o documento enviado na verificação de identidade.
//       </p>
//       <DialogFooter>
//         <Button variant="outline" onClick={onClose} className="w-full">
//           <XIcon className="mr-2 h-4 w-4" />
//           Fechar
//         </Button>
//       </DialogFooter>
//     </DialogContent>
//   </Dialog>
// );

// ── InfoCell ──────────────────────────────────────────────────────────────────

const InfoCell = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) => (
  <div className="flex items-start gap-2.5 py-3">
    <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-sm font-medium wrap-break-word">
        {value ?? "—"}
      </span>
    </div>
  </div>
);

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
  // const [documentOpen, setDocumentOpen] = useState(false);
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
