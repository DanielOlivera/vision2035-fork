import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import type { OrganizationType, WorkshopDestination, TourismExperience } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const participant = await prisma.participant.create({
      data: {
        fullName: data.fullName,
        whatsapp: data.whatsapp,
        email: data.email,
        organization: data.organization || null,
        organizationType: data.organizationType as OrganizationType,
        destination: data.destination as WorkshopDestination,
        experience: data.experience as TourismExperience,
        tourismImportance: data.tourismImportance,
      },
    });

    return NextResponse.json(
      {
        message: "Registro exitoso",
        participantId: participant.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const count = await prisma.participant.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Count error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
