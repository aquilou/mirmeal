import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // bcrypt/prisma no corren en el edge

const schema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  email: z.string().email(),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos no válidos" }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Ese correo ya está registrado" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name, email, passwordHash }, // rol CUSTOMER por defecto
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
