// ── Types ─────────────────────────────────────────────────────

export interface Resident {
  name: string;
  lastName: string;
  cpf: string;
  rg: string;
  email: string;
  phone: string;
}

export type WorkerPermission =
  | "portaria"
  | "manutencao"
  | "limpeza"
  | "administrativo"
  | "seguranca"
  | "admin";

export const PERMISSION_LABEL: Record<WorkerPermission, string> = {
  portaria: "Portaria",
  manutencao: "Manutenção",
  limpeza: "Limpeza",
  administrativo: "Administrativo",
  seguranca: "Segurança",
  admin: "Administrador",
};

export interface Worker {
  name: string;
  lastName: string;
  cpf: string;
  rg: string;
  email: string;
  phone: string;
  permissions: WorkerPermission[];
}

export interface Apartment {
  id: string; // apartment number — the primary key, e.g. "101"
  residentCount: number;
  residents: Resident[];
  workers: Worker[];
}

// ── Mock data ─────────────────────────────────────────────────

export const MOCK_APARTMENTS: Apartment[] = [
  {
    id: "101",
    residentCount: 3,
    residents: [
      {
        name: "João",
        lastName: "Silva",
        cpf: "123.456.789-00",
        rg: "12.345.678-9",
        email: "joao.silva@email.com",
        phone: "(11) 99999-0001",
      },
      {
        name: "Maria",
        lastName: "Silva",
        cpf: "987.654.321-00",
        rg: "98.765.432-1",
        email: "maria.silva@email.com",
        phone: "(11) 99999-0002",
      },
      {
        name: "Pedro",
        lastName: "Silva",
        cpf: "111.222.333-44",
        rg: "11.222.333-4",
        email: "",
        phone: "(11) 99999-0003",
      },
    ],
    workers: [],
  },
  {
    id: "202",
    residentCount: 2,
    residents: [
      {
        name: "Maria",
        lastName: "Souza",
        cpf: "222.333.444-55",
        rg: "22.333.444-5",
        email: "maria.souza@email.com",
        phone: "(11) 98888-0001",
      },
      {
        name: "Carlos",
        lastName: "Souza",
        cpf: "333.444.555-66",
        rg: "33.444.555-6",
        email: "carlos.souza@email.com",
        phone: "(11) 98888-0002",
      },
    ],
    workers: [],
  },
];

export const MOCK_WORKERS: Worker[] = [
  {
    name: "Roberto",
    lastName: "Costa",
    cpf: "444.555.666-77",
    rg: "44.555.666-7",
    email: "roberto.costa@condominio.com",
    phone: "(11) 97777-0001",
    permissions: ["portaria", "seguranca"],
  },
  {
    name: "Ana",
    lastName: "Ferreira",
    cpf: "555.666.777-88",
    rg: "55.666.777-8",
    email: "ana.ferreira@condominio.com",
    phone: "(11) 97777-0002",
    permissions: ["administrativo", "admin"],
  },
  {
    name: "Luiz",
    lastName: "Oliveira",
    cpf: "666.777.888-99",
    rg: "66.777.888-9",
    email: "luiz.oliveira@condominio.com",
    phone: "(11) 97777-0003",
    permissions: ["manutencao"],
  },
];
