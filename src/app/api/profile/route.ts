import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { apartmentTable, condominiumTable, userTable } from "@/db/schema";
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

  return NextResponse.json({
    condominiumName: user.condominium?.name ?? null,
    apartment: user.apartment
      ? {
          tower: user.apartment.tower,
          apartmentBlock: user.apartment.apartmentBlock,
          apartmentNumber: user.apartment.apartmentNumber,
        }
      : null,
    responsibleName,
  });
}
