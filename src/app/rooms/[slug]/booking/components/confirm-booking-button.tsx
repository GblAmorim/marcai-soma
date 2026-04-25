"use client";

import { CheckCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface ConfirmBookingButtonProps {
  slug: string;
  date: string;
  startTime: string;
  endTime: string;
}

export const ConfirmBookingButton = ({
  slug,
  date,
  startTime,
  endTime,
}: ConfirmBookingButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, date, startTime, endTime }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        toast.error(data.error ?? "Erro ao confirmar reserva.");
        return;
      }

      toast.success("Reserva confirmada com sucesso!");
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleConfirm}
      disabled={isLoading}
      className="w-full gap-2"
    >
      <CheckCircleIcon className="h-4 w-4" />
      {isLoading ? "Confirmando..." : "Confirmar reserva"}
    </Button>
  );
};
