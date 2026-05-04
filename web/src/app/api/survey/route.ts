import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  ecosystemSchema,
  marketSchema,
  destinationIdentitySchema,
  boliviaIdentitySchema,
  finalSectionSchema,
} from "@/lib/validations";

export const dynamic = "force-dynamic";

const sectionSchemas = {
  ecosystem: ecosystemSchema,
  market: marketSchema,
  destinationIdentity: destinationIdentitySchema,
  boliviaIdentity: boliviaIdentitySchema,
  finalSection: finalSectionSchema,
} as const;

type SectionName = keyof typeof sectionSchemas;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { participantId, section, data } = body;

    if (!participantId || typeof participantId !== "string") {
      return NextResponse.json(
        { error: "participantId es requerido" },
        { status: 400 }
      );
    }

    if (!section || !(section in sectionSchemas)) {
      return NextResponse.json(
        {
          error: "Sección inválida",
          validSections: Object.keys(sectionSchemas),
        },
        { status: 400 }
      );
    }

    const schema = sectionSchemas[section as SectionName];
    const parsed = schema.safeParse(data);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Verify participant exists
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Participante no encontrado" },
        { status: 404 }
      );
    }

    // Upsert survey
    const existingSurvey = await prisma.survey.findUnique({
      where: { participantId },
    });

    const updateData = mapSectionToDbFields(
      section as SectionName,
      parsed.data
    );

    const totalSections = Object.keys(sectionSchemas).length;

    let survey;
    if (existingSurvey) {
      survey = await prisma.survey.update({
        where: { participantId },
        data: updateData,
      });
    } else {
      survey = await prisma.survey.create({
        data: {
          participantId,
          ecosystemRatings: {},
          currentMarkets: [],
          potentialMarkets: [],
          tourismPriorities: [],
          tourismTypes2035: [],
          ...updateData,
        },
      });
    }

    // Compute completedSections from actual data, not a blind counter
    const completedSections = countCompletedSections(survey);

    await prisma.survey.update({
      where: { participantId },
      data: {
        completedSections,
        isComplete: completedSections >= totalSections,
      },
    });

    return NextResponse.json({
      message: "Sección guardada exitosamente",
      section,
      completedSections,
      totalSections,
    });
  } catch (error) {
    console.error("Survey error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get("participantId");

    if (!participantId) {
      return NextResponse.json(
        { error: "participantId es requerido" },
        { status: 400 }
      );
    }

    const survey = await prisma.survey.findUnique({
      where: { participantId },
    });

    return NextResponse.json({ survey });
  } catch (error) {
    console.error("Survey GET error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Count completed sections by inspecting actual survey data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function countCompletedSections(survey: any): number {
  let count = 0;
  const eco = survey.ecosystemRatings;
  if (eco && typeof eco === "object" && Object.keys(eco).length > 0) count++;
  if (survey.currentMarkets?.length > 0) count++;
  if (survey.destinationPride) count++;
  if (survey.boliviaOneWord) count++;
  if (survey.mainProblems) count++;
  return count;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSectionToDbFields(section: SectionName, data: any) {
  switch (section) {
    case "ecosystem": {
      const {
        hasAirport,
        hasBusTerminal,
        hasProtectedAreas,
        mobilityObservations,
        tourismTypes2035,
        referenceDestination,
        structuralChange,
        ...ratings
      } = data;
      return {
        ecosystemRatings: ratings,
        hasAirport,
        hasBusTerminal,
        hasProtectedAreas: hasProtectedAreas as "SI" | "NO" | "NO_SE",
        mobilityObservations: mobilityObservations || null,
        tourismTypes2035: tourismTypes2035 ?? [],
        referenceDestination: referenceDestination || null,
        structuralChange: structuralChange || null,
      };
    }
    case "market":
      return {
        currentMarkets: data.currentMarkets,
        potentialMarkets: data.potentialMarkets,
      };
    case "destinationIdentity":
      return {
        destinationPride: data.destinationPride,
        naturalElements: data.naturalElements,
        culturalElements: data.culturalElements,
        uniqueExperience: data.uniqueExperience,
        differentiator: data.differentiator,
        visitorMessage: data.visitorMessage,
      };
    case "boliviaIdentity":
      return {
        boliviaOneWord: data.boliviaOneWord,
        boliviaUnique: data.boliviaUnique,
        visitMotivation: data.visitMotivation,
        boliviaPerception: data.boliviaPerception,
      };
    case "finalSection":
      return {
        mainProblems: data.mainProblems,
        keyOpportunities: data.keyOpportunities,
        priorityProject: data.priorityProject,
        sustainabilityChange: data.sustainabilityChange,
        tourismPriorities: data.tourismPriorities,
      };
    default:
      return {};
  }
}
