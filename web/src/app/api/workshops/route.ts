import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const workshops = await prisma.workshop.findMany({
      where: { isActive: true },
      orderBy: { date: "asc" },
      select: {
        id: true,
        name: true,
        destination: true,
        city: true,
        date: true,
        capacity: true,
      },
    });

    return NextResponse.json(workshops);
  } catch (error) {
    console.error("Workshops error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
