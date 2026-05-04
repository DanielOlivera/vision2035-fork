-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('HOTEL_ALOJAMIENTO', 'RESTAURANTE_GASTRONOMIA', 'AGENCIA_OPERADOR', 'PRESTADOR_SERVICIOS', 'TRANSPORTE_TURISTICO', 'GUIA_TURISTICO', 'ARTESANO_PRODUCTOR', 'COMUNIDAD_INDIGENA', 'ORGANIZADOR_EVENTOS', 'GOBIERNO_MUNICIPAL', 'GOBIERNO_DEPARTAMENTAL', 'AREA_PROTEGIDA', 'ACADEMIA_INVESTIGACION', 'ONG', 'ESTUDIANTE', 'OTRO');

-- CreateEnum
CREATE TYPE "WorkshopDestination" AS ENUM ('LA_PAZ', 'EL_ALTO', 'COCHABAMBA', 'SANTA_CRUZ', 'TRINIDAD', 'COBIJA', 'ORURO', 'POTOSI', 'SUCRE', 'TARIJA', 'UYUNI', 'RURRENABAQUE', 'COPACABANA', 'CONCEPCION_MISIONES', 'TIWANAKU', 'VILLATUNARI_TROPICO', 'SAMAIPATA', 'CAMIRI', 'COROICO_NORTE_LA_PAZ', 'VILLA_MONTES');

-- CreateEnum
CREATE TYPE "TourismExperience" AS ENUM ('MENOS_1_ANIO', 'DE_1_A_3', 'DE_3_A_10', 'MAS_DE_10');

-- CreateEnum
CREATE TYPE "TriState" AS ENUM ('SI', 'NO', 'NO_SE');

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organization" TEXT,
    "organization_type" "OrganizationType" NOT NULL,
    "destination" "WorkshopDestination" NOT NULL,
    "experience" "TourismExperience" NOT NULL,
    "tourism_importance" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surveys" (
    "id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "ecosystem_ratings" JSONB NOT NULL,
    "has_airport" BOOLEAN,
    "has_bus_terminal" BOOLEAN,
    "has_protected_areas" "TriState",
    "mobility_observations" TEXT,
    "current_markets" TEXT[],
    "potential_markets" TEXT[],
    "destination_pride" TEXT,
    "natural_elements" TEXT,
    "cultural_elements" TEXT,
    "unique_experience" TEXT,
    "differentiator" TEXT,
    "visitor_message" TEXT,
    "bolivia_one_word" TEXT,
    "bolivia_unique" TEXT,
    "visit_motivation" TEXT,
    "bolivia_perception" TEXT,
    "main_problems" TEXT,
    "key_opportunities" TEXT,
    "priority_project" TEXT,
    "sustainability_change" TEXT,
    "tourism_priorities" TEXT[],
    "tourism_types_2035" TEXT[],
    "reference_destination" TEXT,
    "structural_change" TEXT,
    "completed_sections" INTEGER NOT NULL DEFAULT 0,
    "is_complete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "destination" "WorkshopDestination" NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 50,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workshops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "surveys_participant_id_key" ON "surveys"("participant_id");

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

