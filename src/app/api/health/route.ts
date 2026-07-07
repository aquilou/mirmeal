import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Evita el cacheo estático: siempre comprueba en tiempo real.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", db: "connected" });
  } catch (error) {
    return NextResponse.json(
      { status: "error", db: "unreachable" },
      { status: 503 }
    );
  }
}
