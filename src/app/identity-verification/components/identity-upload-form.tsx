"use client";

import {
  AlertCircleIcon,
  CheckCircle2Icon,
  FileIcon,
  LockIcon,
  UploadCloudIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const ACCEPTED_DOCUMENTS = [
  "RG (frente e verso em uma imagem)",
  'CNH (frente e verso) ou PDF "CNH do Brasil"',
];

type FileState = {
  preview: string | null;
  isPdf: boolean;
  name: string | null;
};

const empty: FileState = { preview: null, isPdf: false, name: null };

const IdentityUploadForm = () => {
  const router = useRouter();
  const docInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const [doc, setDoc] = useState<FileState>(empty);
  const [selfie, setSelfie] = useState<FileState>(empty);
  const [docDragging, setDocDragging] = useState(false);
  const [selfieDragging, setSelfieDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isSubmitted) return;
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      toast.warning("Envie seus documentos para continuar.");
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

  const processFile = useCallback((selected: File, type: "doc" | "selfie") => {
    const isImage = selected.type.startsWith("image/");
    const isPdf = selected.type === "application/pdf";
    if (type === "selfie" && !isImage) {
      toast.error("A selfie deve ser uma imagem (JPG, PNG, etc.).");
      return;
    }
    if (type === "doc" && !isImage && !isPdf) {
      toast.error("Selecione uma imagem ou PDF.");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 10MB.");
      return;
    }
    if (isPdf) {
      setDoc({ preview: "pdf", isPdf: true, name: selected.name });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const state: FileState = {
        preview: e.target?.result as string,
        isPdf: false,
        name: selected.name,
      };
      if (type === "doc") setDoc(state);
      else setSelfie(state);
    };
    reader.readAsDataURL(selected);
  }, []);

  const handleDocDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDocDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) processFile(f, "doc");
    },
    [processFile],
  );

  const handleSelfieDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setSelfieDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) processFile(f, "selfie");
    },
    [processFile],
  );

  const handleSubmit = async () => {
    if (!doc.preview || !selfie.preview) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitted(true);
    toast.success("Documentos enviados! Sua conta será verificada em breve.");
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
              Para garantir a segurança de todos os moradores, precisamos
              confirmar sua identidade antes de liberar o acesso ao sistema.
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

      {/* Upload grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Document */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium">Documento</p>
          {doc.preview ? (
            <div className="relative h-36 overflow-hidden rounded-xl border">
              {doc.isPdf ? (
                <div className="bg-muted/50 flex h-full flex-col items-center justify-center gap-2">
                  <FileIcon className="text-primary h-8 w-8" />
                  <p className="text-muted-foreground max-w-[90%] truncate px-2 text-center text-[10px]">
                    {doc.name}
                  </p>
                </div>
              ) : (
                <Image
                  src={doc.preview}
                  alt="Documento"
                  fill
                  className="object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => {
                  setDoc(empty);
                  if (docInputRef.current) docInputRef.current.value = "";
                }}
                className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
                aria-label="Remover documento"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDocDragging(true);
              }}
              onDragLeave={() => setDocDragging(false)}
              onDrop={handleDocDrop}
              className={`flex h-36 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition ${
                docDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-accent/50"
              }`}
            >
              <div className="bg-primary/10 rounded-full p-2.5">
                <UploadCloudIcon className="text-primary h-5 w-5" />
              </div>
              <div className="flex flex-col items-center gap-0.5 px-2 text-center">
                <p className="text-xs leading-tight font-medium">
                  Clique ou arraste
                </p>
                <p className="text-muted-foreground text-[10px]">
                  JPG, PNG, PDF · 10MB
                </p>
              </div>
            </button>
          )}
        </div>

        {/* Selfie */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium">Selfie</p>
          {selfie.preview ? (
            <div className="relative h-36 overflow-hidden rounded-xl border">
              <Image
                src={selfie.preview}
                alt="Selfie"
                fill
                className="object-cover object-top"
              />
              <button
                type="button"
                onClick={() => {
                  setSelfie(empty);
                  if (selfieInputRef.current) selfieInputRef.current.value = "";
                }}
                className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
                aria-label="Remover selfie"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => selfieInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setSelfieDragging(true);
              }}
              onDragLeave={() => setSelfieDragging(false)}
              onDrop={handleSelfieDrop}
              className={`flex h-36 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition ${
                selfieDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-accent/50"
              }`}
            >
              <div className="bg-primary/10 rounded-full p-2.5">
                <UserIcon className="text-primary h-5 w-5" />
              </div>
              <div className="flex flex-col items-center gap-0.5 px-2 text-center">
                <p className="text-xs leading-tight font-medium">
                  Clique ou arraste
                </p>
                <p className="text-muted-foreground text-[10px]">
                  JPG, PNG · 10MB
                </p>
              </div>
            </button>
          )}
        </div>
      </div>

      <input
        ref={docInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) processFile(f, "doc");
        }}
      />
      <input
        ref={selfieInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) processFile(f, "selfie");
        }}
      />

      <Button
        onClick={handleSubmit}
        disabled={!doc.preview || !selfie.preview || isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? "Enviando..." : "Enviar documentos"}
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
