import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { userTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    phoneNumber?: string;
    password?: string;
  };

  const rawPhone = body.phoneNumber?.replace(/\D/g, "");
  const { password } = body;

  if (!rawPhone || !password) {
    return NextResponse.json(
      { error: "phoneNumber e password são obrigatórios." },
      { status: 400 },
    );
  }

  // Look up the user's email by phone number
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.phoneNumber, rawPhone),
  });

  if (!user) {
    return NextResponse.json(
      { error: "INVALID_PHONE_NUMBER_OR_PASSWORD" },
      { status: 401 },
    );
  }

  // Delegate to better-auth's email sign-in (handles password verification & session creation)
  const signInResponse = await auth.api.signInEmail({
    body: { email: user.email, password },
    headers: request.headers,
  });

  return signInResponse;
}
