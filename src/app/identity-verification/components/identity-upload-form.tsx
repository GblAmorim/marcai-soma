"use client";

import {
  AlertCircleIcon,
  CheckCircle2Icon,
  FileImageIcon,
  LockIcon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const ACCEPTED_DOCUMENTS = [
  "RG (frente e verso em uma imagem)",
  "CNH (frente)",
  "Passaporte (página com foto)",
];

const IdentityUploadForm = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const hasFile = preview !== null;

  useEffect(() => {
    if (isSubmitted) return;

    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      toast.warning("Envie sua foto de documento para continuar.");
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isSubmitted]);

  const handleFile = useCallback((selected: File) => {
    if (!selected.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem (JPG, PNG ou PDF).");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selected);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const handleRemove = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!preview) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitted(true);
    toast.success("Documento enviado! Sua conta será verificada em breve.");
    router.push("/");
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-950/30">
        <div className="flex items-start gap-3">
          <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-500" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
              Etapa obrigatória
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-500">
              O envio do documento é necessário para liberar o acesso ao
              sistema. Você não poderá pular esta etapa.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Documentos aceitos:</p>
        <ul className="flex flex-col gap-1.5">
          {ACCEPTED_DOCUMENTS.map((doc) => (
            <li key={doc} className="flex items-center gap-2">
              <CheckCircle2Icon className="text-primary h-4 w-4 shrink-0" />
              <span className="text-muted-foreground text-sm">{doc}</span>
            </li>
          ))}
        </ul>
      </div>

      {preview ? (
        <div className="relative overflow-hidden rounded-2xl border">
          <Image
            src={preview}
            alt="Pré-visualização do documento"
            width={0}
            height={0}
            sizes="100vw"
            className="h-56 w-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-3 right-3 rounded-full bg-black/60 p-1.5 text-white transition hover:bg-black/80"
            aria-label="Remover imagem"
          >
            <XIcon className="h-4 w-4" />
          </button>
          <div className="absolute right-0 bottom-0 left-0 flex items-center gap-2 bg-black/50 px-4 py-2">
            <FileImageIcon className="h-4 w-4 text-white" />
            <p className="text-xs text-white">Documento carregado</p>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 transition ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-accent/50"
          }`}
        >
          <div className="bg-primary/10 rounded-full p-4">
            <UploadCloudIcon className="text-primary h-8 w-8" />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-sm font-medium">
              Arraste a foto aqui ou clique para selecionar
            </p>
            <p className="text-muted-foreground text-xs">
              JPG, PNG ou HEIC · Máximo 10MB
            </p>
          </div>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />

      <Button
        onClick={handleSubmit}
        disabled={!hasFile || isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? "Enviando..." : "Enviar documento"}
      </Button>

      <div className="flex items-center justify-center gap-2">
        <LockIcon className="text-muted-foreground h-3.5 w-3.5" />
        <p className="text-muted-foreground text-xs">
          Seus dados são criptografados e protegidos
        </p>
      </div>
    </div>
  );
};

export default IdentityUploadForm;
