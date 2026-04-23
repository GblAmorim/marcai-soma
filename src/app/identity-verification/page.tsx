import { ShieldCheckIcon } from "lucide-react";
import Image from "next/image";

import IdentityUploadForm from "./components/identity-upload-form";

const IdentityVerification = () => {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-start px-5 py-10">
      <div className="flex w-full max-w-md flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Image src="/logo.svg" alt="Marcai" width={100} height={26} />

          <div className="bg-primary/10 rounded-full p-5">
            <ShieldCheckIcon className="text-primary h-10 w-10" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Verificação de identidade
            </h1>
          </div>

          <div className="flex w-full items-center gap-2">
            <div className="bg-primary h-1.5 w-full rounded-full" />
            <p className="text-muted-foreground shrink-0 text-xs">Etapa 1/1</p>
            <div className="bg-primary h-1.5 w-full rounded-full" />
          </div>
        </div>

        <IdentityUploadForm />
      </div>
    </div>
  );
};

export default IdentityVerification;
