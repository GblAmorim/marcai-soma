import "dotenv/config";

import { db } from ".";
import {
  apartmentTable,
  bookingTable,
  categoryTable,
  condominiumTable,
  roomItemsTable,
  roomRulesTable,
  roomTable,
  userTable,
} from "./schema";

async function main() {
  console.log("🌱 Iniciando o seeding do banco de dados...");

  try {
    // ── Limpar dados existentes (ordem: filhos → pais) ──────────
    console.log("🧹 Limpando dados existentes...");
    await db.delete(bookingTable);
    await db.delete(roomItemsTable);
    await db.delete(roomRulesTable);
    await db.delete(roomTable);
    await db.delete(categoryTable);
    await db.delete(userTable);
    await db.delete(apartmentTable);
    await db.delete(condominiumTable);
    console.log("✅ Dados limpos!");

    // ── Condomínio ───────────────────────────────────────────────
    const condominiumId = crypto.randomUUID();
    await db.insert(condominiumTable).values({
      id: condominiumId,
      name: "Condomínio Marcaí",
      slug: "condominio-marcai",
      address: "Rua Exemplo, 100 — São Paulo, SP",
    });
    console.log("🏢 Condomínio criado.");

    // ── Apartamento ──────────────────────────────────────────────
    const apartmentId = crypto.randomUUID();
    await db.insert(apartmentTable).values({
      id: apartmentId,
      condominiumId,
      tower: "1",
      apartmentNumber: "101",
      apartmentBlock: "A",
    });
    console.log("🚪 Apartamento criado.");

    // ── Usuário admin ────────────────────────────────────────────
    const adminId = crypto.randomUUID();
    await db.insert(userTable).values({
      id: adminId,
      firstName: "Admin",
      lastName: "Marcaí",
      cpf: "00000000000",
      rg: "000000000",
      condominiumId,
      apartmentId,
      phoneNumber: "11999990000",
      birthDate: "1990-01-01",
      email: "admin@marcai.com",
      role: "admin",
    });
    console.log(
      "👤 Admin criado  — admin@marcai.com / (defina a senha via app)",
    );

    // ── Usuário morador ──────────────────────────────────────────
    const residentId = crypto.randomUUID();
    await db.insert(userTable).values({
      id: residentId,
      firstName: "João",
      lastName: "Silva",
      cpf: "11111111111",
      rg: "111111111",
      condominiumId,
      apartmentId,
      phoneNumber: "11988880000",
      birthDate: "1995-06-15",
      email: "joao@marcai.com",
      role: "resident",
    });
    console.log("👤 Morador criado — joao@marcai.com");

    // ── Categorias ────────────────────────────────────────────────
    const categoryId = crypto.randomUUID();
    await db.insert(categoryTable).values({
      id: categoryId,
      name: "Salões",
      slug: "saloes",
    });

    const categoryLazerId = crypto.randomUUID();
    await db.insert(categoryTable).values({
      id: categoryLazerId,
      name: "Lazer",
      slug: "lazer",
    });
    console.log("📂 Categorias criadas.");

    // ── Sala: Salão de Festa ──────────────────────────────────────
    const roomId = crypto.randomUUID();
    await db.insert(roomTable).values({
      id: roomId,
      condominiumId,
      categoryId,
      slug: "salao-de-festa",
      name: "Salão de Festa",
      description: "Espaço amplo para festas e celebrações com até 80 pessoas.",
      imageUrl: "/banner-01.png",
      priceInCents: 0,
      openingTime: "10:00",
      closingTime: "22:00",
      availableWeekDays: [0, 1, 2, 3, 4, 5, 6],
      minorAloneAllowed: false,
      floor: "1",
      maxCapacity: 80,
      maxOverlaps: 0,
      dayUse: false,
      maxBookingsDailyLimit: 1,
      maxBookingsWeeklyLimit: 2,
      maxBookingsMonthlyLimit: 4,
    });

    // ── Sala: Churrasqueira ───────────────────────────────────────
    const bbqRoomId = crypto.randomUUID();
    await db.insert(roomTable).values({
      id: bbqRoomId,
      condominiumId,
      categoryId: categoryLazerId,
      slug: "churrasqueira",
      name: "Churrasqueira",
      description:
        "Área de churrasco coberta com churrasqueira a carvão, mesas e pias. Reserva por dia inteiro.",
      imageUrl: "/banner-01.png",
      priceInCents: 5000,
      openingTime: "09:00",
      closingTime: "20:00",
      availableWeekDays: [5, 6, 0],
      minorAloneAllowed: true,
      floor: "1",
      maxCapacity: 30,
      maxOverlaps: 0,
      dayUse: true,
      maxBookingsDailyLimit: 1,
      maxBookingsWeeklyLimit: 1,
      maxBookingsMonthlyLimit: 2,
    });
    console.log("🏠 Salas criadas.");

    // ── Regras da sala ───────────────────────────────────────────
    await db.insert(roomRulesTable).values({
      id: crypto.randomUUID(),
      roomId,
      rule: "Não é permitido o uso de som acima de 80 dB após as 22h.",
    });
    await db.insert(roomRulesTable).values({
      id: crypto.randomUUID(),
      roomId,
      rule: "O espaço deve ser deixado limpo ao final do uso.",
    });
    await db.insert(roomRulesTable).values({
      id: crypto.randomUUID(),
      roomId: bbqRoomId,
      rule: "Carvão não é fornecido pelo condomínio.",
    });
    await db.insert(roomRulesTable).values({
      id: crypto.randomUUID(),
      roomId: bbqRoomId,
      rule: "A área deve ser limpa e a churrasqueira esfriada antes de sair.",
    });
    console.log("📋 Regras criadas.");

    // ── Itens da sala ─────────────────────────────────────────────
    await db.insert(roomItemsTable).values({
      id: crypto.randomUUID(),
      roomId,
      item: "Mesas e cadeiras",
    });
    await db.insert(roomItemsTable).values({
      id: crypto.randomUUID(),
      roomId,
      item: "Cozinha equipada",
    });
    await db.insert(roomItemsTable).values({
      id: crypto.randomUUID(),
      roomId: bbqRoomId,
      item: "Churrasqueira a carvão",
    });
    await db.insert(roomItemsTable).values({
      id: crypto.randomUUID(),
      roomId: bbqRoomId,
      item: "Mesas e bancos de madeira",
    });
    await db.insert(roomItemsTable).values({
      id: crypto.randomUUID(),
      roomId: bbqRoomId,
      item: "Pia e bancada",
    });
    console.log("📦 Itens criados.");

    // ── Reserva de exemplo ────────────────────────────────────────
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const bookingStart = new Date(tomorrow);
    bookingStart.setHours(14, 0, 0, 0);
    const bookingEnd = new Date(tomorrow);
    bookingEnd.setHours(18, 0, 0, 0);

    await db.insert(bookingTable).values({
      id: crypto.randomUUID(),
      userId: residentId,
      roomId,
      condominiumId,
      startDate: bookingStart,
      endDate: bookingEnd,
      status: "active",
    });
    console.log("📅 Reserva criada.");

    console.log("\n✅ Seeding concluído com sucesso!");
    console.log("   Condomínio : Condomínio Marcaí");
    console.log("   Apartamento: Torre 1 · Bloco A · 101");
    console.log("   Admin      : admin@marcai.com");
    console.log("   Morador    : joao@marcai.com");
    console.log("   Salas      : Salão de Festa (10h–22h) | Churrasqueira dayUse (Sex–Dom, 09h–20h)");
  } catch (error) {
    console.error("❌ Erro durante o seeding:", error);
    throw error;
  }
}

main().catch(console.error);
