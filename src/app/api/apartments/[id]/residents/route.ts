import { and, eq, isNull, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { userTable } from "@/db/schema";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: apartmentId } = await params;

  const today = new Date().toISOString().split("T")[0];

  const residents = await db
    .select({
      id: userTable.id,
      firstName: userTable.firstName,
      lastName: userTable.lastName,
    })
    .from(userTable)
    .where(
      and(
        eq(userTable.apartmentId, apartmentId),
        isNull(userTable.deletedAt),
        // Only adults (18+)
        sql`EXTRACT(YEAR FROM AGE(${userTable.birthDate})) >= 18`,
      ),
    )
    .orderBy(userTable.firstName, userTable.lastName);

  return NextResponse.json(residents);
}
