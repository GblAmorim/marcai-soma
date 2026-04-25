import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { getRoomBySlug } from "@/db/queries";
import { bookingTable, userTable } from "@/db/schema";
import { auth } from "@/lib/auth";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { slug, date, startTime, endTime } = body as {
    slug?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  };

  if (!slug || !date || !startTime || !endTime) {
    return NextResponse.json(
      { error: "Campos obrigatórios ausentes." },
      { status: 400 },
    );
  }

  if (
    !DATE_RE.test(date) ||
    !TIME_RE.test(startTime) ||
    !TIME_RE.test(endTime)
  ) {
    return NextResponse.json(
      { error: "Formato de data ou horário inválido." },
      { status: 400 },
    );
  }

  const startDate = new Date(`${date}T${startTime}:00`);
  const endDate = new Date(`${date}T${endTime}:00`);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json(
      { error: "Data ou horário inválido." },
      { status: 400 },
    );
  }

  if (startDate >= endDate) {
    return NextResponse.json(
      { error: "O horário de início deve ser anterior ao horário de término." },
      { status: 400 },
    );
  }

  const room = await getRoomBySlug(slug);
  if (!room) {
    return NextResponse.json(
      { error: "Sala não encontrada." },
      { status: 404 },
    );
  }

  const user = await db.query.userTable.findFirst({
    where: eq(userTable.id, session.user.id),
  });

  if (!user) {
    return NextResponse.json(
      { error: "Usuário não encontrado." },
      { status: 404 },
    );
  }

  const [booking] = await db
    .insert(bookingTable)
    .values({
      userId: session.user.id,
      roomId: room.id,
      condominiumId: user.condominiumId,
      startDate,
      endDate,
      status: "pending",
    })
    .returning({ id: bookingTable.id });

  return NextResponse.json({ id: booking.id }, { status: 201 });
}
