"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { maskCpf, maskPhone, maskRg, normalizeDoc } from "@/lib/masks";
import { MOCK_APARTMENTS } from "@/lib/residents";
import { clearString } from "@/lib/utils";

function isRegisteredResident(
  firstName: string,
  lastName: string,
  cpf: string,
  rg: string,
  apartment: string,
): boolean {
  const apt = MOCK_APARTMENTS.find((a) => a.id.trim() === apartment.trim());
  if (!apt) return false;
  return apt.residents.some(
    (r) =>
      r.name.trim().toLowerCase() === firstName.trim().toLowerCase() &&
      r.lastName.trim().toLowerCase() === lastName.trim().toLowerCase() &&
      normalizeDoc(r.cpf) === normalizeDoc(cpf) &&
      normalizeDoc(r.rg) === normalizeDoc(rg),
  );
}

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
      responsibleId: "cd8f9d1d-0bb7-45d0-b3c5-d293f54fecdb",
      password: "",
      passwordConfirmation: "",
      apartmentId: "bb48ce7c-94ad-4637-8d08-266f6b94e866",
      condominiumId: "2a6b5660-4d64-466c-80f4-721a7a9fe456",
      role: "resident",
    },
  });

  const birthDateValue = useWatch({ control: form.control, name: "birthDate" });
  const isMinor =
    birthDateValue &&
    !isNaN(new Date(birthDateValue).getTime()) &&
    calculateAge(birthDateValue) < 18;

  const router = useRouter();
  async function onSubmit(values: FormValues) {
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
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>Crie uma conta para continuar.</CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
            <CardContent className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o seu nome" {...field} />
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
                      <Input placeholder="Digite o seu sobrenome" {...field} />
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
                      <Input
                        placeholder="000.000.000-00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(maskCpf(e.target.value))
                        }
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
                      <Input
                        placeholder="00.000.000-0"
                        {...field}
                        onChange={(e) => field.onChange(maskRg(e.target.value))}
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
                      <Input
                        placeholder="(00) 90000-0000"
                        {...field}
                        onChange={(e) =>
                          field.onChange(maskPhone(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apartment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apartamento</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o seu apartamento"
                        {...field}
                      />
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
                      <Input placeholder="Digite o seu e-mail" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem className={isMinor ? "" : "col-span-2"}>
                    <FormLabel>Data de nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormItem>
                      <FormLabel>Responsável</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nome completo do responsável"
                          {...field}
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
                      <Input
                        placeholder="Digite sua senha"
                        type="password"
                        {...field}
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
                      <Input
                        placeholder="Digite sua senha novamente"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit">Criar conta</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
};

export default SignUpForm;
