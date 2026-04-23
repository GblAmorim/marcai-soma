import { eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { condominiumTable } from "@/db/schema";

export async function GET() {
  const condominiums = await db
    .select({ id: condominiumTable.id, name: condominiumTable.name })
    .from(condominiumTable)
    .where(isNull(condominiumTable.deletedAt))
    .orderBy(condominiumTable.name);

  return NextResponse.json(condominiums);
}
