"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import ClearableInput from "@/components/common/clearableInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  SearchableSelect,
  type SelectOption,
} from "@/components/ui/searchable-select";
import { authClient } from "@/lib/auth-client";
import { maskCpf, maskPhone, maskRg } from "@/lib/masks";
import { clearString } from "@/lib/utils";

const PasswordInput = ({
  id,
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  id?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
        onChange={onChange}
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

function calculateAge(birthDateStr: string): number {
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

const formSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "Nome deve ter pelo menos 2 caracteres.")
      .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, "Nome deve conter apenas letras."),
    lastName: z
      .string()
      .trim()
      .min(2, "Sobrenome deve ter pelo menos 2 caracteres.")
      .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, "Sobrenome deve conter apenas letras."),
    cpf: z
      .string()
      .trim()
      .regex(
        /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
        "CPF inválido. Use o formato 000.000.000-00.",
      ),
    rg: z
      .string()
      .trim()
      .regex(
        /^\d{2}\.\d{3}\.\d{3}-[\dXx]$/,
        "RG inválido. Use o formato 00.000.000-0.",
      ),
    phoneNumber: z
      .string()
      .trim()
      .regex(
        /^\(?\d{2}\)?[\s-]?9\d{4}[\s-]?\d{4}$/,
        "Celular inválido. Use o formato (00) 90000-0000.",
      ),
    email: z.email("E-mail inválido."),
    birthDate: z
      .string()
      .min(1, "Data de nascimento é obrigatória.")
      .refine((val) => !isNaN(new Date(val).getTime()), "Data inválida.")
      .refine(
        (val) => calculateAge(val) >= 0,
        "Data de nascimento não pode ser no futuro.",
      ),
    responsibleId: z.string().trim().optional(),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres."),
    passwordConfirmation: z.string().min(8, "Senha inválida."),
    condominiumId: z.string().trim().min(2, "Condomínio é obrigatório."),
    apartmentId: z.string().trim().min(2, "Apartamento é obrigatório."),
    role: z.string().trim().min(2, "Função é obrigatória."),
    termsAccepted: z.boolean().refine((v) => v === true, {
      message: "Você deve aceitar os Termos de Uso e a LGPD.",
    }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    error: "As senhas não coincidem.",
    path: ["passwordConfirmation"],
  })
  .refine(
    (data) => {
      if (!data.birthDate || isNaN(new Date(data.birthDate).getTime()))
        return true;
      const isMinor = calculateAge(data.birthDate) < 18;
      if (isMinor && !data.responsibleId?.trim()) return false;
      return true;
    },
    {
      error: "Responsável é obrigatório para menores de idade.",
      path: ["responsibleId"],
    },
  );

type FormValues = z.infer<typeof formSchema>;

const SignUpForm = () => {
  const [condominiumOptions, setCondominiumOptions] = useState<SelectOption[]>(
    [],
  );
  const [apartmentOptions, setApartmentOptions] = useState<SelectOption[]>([]);
  const [responsibleOptions, setResponsibleOptions] = useState<SelectOption[]>(
    [],
  );
  const [loadingApartments, setLoadingApartments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      cpf: "",
      rg: "",
      phoneNumber: "",
      email: "",
      birthDate: "",
      responsibleId: "",
      password: "",
      passwordConfirmation: "",
      apartmentId: "",
      condominiumId: "",
      role: "resident",
      termsAccepted: false,
    },
  });

  const condominiumId = useWatch({
    control: form.control,
    name: "condominiumId",
  });
  const apartmentId = useWatch({ control: form.control, name: "apartmentId" });

  // Load condominiums on mount
  useEffect(() => {
    fetch("/api/condominiums")
      .then((r) => r.json())
      .then((data: { id: string; name: string }[]) =>
        setCondominiumOptions(
          data.map((c) => ({ value: c.id, label: c.name })),
        ),
      )
      .catch(() => toast.error("Erro ao carregar condomínios."));
  }, []);

  // Load apartments whenever condominiumId changes
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!condominiumId) {
        setApartmentOptions([]);
        form.setValue("apartmentId", "");
        return;
      }
      form.setValue("apartmentId", "");
      setLoadingApartments(true);
      setApartmentOptions([]);
      try {
        const r = await fetch(`/api/apartments?condominiumId=${condominiumId}`);
        const data: {
          id: string;
          tower: string;
          apartmentNumber: string;
          apartmentBlock: string;
        }[] = await r.json();
        if (!cancelled) {
          setApartmentOptions(
            data.map((a) => ({
              value: a.id,
              label: `Torre ${a.tower} \u00b7 Bloco ${a.apartmentBlock} \u00b7 Apto ${a.apartmentNumber}`,
            })),
          );
        }
      } catch {
        toast.error("Erro ao carregar apartamentos.");
      } finally {
        if (!cancelled) setLoadingApartments(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [condominiumId, form]);

  // Load adult residents whenever apartmentId changes (for responsible selector)
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!apartmentId) {
        setResponsibleOptions([]);
        form.setValue("responsibleId", "");
        return;
      }
      form.setValue("responsibleId", "");
      try {
        const r = await fetch(`/api/apartments/${apartmentId}/residents`);
        const data: { id: string; firstName: string; lastName: string }[] =
          await r.json();
        if (!cancelled) {
          setResponsibleOptions(
            data.map((u) => ({
              value: u.id,
              label: `${u.firstName} ${u.lastName}`,
            })),
          );
        }
      } catch {
        toast.error("Erro ao carregar moradores.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apartmentId, form]);

  const birthDateValue = useWatch({ control: form.control, name: "birthDate" });
  const isMinor =
    birthDateValue &&
    !isNaN(new Date(birthDateValue).getTime()) &&
    calculateAge(birthDateValue) < 18;

  const router = useRouter();
  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      // if (
      //   !isRegisteredResident(
      //     values.firstName,
      //     values.lastName,
      //     values.cpf,
      //     values.rg,
      //     values.apartment,
      //   )
      // ) {
      //   toast.error(
      //     "Cadastro não permitido. Nome, sobrenome, CPF, RG e apartamento não correspondem a nenhum condômino cadastrado.",
      //   );
      //   return;
      // }
      console.log("values: ", values);

      const { data, error } = await authClient.signUp.email({
        name: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email,
        password: values.password,
        phoneNumber: clearString(values.phoneNumber),
        condominiumId: values.condominiumId,
        apartmentId: values.apartmentId,
        birthDate: values.birthDate,
        cpf: clearString(values.cpf),
        rg: clearString(values.rg),
        responsibleId: values.responsibleId,
        role: values.role,
        fetchOptions: {
          onSuccess: () => {
            toast.success("Conta criada com sucesso!");
            router.push("/identity-verification");
          },
          onError: (ctx) => {
            if (ctx.error.code === "USER_ALREADY_EXISTS") {
              toast.error("Erro ao cadastrar.");
              return form.setError("email", {
                message: "E-mail já cadastrado.",
              });
            }
            toast.error(ctx.error.message);
          },
        },
      });
      console.log("data: ", data);
      console.log("err: ", error);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
            <CardContent className="grid grid-cols-2 gap-4">
              {/* Condomínio — full width */}
              <FormField
                control={form.control}
                name="condominiumId"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Condomínio</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={condominiumOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Selecione o condomínio"
                        searchPlaceholder="Pesquisar condomínio..."
                        emptyMessage="Nenhum condomínio encontrado."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apartmentId"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Apartamento</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={apartmentOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={
                          condominiumId
                            ? "Selecione o apartamento"
                            : "Selecione o condomínio primeiro"
                        }
                        searchPlaceholder="Pesquisar apartamento..."
                        emptyMessage="Nenhum apartamento encontrado."
                        disabled={!condominiumId || loadingApartments}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <ClearableInput
                        placeholder="Digite seu nome"
                        {...field}
                        onClear={() => field.onChange("")}
                      />
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
                      <ClearableInput
                        placeholder="Digite seu sobrenome"
                        {...field}
                        onClear={() => field.onChange("")}
                      />
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
                      <ClearableInput
                        placeholder="000.000.000-00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(maskCpf(e.target.value))
                        }
                        onClear={() => field.onChange("")}
                      />
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
                      <ClearableInput
                        placeholder="00.000.000-0"
                        {...field}
                        onChange={(e) => field.onChange(maskRg(e.target.value))}
                        onClear={() => field.onChange("")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Celular</FormLabel>
                    <FormControl>
                      <ClearableInput
                        placeholder="(00) 90000-0000"
                        {...field}
                        onChange={(e) =>
                          field.onChange(maskPhone(e.target.value))
                        }
                        onClear={() => field.onChange("")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <ClearableInput
                        placeholder="Digite seu e-mail"
                        type="email"
                        {...field}
                        onClear={() => field.onChange("")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isMinor && (
                <FormField
                  control={form.control}
                  name="responsibleId"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Responsável</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          options={responsibleOptions}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder={
                            apartmentId
                              ? responsibleOptions.length === 0
                                ? "Nenhum adulto neste apto"
                                : "Selecione o responsável"
                              : "Selecione o apartamento primeiro"
                          }
                          searchPlaceholder="Pesquisar responsável..."
                          emptyMessage="Nenhum morador adulto encontrado."
                          disabled={
                            !apartmentId || responsibleOptions.length === 0
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Digite a senha"
                        value={field.value}
                        onChange={field.onChange}
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passwordConfirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar senha</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Confirme a senha"
                        value={field.value}
                        onChange={field.onChange}
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <div className="flex items-start gap-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="termsAccepted"
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor="termsAccepted"
                        className="cursor-pointer text-sm font-normal"
                      >
                        Lí e aceito os{" "}
                        <a
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium underline underline-offset-2"
                        >
                          Termos de Uso
                        </a>{" "}
                        e a{" "}
                        <a
                          href="/lgpd"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium underline underline-offset-2"
                        >
                          LGPD
                        </a>
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Criando conta..." : "Criar conta"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
};

export default SignUpForm;
