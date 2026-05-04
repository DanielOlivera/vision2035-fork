import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

// ============================================================
// ENUMS Y LABELS
// ============================================================

export const OrganizationTypeEnum = z.enum([
  "HOTEL_ALOJAMIENTO",
  "RESTAURANTE_GASTRONOMIA",
  "AGENCIA_OPERADOR",
  "PRESTADOR_SERVICIOS",
  "TRANSPORTE_TURISTICO",
  "GUIA_TURISTICO",
  "ARTESANO_PRODUCTOR",
  "COMUNIDAD_INDIGENA",
  "ORGANIZADOR_EVENTOS",
  "GOBIERNO_MUNICIPAL",
  "GOBIERNO_DEPARTAMENTAL",
  "AREA_PROTEGIDA",
  "ACADEMIA_INVESTIGACION",
  "ONG",
  "ESTUDIANTE",
  "OTRO",
]);

export const organizationTypeLabels: Record<
  z.infer<typeof OrganizationTypeEnum>,
  string
> = {
  HOTEL_ALOJAMIENTO: "Hotel / Alojamiento",
  RESTAURANTE_GASTRONOMIA: "Restaurante / Gastronomía",
  AGENCIA_OPERADOR: "Agencia u operador turístico",
  PRESTADOR_SERVICIOS: "Prestador de Servicios Turísticos local",
  TRANSPORTE_TURISTICO: "Transporte turístico",
  GUIA_TURISTICO: "Guía turístico",
  ARTESANO_PRODUCTOR: "Artesano o productor local",
  COMUNIDAD_INDIGENA: "Comunidad indígena o turismo comunitario",
  ORGANIZADOR_EVENTOS: "Organizador de eventos turísticos",
  GOBIERNO_MUNICIPAL: "Gobierno municipal",
  GOBIERNO_DEPARTAMENTAL: "Gobierno departamental",
  AREA_PROTEGIDA: "Área protegida / Conservación",
  ACADEMIA_INVESTIGACION: "Academia / Investigación",
  ONG: "Organización social o ONG",
  ESTUDIANTE: "Estudiante",
  OTRO: "Otro",
};

export const WorkshopDestinationEnum = z.enum([
  "LA_PAZ",
  "EL_ALTO",
  "COCHABAMBA",
  "SANTA_CRUZ",
  "TRINIDAD",
  "COBIJA",
  "ORURO",
  "POTOSI",
  "SUCRE",
  "TARIJA",
  "UYUNI",
  "RURRENABAQUE",
  "COPACABANA",
  "CONCEPCION_MISIONES",
  "TIWANAKU",
  "VILLATUNARI_TROPICO",
  "SAMAIPATA",
  "CAMIRI",
  "COROICO_NORTE_LA_PAZ",
  "VILLA_MONTES",
]);

export const destinationLabels: Record<
  z.infer<typeof WorkshopDestinationEnum>,
  string
> = {
  LA_PAZ: "La Paz",
  EL_ALTO: "El Alto",
  COCHABAMBA: "Cochabamba",
  SANTA_CRUZ: "Santa Cruz",
  TRINIDAD: "Trinidad (Beni)",
  COBIJA: "Cobija (Pando)",
  ORURO: "Oruro",
  POTOSI: "Potosí",
  SUCRE: "Sucre",
  TARIJA: "Tarija",
  UYUNI: "Uyuni",
  RURRENABAQUE: "Rurrenabaque",
  COPACABANA: "Copacabana",
  CONCEPCION_MISIONES: "Concepción (Misiones Jesuíticas)",
  TIWANAKU: "Tiwanaku",
  VILLATUNARI_TROPICO: "Villatunari (Trópico)",
  SAMAIPATA: "Samaipata",
  CAMIRI: "Camiri",
  COROICO_NORTE_LA_PAZ: "Coroico (Norte La Paz)",
  VILLA_MONTES: "Villa Montes",
};

// Departments (9) and their associated destination enum values
export const departmentLabels: Record<string, string> = {
  LA_PAZ: "La Paz",
  COCHABAMBA: "Cochabamba",
  ORURO: "Oruro",
  TARIJA: "Tarija",
  BENI: "Beni",
  POTOSI: "Potosí",
  SANTA_CRUZ: "Santa Cruz",
  SUCRE: "Chuquisaca",
  PANDO: "Pando",
};

// Map each department to its destination enum values
export const departmentDestinations: Record<string, (keyof typeof destinationLabels)[]> = {
  LA_PAZ: ["LA_PAZ", "EL_ALTO", "COPACABANA", "TIWANAKU", "COROICO_NORTE_LA_PAZ"],
  COCHABAMBA: ["COCHABAMBA", "VILLATUNARI_TROPICO"],
  ORURO: ["ORURO"],
  TARIJA: ["TARIJA", "VILLA_MONTES"],
  BENI: ["TRINIDAD", "RURRENABAQUE"],
  POTOSI: ["POTOSI", "UYUNI"],
  SANTA_CRUZ: ["SANTA_CRUZ", "CONCEPCION_MISIONES", "SAMAIPATA", "CAMIRI"],
  SUCRE: ["SUCRE"],
  PANDO: ["COBIJA"],
};

export const TourismExperienceEnum = z.enum([
  "MENOS_1_ANIO",
  "DE_1_A_3",
  "DE_3_A_10",
  "MAS_DE_10",
]);

export const experienceLabels: Record<
  z.infer<typeof TourismExperienceEnum>,
  string
> = {
  MENOS_1_ANIO: "Menos de 1 año",
  DE_1_A_3: "1 – 3 años",
  DE_3_A_10: "3 – 10 años",
  MAS_DE_10: "Más de 10 años",
};

export const importanceLabels: Record<number, string> = {
  1: "Nada importante",
  2: "Poco importante",
  3: "Medianamente importante",
  4: "Importante",
  5: "Muy importante",
};

export const scaleLabels: Record<number, string> = {
  1: "Muy deficiente",
  2: "Deficiente",
  3: "Regular",
  4: "Bueno",
  5: "Excelente",
};

// ============================================================
// FORMULARIO 1: REGISTRO
// ============================================================

export const registerSchema = z.object({
  fullName: z
    .string({ error: "El nombre y apellido son obligatorios" })
    .trim()
    .min(1, "El nombre y apellido son obligatorios")
    .regex(/^[\p{L}\s'-]+$/u, "El nombre no puede contener números ni caracteres especiales")
    .refine((val) => val.split(/\s+/).filter(Boolean).length >= 2, {
      message: "Por favor, ingresa tu nombre y al menos un apellido",
    })
    .transform((val) => val.replace(/\s+/g, " ")), // Limpiar espacios extra
  whatsapp: z
    .string({ error: "El número de WhatsApp es obligatorio" })
    .trim()
    .regex(/^\+[1-9]\d{6,14}$/, "Ingresa un número de WhatsApp válido")
    .refine((val) => isValidPhoneNumber(val), {
      message: "El número no tiene la cantidad correcta de dígitos para el país seleccionado",
    }),
  email: z
    .string({ error: "El correo electrónico es obligatorio" })
    .trim()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresa un correo electrónico válido (ej: usuario@correo.com)")
    .max(255)
    .toLowerCase(),
  organization: z
    .string()
    .max(200, "El nombre de la organización es demasiado largo")
    .trim()
    .optional()
    .or(z.literal("")),
  organizationType: z.string({ error: "Selecciona tu tipo de organización" }).min(1, "Selecciona tu tipo de organización"),
  organizationTypeOther: z.string().trim().optional(),
  destination: z.string({ error: "Selecciona el destino del taller" }).min(1, "Selecciona el destino del taller"),
  experience: z.string({ error: "Selecciona tu tiempo de experiencia" }).min(1, "Selecciona tu tiempo de experiencia"),
  tourismImportance: z.preprocess(
    (val) => (val === undefined || val === null || val === "" ? "" : String(val)),
    z.string()
      .min(1, "Selecciona una opción")
      .refine((v) => /^[1-5]$/.test(v), { message: "Selecciona una opción" })
      .transform(Number)
  ),
}).refine((data) => {
  if (data.organizationType === "OTRO" && (!data.organizationTypeOther || data.organizationTypeOther.length < 2)) {
    return false;
  }
  return true;
}, {
  message: "Por favor, especifica tu tipo de organización",
  path: ["organizationTypeOther"],
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ============================================================
// FORMULARIO 2: ENCUESTA (por secciones)
// ============================================================

const rating = z.coerce
  .number({
    error: "Selecciona una opción"
  })
  .int()
  .min(1, "Selecciona una opción")
  .max(5);
const optionalRating = rating.optional();

// --- Sección 2: Ecosistema turístico ---
export const ecosystemSchema = z.object({
  // Bloque 1: Movilidad
  hasAirport: z.boolean({ error: "Selecciona una opción" }),
  airportQuality: optionalRating,
  hasBusTerminal: z.boolean({ error: "Selecciona una opción" }),
  busTerminalQuality: optionalRating,
  roadQuality: rating,
  domesticConnectivity: rating,
  internationalConnectivity: rating,
  mobilityObservations: z.string().max(500, "Máximo 500 caracteres").optional().or(z.literal("")),

  // Bloque 2: Gobernanza
  publicPrivateCoordination: rating,
  actorParticipation: rating,
  institutionalSupport: rating,
  tourismPlanning: rating,
  committeeParticipation: rating,

  // Bloque 3: Residuos
  wasteManagement: rating,
  recycling: rating,
  cleanliness: rating,

  // Bloque 4: Agua
  waterAccess: rating,
  waterEfficiency: rating,
  waterQuality: rating,
  waterContamination: rating,

  // Bloque 5: Energía
  energyAccess: rating,
  energyEfficiency: rating,
  renewableEnergy: rating,

  // Bloque 6: Calidad de servicios
  hotelQuality: rating,
  restaurantQuality: rating,
  gastronomyQuality: rating,
  agencyQuality: rating,
  transportQuality: rating,
  communityServiceQuality: rating,
  craftsQuality: rating,

  // Bloque 7: Cadena de valor
  artisanIntegration: rating,
  localProducerIntegration: rating,
  culturalPromotion: rating,
  localEconomy: rating,

  // Bloque 8: Inclusión
  indigenousParticipation: rating,
  womenParticipation: rating,
  youthParticipation: rating,

  // Bloque 9: Cambio climático
  droughtRisk: rating,
  floodRisk: rating,
  climatePreparedness: rating,

  // Bloque 10: Conservación
  hasProtectedAreas: z.enum(["SI", "NO", "NO_SE"], {
    error: "Selecciona una opción"
  }),
  protectedAreasManagement: optionalRating,
  tourismConservation: rating,
  ecosystemRestoration: rating,
  communityConservation: rating,

  // Bloque 11: Normativa
  regulatoryClarity: rating,
  regulatoryFacilitation: rating,
  informalControl: rating,
  formalizationAccess: rating,
  heritageProtection: rating,

  // Bloque 12: Visión turística 2035
  tourismTypes2035: z
    .array(z.string(), { error: "Selecciona al menos 1 tipo" })
    .min(1, "Selecciona al menos 1 tipo")
    .max(3, "Máximo 3 tipos"),
  referenceDestination: z
    .string({ error: "Este campo es obligatorio" })
    .min(2, "Ingresa al menos 2 caracteres")
    .max(200)
    .trim(),
  structuralChange: z
    .string({ error: "Este campo es obligatorio" })
    .min(5, "Comparte al menos 5 caracteres")
    .max(1000)
    .trim(),
});

export type EcosystemInput = z.infer<typeof ecosystemSchema>;

// --- Sección 3: Mercado ---
export const marketSchema = z.object({
  currentMarkets: z
    .array(z.string(), { error: "Selecciona al menos 1 mercado" })
    .min(1, "Selecciona al menos 1 mercado")
    .max(3, "Máximo 3 mercados"),
  potentialMarkets: z
    .array(z.string(), { error: "Selecciona al menos 1 mercado" })
    .min(1, "Selecciona al menos 1 mercado")
    .max(3, "Máximo 3 mercados"),
});

export type MarketInput = z.infer<typeof marketSchema>;

// --- Sección 4: Identidad del destino ---
export const destinationIdentitySchema = z.object({
  destinationPride: z
    .string({ error: "Este campo es obligatorio" })
    .min(5, "Comparte al menos una idea (mínimo 5 caracteres)")
    .max(1000, "Texto demasiado largo")
    .trim(),
  naturalElements: z
    .string({ error: "Este campo es obligatorio" })
    .min(3, "Ingresa al menos 3 caracteres")
    .max(500)
    .trim(),
  culturalElements: z
    .string({ error: "Este campo es obligatorio" })
    .min(3, "Ingresa al menos 3 caracteres")
    .max(500)
    .trim(),
  uniqueExperience: z
    .string({ error: "Este campo es obligatorio" })
    .min(5, "Mínimo 5 caracteres")
    .max(1000)
    .trim(),
  differentiator: z
    .string({ error: "Este campo es obligatorio" })
    .min(5, "Mínimo 5 caracteres")
    .max(1000)
    .trim(),
  visitorMessage: z
    .string({ error: "Este campo es obligatorio" })
    .min(5, "Mínimo 5 caracteres")
    .max(1000)
    .trim(),
});

export type DestinationIdentityInput = z.infer<
  typeof destinationIdentitySchema
>;

// --- Sección 5: Identidad Bolivia ---
export const boliviaIdentitySchema = z.object({
  boliviaOneWord: z
    .string({ error: "Este campo es obligatorio" })
    .min(1, "Ingresa una palabra")
    .max(50)
    .trim(),
  boliviaUnique: z
    .string({ error: "Este campo es obligatorio" })
    .min(5, "Mínimo 5 caracteres")
    .max(1000)
    .trim(),
  visitMotivation: z
    .string({ error: "Selecciona una opción" })
    .min(1, "Selecciona una opción")
    .max(200),
  boliviaPerception: z
    .string({ error: "Selecciona una opción" })
    .min(1, "Selecciona una opción")
    .max(200),
});

export type BoliviaIdentityInput = z.infer<typeof boliviaIdentitySchema>;

export const visitMotivationLabels: Record<
  z.infer<typeof boliviaIdentitySchema>["visitMotivation"],
  string
> = {
  NATURALEZA: "Naturaleza / paisajes",
  CULTURA_HISTORIA: "Cultura e historia",
  AVENTURA: "Aventura",
  GASTRONOMIA: "Gastronomía",
  COMUNIDADES: "Experiencias auténticas con comunidades locales",
  LUJO: "Experiencia de lujo",
  OTRO: "Otro",
};

export const perceptionLabels: Record<string, string> = {
  AUTENTICO: "Un destino auténtico",
  UNICO: "Un destino único",
  ANTES_QUE_SEA_TARDE: 'Un destino "antes de que sea demasiado tarde"',
  EXCLUSIVO: "Un destino exclusivo",
  POR_DESCUBRIR: "Un destino por descubrir",
  OTRO: "Otro",
};

// --- Sección Final ---
export const finalSectionSchema = z.object({
  mainProblems: z
    .string({ error: "Este campo es obligatorio" })
    .min(5, "Comparte al menos 5 caracteres")
    .max(2000)
    .trim(),
  keyOpportunities: z
    .string({ error: "Este campo es obligatorio" })
    .min(5, "Comparte al menos 5 caracteres")
    .max(2000)
    .trim(),
  priorityProject: z
    .string({ error: "Este campo es obligatorio" })
    .min(5, "Comparte al menos 5 caracteres")
    .max(1000)
    .trim(),
  sustainabilityChange: z
    .string({ error: "Este campo es obligatorio" })
    .min(5, "Comparte al menos 5 caracteres")
    .max(1000)
    .trim(),
  tourismPriorities: z
    .array(z.string(), { error: "Selecciona al menos 1 prioridad" })
    .min(1, "Selecciona al menos 1 prioridad")
    .max(3, "Máximo 3 prioridades"),
});


export type FinalSectionInput = z.infer<typeof finalSectionSchema>;

export const tourismPriorityOptions = [
  "Infraestructura",
  "Promoción internacional",
  "Formación de talento humano",
  "Financiamiento para emprendimientos",
  "Conservación de naturaleza",
  "Turismo comunitario",
  "Seguridad turística",
  "Innovación digital",
  "Mejora de calidad de servicios",
  "Otro",
];

export const tourismType2035Options = [
  "Turismo de naturaleza",
  "Turismo comunitario",
  "Turismo cultural",
  "Turismo de aventura",
  "Turismo gastronómico",
  "Turismo científico",
  "Turismo espiritual",
  "Turismo de lujo",
  "Turismo de eventos",
  "Otro",
];

export const marketCountries = [
  "Argentina",
  "Brasil",
  "Chile",
  "Perú",
  "Paraguay",
  "Uruguay",
  "Colombia",
  "Estados Unidos",
  "Canadá",
  "México",
  "España",
  "Francia",
  "Alemania",
  "Reino Unido",
  "Italia",
  "Países Bajos",
  "Suiza",
  "Australia",
  "Japón",
  "China",
  "Corea del Sur",
  "Otros",
];

// ============================================================
// CONTACTO
// ============================================================

export const contactSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(255).trim().toLowerCase(),
  subject: z.string().max(200).trim().optional().or(z.literal("")),
  message: z.string().min(10).max(2000).trim(),
});

export type ContactInput = z.infer<typeof contactSchema>;
