"use client";

import { useState } from "react";
import { toast } from "sonner";

import PasswordInput from "@/components/common/password-input";
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

export default ChangePasswordModal;
