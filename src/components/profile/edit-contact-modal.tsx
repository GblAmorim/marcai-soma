"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import ClearableInput from "@/components/common/clearableInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { maskPhone } from "@/lib/masks";

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
            <ClearableInput
              id="editEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onClear={() => setEmail("")}
              required
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="editPhone">Celular</Label>
            <ClearableInput
              id="editPhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
              onClear={() => setPhone("")}
              placeholder="(00) 90000-0000"
              autoComplete="tel"
            />
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

export default EditContactModal;
