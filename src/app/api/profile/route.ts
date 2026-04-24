import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import {
  apartmentTable,
  condominiumTable,
  userTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const user = await db.query.userTable.findFirst({
    where: eq(userTable.id, userId),
    with: {
      condominium: true,
      apartment: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let responsibleName: string | null = null;
  if (user.responsibleId) {
    const responsible = await db.query.userTable.findFirst({
      where: eq(userTable.id, user.responsibleId),
    });
    if (responsible) {
      responsibleName = `${responsible.firstName} ${responsible.lastName}`;
    }
  }

  const condominium = (user as typeof user & { condominium?: typeof condominiumTable.$inferSelect }).condominium ?? null;
  const apartment = (user as typeof user & { apartment?: typeof apartmentTable.$inferSelect }).apartment ?? null;

  return NextResponse.json({
    condominiumName: condominium?.name ?? null,
    apartment: apartment
      ? {
          tower: apartment.tower,
          apartmentBlock: apartment.apartmentBlock,
          apartmentNumber: apartment.apartmentNumber,
        }
      : null,
    responsibleName,
  });
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { phoneNumber?: string };
  const { phoneNumber } = body;

  if (!phoneNumber) {
    return NextResponse.json(
      { error: "phoneNumber é obrigatório." },
      { status: 400 },
    );
  }

  // Only digits, 10 or 11 characters (Brazilian mobile numbers)
  if (!/^\d{10,11}$/.test(phoneNumber)) {
    return NextResponse.json(
      { error: "Número de celular inválido." },
      { status: 400 },
    );
  }

  await db
    .update(userTable)
    .set({ phoneNumber })
    .where(eq(userTable.id, session.user.id));

  return NextResponse.json({ success: true });
}
