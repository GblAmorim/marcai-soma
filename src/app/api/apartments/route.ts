import { and, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { apartmentTable } from "@/db/schema";

export async function GET(request: NextRequest) {
  const condominiumId = request.nextUrl.searchParams.get("condominiumId");

  if (!condominiumId) {
    return NextResponse.json(
      { error: "condominiumId is required" },
      { status: 400 },
    );
  }

  const apartments = await db
    .select({
      id: apartmentTable.id,
      tower: apartmentTable.tower,
      apartmentNumber: apartmentTable.apartmentNumber,
      apartmentBlock: apartmentTable.apartmentBlock,
    })
    .from(apartmentTable)
    .where(
      and(
        eq(apartmentTable.condominiumId, condominiumId),
        isNull(apartmentTable.deletedAt),
      ),
    )
    .orderBy(
      apartmentTable.tower,
      apartmentTable.apartmentBlock,
      apartmentTable.apartmentNumber,
    );

  return NextResponse.json(apartments);
}
