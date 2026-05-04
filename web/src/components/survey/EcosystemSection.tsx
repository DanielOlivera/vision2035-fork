"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { tourismType2035Options } from "@/lib/validations";
import {
  RatingScale,
  BooleanToggle,
  TriStateToggle,
  BlockTitle,
  CheckboxGroup,
  SectionSubmitButton,
  inputBaseClass,
  textareaClass,
  errorClass,
} from "./shared";

interface EcosystemData {
  // Bloque 1
  hasAirport: boolean;
  airportQuality?: number;
  hasBusTerminal: boolean;
  busTerminalQuality?: number;
  roadQuality: number;
  domesticConnectivity: number;
  internationalConnectivity: number;
  mobilityObservations?: string;
  // Bloque 2
  publicPrivateCoordination: number;
  actorParticipation: number;
  institutionalSupport: number;
  tourismPlanning: number;
  committeeParticipation: number;
  // Bloque 3
  wasteManagement: number;
  recycling: number;
  cleanliness: number;
  // Bloque 4
  waterAccess: number;
  waterEfficiency: number;
  waterQuality: number;
  waterContamination: number;
  // Bloque 5
  energyAccess: number;
  energyEfficiency: number;
  renewableEnergy: number;
  // Bloque 6
  hotelQuality: number;
  restaurantQuality: number;
  gastronomyQuality: number;
  agencyQuality: number;
  transportQuality: number;
  communityServiceQuality: number;
  craftsQuality: number;
  // Bloque 7
  artisanIntegration: number;
  localProducerIntegration: number;
  culturalPromotion: number;
  localEconomy: number;
  // Bloque 8
  indigenousParticipation: number;
  womenParticipation: number;
  youthParticipation: number;
  // Bloque 9
  droughtRisk: number;
  floodRisk: number;
  climatePreparedness: number;
  // Bloque 10
  hasProtectedAreas: string;
  protectedAreasManagement?: number;
  tourismConservation: number;
  ecosystemRestoration: number;
  communityConservation: number;
  // Bloque 11
  regulatoryClarity: number;
  regulatoryFacilitation: number;
  informalControl: number;
  formalizationAccess: number;
  heritageProtection: number;
  // Bloque 12: Visión 2035
  tourismTypes2035: string[];
  referenceDestination: string;
  structuralChange: string;
}

interface Props {
  onSubmit: (data: EcosystemData) => Promise<void>;
  loading: boolean;
  pid: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: Record<string, any> | null;
}

const DRAFT_KEY_ECO = "survey_draft_ecosystem";
const DRAFT_KEY_V35 = "survey_draft_vision2035";

function loadDraft(pid: string, key: string) {
  try {
    const raw = localStorage.getItem(`${key}_${pid}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveDraft(pid: string, key: string, data: unknown) {
  try { localStorage.setItem(`${key}_${pid}`, JSON.stringify(data)); } catch { /* ignore */ }
}

function clearDraft(pid: string, key: string) {
  try { localStorage.removeItem(`${key}_${pid}`); } catch { /* ignore */ }
}

// Parse DB tourismTypes2035 array: "Otro: text" → "Otro" + extract text
function parseDbTourismTypes(types: string[] | undefined | null): { types: string[]; otherText: string } {
  if (!types || !Array.isArray(types)) return { types: [], otherText: "" };
  let otherText = "";
  const parsed = types.map((t) => {
    if (t.startsWith("Otro: ")) {
      otherText = t.slice(6);
      return "Otro";
    }
    return t;
  });
  return { types: parsed, otherText };
}

// Rebuild ecosystem fields from DB survey (ecosystemRatings JSON + separate fields)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToEcosystem(survey: Record<string, any>): Partial<EcosystemData> {
  const ratings = (typeof survey.ecosystemRatings === "object" && survey.ecosystemRatings) || {};
  const { types } = parseDbTourismTypes(survey.tourismTypes2035);
  return {
    ...ratings,
    hasAirport: survey.hasAirport ?? undefined,
    hasBusTerminal: survey.hasBusTerminal ?? undefined,
    hasProtectedAreas: survey.hasProtectedAreas ?? undefined,
    mobilityObservations: survey.mobilityObservations ?? undefined,
    tourismTypes2035: types.length > 0 ? types : undefined,
    referenceDestination: survey.referenceDestination ?? undefined,
    structuralChange: survey.structuralChange ?? undefined,
  };
}

export default function EcosystemSection({ onSubmit, loading, pid, initialData }: Props) {
  // Seed from: localStorage draft > DB data > empty
  const [d, setD] = useState<Partial<EcosystemData>>(() => {
    const draft = loadDraft(pid, DRAFT_KEY_ECO);
    if (draft) return draft;
    if (initialData) return dbToEcosystem(initialData);
    return {};
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [observations, setObservations] = useState(() => {
    const draft = loadDraft(pid, DRAFT_KEY_ECO);
    return draft?.mobilityObservations ?? initialData?.mobilityObservations ?? "";
  });

  // Block 12 state — fallback chain: localStorage draft > DB data > empty
  const [tourismTypes2035, setTourismTypes2035] = useState<string[]>(() => {
    const draft = loadDraft(pid, DRAFT_KEY_V35);
    if (draft?.tourismTypes2035) return draft.tourismTypes2035;
    const { types } = parseDbTourismTypes(initialData?.tourismTypes2035);
    return types;
  });
  const [otherType, setOtherType] = useState(() => {
    const draft = loadDraft(pid, DRAFT_KEY_V35);
    if (draft?.otherType !== undefined) return draft.otherType;
    const { otherText } = parseDbTourismTypes(initialData?.tourismTypes2035);
    return otherText;
  });
  const [referenceDestination, setReferenceDestination] = useState(() => {
    const draft = loadDraft(pid, DRAFT_KEY_V35);
    return draft?.referenceDestination ?? initialData?.referenceDestination ?? "";
  });
  const [structuralChange, setStructuralChange] = useState(() => {
    const draft = loadDraft(pid, DRAFT_KEY_V35);
    return draft?.structuralChange ?? initialData?.structuralChange ?? "";
  });

  // Auto-save ecosystem draft to localStorage
  useEffect(() => {
    const timer = setTimeout(() => saveDraft(pid, DRAFT_KEY_ECO, { ...d, mobilityObservations: observations }), 400);
    return () => clearTimeout(timer);
  }, [d, observations, pid]);

  // Auto-save vision2035 draft to localStorage
  useEffect(() => {
    const timer = setTimeout(() => saveDraft(pid, DRAFT_KEY_V35, { tourismTypes2035, otherType, referenceDestination, structuralChange }), 400);
    return () => clearTimeout(timer);
  }, [tourismTypes2035, otherType, referenceDestination, structuralChange, pid]);

  function set<K extends keyof EcosystemData>(key: K, val: EcosystemData[K]) {
    setD((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  // All required rating fields
  const requiredRatings: (keyof EcosystemData)[] = [
    "roadQuality", "domesticConnectivity", "internationalConnectivity",
    "publicPrivateCoordination", "actorParticipation", "institutionalSupport", "tourismPlanning", "committeeParticipation",
    "wasteManagement", "recycling", "cleanliness",
    "waterAccess", "waterEfficiency", "waterQuality", "waterContamination",
    "energyAccess", "energyEfficiency", "renewableEnergy",
    "hotelQuality", "restaurantQuality", "gastronomyQuality", "agencyQuality", "transportQuality", "communityServiceQuality", "craftsQuality",
    "artisanIntegration", "localProducerIntegration", "culturalPromotion", "localEconomy",
    "indigenousParticipation", "womenParticipation", "youthParticipation",
    "droughtRisk", "floodRisk", "climatePreparedness",
    "tourismConservation", "ecosystemRestoration", "communityConservation",
    "regulatoryClarity", "regulatoryFacilitation", "informalControl", "formalizationAccess", "heritageProtection",
  ];

  function clearError(key: string) {
    setErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};

    if (d.hasAirport === undefined) errs.hasAirport = "Selecciona una opción";
    if (d.hasBusTerminal === undefined) errs.hasBusTerminal = "Selecciona una opción";
    if (d.hasProtectedAreas === undefined) errs.hasProtectedAreas = "Selecciona una opción";

    for (const key of requiredRatings) {
      if (d[key] === undefined) errs[key] = "Selecciona una opción";
    }

    // Block 12 validation
    if (tourismTypes2035.length < 1) errs.tourismTypes2035 = "Selecciona al menos 1 tipo";
    if (tourismTypes2035.includes("Otro") && !otherType.trim()) errs.otherType = "Especifica el tipo de turismo";
    if (referenceDestination.trim().length < 2) errs.referenceDestination = "Ingresa al menos 2 caracteres";
    if (structuralChange.trim().length < 5) errs.structuralChange = "Comparte al menos 5 caracteres";

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0];
      const el = document.getElementById(`eco-${firstKey}`) || document.getElementById(firstKey);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const resolvedTypes = tourismTypes2035.map((t) =>
      t === "Otro" && otherType.trim() ? `Otro: ${otherType.trim()}` : t
    );

    await onSubmit({
      hasAirport: d.hasAirport!,
      airportQuality: d.hasAirport ? d.airportQuality : undefined,
      hasBusTerminal: d.hasBusTerminal!,
      busTerminalQuality: d.hasBusTerminal ? d.busTerminalQuality : undefined,
      roadQuality: d.roadQuality!,
      domesticConnectivity: d.domesticConnectivity!,
      internationalConnectivity: d.internationalConnectivity!,
      mobilityObservations: observations || undefined,
      publicPrivateCoordination: d.publicPrivateCoordination!,
      actorParticipation: d.actorParticipation!,
      institutionalSupport: d.institutionalSupport!,
      tourismPlanning: d.tourismPlanning!,
      committeeParticipation: d.committeeParticipation!,
      wasteManagement: d.wasteManagement!,
      recycling: d.recycling!,
      cleanliness: d.cleanliness!,
      waterAccess: d.waterAccess!,
      waterEfficiency: d.waterEfficiency!,
      waterQuality: d.waterQuality!,
      waterContamination: d.waterContamination!,
      energyAccess: d.energyAccess!,
      energyEfficiency: d.energyEfficiency!,
      renewableEnergy: d.renewableEnergy!,
      hotelQuality: d.hotelQuality!,
      restaurantQuality: d.restaurantQuality!,
      gastronomyQuality: d.gastronomyQuality!,
      agencyQuality: d.agencyQuality!,
      transportQuality: d.transportQuality!,
      communityServiceQuality: d.communityServiceQuality!,
      craftsQuality: d.craftsQuality!,
      artisanIntegration: d.artisanIntegration!,
      localProducerIntegration: d.localProducerIntegration!,
      culturalPromotion: d.culturalPromotion!,
      localEconomy: d.localEconomy!,
      indigenousParticipation: d.indigenousParticipation!,
      womenParticipation: d.womenParticipation!,
      youthParticipation: d.youthParticipation!,
      droughtRisk: d.droughtRisk!,
      floodRisk: d.floodRisk!,
      climatePreparedness: d.climatePreparedness!,
      hasProtectedAreas: d.hasProtectedAreas!,
      protectedAreasManagement: d.hasProtectedAreas === "SI" ? d.protectedAreasManagement : undefined,
      tourismConservation: d.tourismConservation!,
      ecosystemRestoration: d.ecosystemRestoration!,
      communityConservation: d.communityConservation!,
      regulatoryClarity: d.regulatoryClarity!,
      regulatoryFacilitation: d.regulatoryFacilitation!,
      informalControl: d.informalControl!,
      formalizationAccess: d.formalizationAccess!,
      heritageProtection: d.heritageProtection!,
      tourismTypes2035: resolvedTypes,
      referenceDestination: referenceDestination.trim(),
      structuralChange: structuralChange.trim(),
    } as EcosystemData);
    clearDraft(pid, DRAFT_KEY_ECO);
    clearDraft(pid, DRAFT_KEY_V35);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Section header */}
      <div className="text-center mb-6">
        <h2 className="text-lg md:text-xl font-black text-bolivia-dark uppercase tracking-tight leading-snug">
          Sección 2: Evaluando el Ecosistema Turístico de Mi Destino
        </h2>
        <div className="h-1 w-16 bg-bolivia-green mx-auto mt-3 rounded-full" />
      </div>

      {/* Bloque 1: Movilidad */}
      <BlockTitle>Bloque 1: Movilidad y conectividad</BlockTitle>

      <div id="eco-hasAirport">
        <BooleanToggle name="hasAirport" label="¿Su destino cuenta con aeropuerto?" value={d.hasAirport} onChange={(v) => set("hasAirport", v)} error={errors.hasAirport} />
      </div>
      {d.hasAirport && (
        <div id="eco-airportQuality">
          <RatingScale name="airportQuality" label="¿Cómo evalúa la calidad del aeropuerto de su destino?" value={d.airportQuality} onChange={(v) => set("airportQuality", v)} error={errors.airportQuality} />
        </div>
      )}
      <div id="eco-hasBusTerminal">
        <BooleanToggle name="hasBusTerminal" label="¿Su destino cuenta con terminal de buses propia?" value={d.hasBusTerminal} onChange={(v) => set("hasBusTerminal", v)} error={errors.hasBusTerminal} />
      </div>
      {d.hasBusTerminal && (
        <div id="eco-busTerminalQuality">
          <RatingScale name="busTerminalQuality" label="¿Cómo evalúa la infraestructura de la terminal de buses?" value={d.busTerminalQuality} onChange={(v) => set("busTerminalQuality", v)} error={errors.busTerminalQuality} />
        </div>
      )}
      <div id="eco-roadQuality">
        <RatingScale name="roadQuality" label="¿Cómo evalúa la calidad de las carreteras de acceso a su destino?" value={d.roadQuality} onChange={(v) => set("roadQuality", v)} error={errors.roadQuality} />
      </div>
      <div id="eco-domesticConnectivity">
        <RatingScale name="domesticConnectivity" label="¿Cómo evalúa la conectividad aérea nacional hacia su destino?" value={d.domesticConnectivity} onChange={(v) => set("domesticConnectivity", v)} error={errors.domesticConnectivity} />
      </div>
      <div id="eco-internationalConnectivity">
        <RatingScale name="internationalConnectivity" label="¿Cómo evalúa la conectividad internacional de su destino?" value={d.internationalConnectivity} onChange={(v) => set("internationalConnectivity", v)} error={errors.internationalConnectivity} />
      </div>
      <div className="py-3">
        <p className="text-sm font-semibold text-gray-700 mb-2.5">Observaciones sobre movilidad (opcional)</p>
        <textarea value={observations} onChange={(e) => setObservations(e.target.value)} maxLength={500} rows={2} className={textareaClass} placeholder="Algún comentario adicional..." />
      </div>

      {/* Bloque 2: Gobernanza */}
      <BlockTitle>Bloque 2: Gobernanza turística</BlockTitle>
      <div id="eco-publicPrivateCoordination">
        <RatingScale name="publicPrivateCoordination" label="¿Existen espacios de coordinación entre sector público y privado en el destino?" value={d.publicPrivateCoordination} onChange={(v) => set("publicPrivateCoordination", v)} error={errors.publicPrivateCoordination} />
      </div>
      <div id="eco-actorParticipation">
        <RatingScale name="actorParticipation" label="¿Los actores turísticos participan en la toma de decisiones del destino?" value={d.actorParticipation} onChange={(v) => set("actorParticipation", v)} error={errors.actorParticipation} />
      </div>
      <div id="eco-institutionalSupport">
        <RatingScale name="institutionalSupport" label="¿Cómo evalúa el apoyo institucional de las autoridades locales al turismo?" value={d.institutionalSupport} onChange={(v) => set("institutionalSupport", v)} error={errors.institutionalSupport} />
      </div>
      <div id="eco-tourismPlanning">
        <RatingScale name="tourismPlanning" label="¿Existe planificación turística clara para el destino?" value={d.tourismPlanning} onChange={(v) => set("tourismPlanning", v)} error={errors.tourismPlanning} />
      </div>
      <div id="eco-committeeParticipation">
        <RatingScale name="committeeParticipation" label="¿Participa su organización en algún comité de toma de decisiones de su destino?" value={d.committeeParticipation} onChange={(v) => set("committeeParticipation", v)} error={errors.committeeParticipation} />
      </div>

      {/* Bloque 3: Residuos */}
      <BlockTitle>Bloque 3: Gestión de residuos</BlockTitle>
      <div id="eco-wasteManagement">
        <RatingScale name="wasteManagement" label="¿Cómo evalúa el manejo de residuos sólidos en el destino?" value={d.wasteManagement} onChange={(v) => set("wasteManagement", v)} error={errors.wasteManagement} />
      </div>
      <div id="eco-recycling">
        <RatingScale name="recycling" label="¿Existe reciclaje o separación de residuos?" value={d.recycling} onChange={(v) => set("recycling", v)} error={errors.recycling} />
      </div>
      <div id="eco-cleanliness">
        <RatingScale name="cleanliness" label="¿Cómo evalúa la limpieza general del destino turístico?" value={d.cleanliness} onChange={(v) => set("cleanliness", v)} error={errors.cleanliness} />
      </div>

      {/* Bloque 4: Agua */}
      <BlockTitle>Bloque 4: Uso eficiente del agua</BlockTitle>
      <div id="eco-waterAccess">
        <RatingScale name="waterAccess" label="¿Existe acceso suficiente a agua para todos en su destino?" value={d.waterAccess} onChange={(v) => set("waterAccess", v)} error={errors.waterAccess} />
      </div>
      <div id="eco-waterEfficiency">
        <RatingScale name="waterEfficiency" label="¿Se promueve el uso eficiente del agua en actividades turísticas?" value={d.waterEfficiency} onChange={(v) => set("waterEfficiency", v)} error={errors.waterEfficiency} />
      </div>
      <div id="eco-waterQuality">
        <RatingScale name="waterQuality" label="¿La calidad del agua es adecuada para residentes y visitantes?" value={d.waterQuality} onChange={(v) => set("waterQuality", v)} error={errors.waterQuality} />
      </div>
      <div id="eco-waterContamination">
        <RatingScale name="waterContamination" label="¿Existe riesgo de contaminación del agua por actividades extractivas (ej. mercurio)?" value={d.waterContamination} onChange={(v) => set("waterContamination", v)} error={errors.waterContamination} />
      </div>

      {/* Bloque 5: Energía */}
      <BlockTitle>Bloque 5: Energía y eficiencia energética</BlockTitle>
      <div id="eco-energyAccess">
        <RatingScale name="energyAccess" label="¿Existe acceso confiable y continuo a energía eléctrica en su destino?" value={d.energyAccess} onChange={(v) => set("energyAccess", v)} error={errors.energyAccess} />
      </div>
      <div id="eco-energyEfficiency">
        <RatingScale name="energyEfficiency" label="¿Los establecimientos turísticos utilizan tecnologías de eficiencia energética?" value={d.energyEfficiency} onChange={(v) => set("energyEfficiency", v)} error={errors.energyEfficiency} />
      </div>
      <div id="eco-renewableEnergy">
        <RatingScale name="renewableEnergy" label="¿Se utilizan energías renovables en su destino turístico?" value={d.renewableEnergy} onChange={(v) => set("renewableEnergy", v)} error={errors.renewableEnergy} />
      </div>

      {/* Bloque 6: Calidad servicios */}
      <BlockTitle>Bloque 6: Calidad de los servicios turísticos</BlockTitle>
      <div id="eco-hotelQuality">
        <RatingScale name="hotelQuality" label="¿Cómo evalúa la calidad de los hoteles y alojamientos?" value={d.hotelQuality} onChange={(v) => set("hotelQuality", v)} error={errors.hotelQuality} />
      </div>
      <div id="eco-restaurantQuality">
        <RatingScale name="restaurantQuality" label="¿Cómo evalúa la calidad de los restaurantes?" value={d.restaurantQuality} onChange={(v) => set("restaurantQuality", v)} error={errors.restaurantQuality} />
      </div>
      <div id="eco-gastronomyQuality">
        <RatingScale name="gastronomyQuality" label="¿Cómo evalúa la calidad de la gastronomía local?" value={d.gastronomyQuality} onChange={(v) => set("gastronomyQuality", v)} error={errors.gastronomyQuality} />
      </div>
      <div id="eco-agencyQuality">
        <RatingScale name="agencyQuality" label="¿Cómo evalúa la calidad de las agencias y operadores turísticos?" value={d.agencyQuality} onChange={(v) => set("agencyQuality", v)} error={errors.agencyQuality} />
      </div>
      <div id="eco-transportQuality">
        <RatingScale name="transportQuality" label="¿Cómo evalúa la calidad del transporte turístico?" value={d.transportQuality} onChange={(v) => set("transportQuality", v)} error={errors.transportQuality} />
      </div>
      <div id="eco-communityServiceQuality">
        <RatingScale name="communityServiceQuality" label="¿Cómo evalúa la calidad de los servicios turísticos comunitarios?" value={d.communityServiceQuality} onChange={(v) => set("communityServiceQuality", v)} error={errors.communityServiceQuality} />
      </div>
      <div id="eco-craftsQuality">
        <RatingScale name="craftsQuality" label="¿Cómo evalúa la calidad de las artesanías hechas en su destino?" value={d.craftsQuality} onChange={(v) => set("craftsQuality", v)} error={errors.craftsQuality} />
      </div>

      {/* Bloque 7: Cadena de valor */}
      <BlockTitle>Bloque 7: Integración de la cadena de valor local</BlockTitle>
      <div id="eco-artisanIntegration">
        <RatingScale name="artisanIntegration" label="¿El turismo integra a artesanos locales?" value={d.artisanIntegration} onChange={(v) => set("artisanIntegration", v)} error={errors.artisanIntegration} />
      </div>
      <div id="eco-localProducerIntegration">
        <RatingScale name="localProducerIntegration" label="¿El turismo integra a productores agrícolas o alimentos locales?" value={d.localProducerIntegration} onChange={(v) => set("localProducerIntegration", v)} error={errors.localProducerIntegration} />
      </div>
      <div id="eco-culturalPromotion">
        <RatingScale name="culturalPromotion" label="¿El turismo promueve artistas y cultura local?" value={d.culturalPromotion} onChange={(v) => set("culturalPromotion", v)} error={errors.culturalPromotion} />
      </div>
      <div id="eco-localEconomy">
        <RatingScale name="localEconomy" label="¿Existe una economía local que se beneficie del turismo?" value={d.localEconomy} onChange={(v) => set("localEconomy", v)} error={errors.localEconomy} />
      </div>

      {/* Bloque 8: Inclusión */}
      <BlockTitle>Bloque 8: Inclusión social</BlockTitle>
      <div id="eco-indigenousParticipation">
        <RatingScale name="indigenousParticipation" label="¿El turismo incluye la participación de pueblos indígenas?" value={d.indigenousParticipation} onChange={(v) => set("indigenousParticipation", v)} error={errors.indigenousParticipation} />
      </div>
      <div id="eco-womenParticipation">
        <RatingScale name="womenParticipation" label="¿Las mujeres participan activamente en la economía turística?" value={d.womenParticipation} onChange={(v) => set("womenParticipation", v)} error={errors.womenParticipation} />
      </div>
      <div id="eco-youthParticipation">
        <RatingScale name="youthParticipation" label="¿Los jóvenes participan en el turismo del destino?" value={d.youthParticipation} onChange={(v) => set("youthParticipation", v)} error={errors.youthParticipation} />
      </div>

      {/* Bloque 9: Cambio climático */}
      <BlockTitle>Bloque 9: Cambio climático</BlockTitle>
      <div id="eco-droughtRisk">
        <RatingScale name="droughtRisk" label="¿Su destino enfrenta riesgos por sequías?" value={d.droughtRisk} onChange={(v) => set("droughtRisk", v)} error={errors.droughtRisk} />
      </div>
      <div id="eco-floodRisk">
        <RatingScale name="floodRisk" label="¿Su destino enfrenta riesgos por inundaciones?" value={d.floodRisk} onChange={(v) => set("floodRisk", v)} error={errors.floodRisk} />
      </div>
      <div id="eco-climatePreparedness">
        <RatingScale name="climatePreparedness" label="¿Considera que el sector turístico de su destino está preparado para enfrentar los impactos del cambio climático?" value={d.climatePreparedness} onChange={(v) => set("climatePreparedness", v)} error={errors.climatePreparedness} />
      </div>

      {/* Bloque 10: Conservación */}
      <BlockTitle>Bloque 10: Conservación de la naturaleza</BlockTitle>
      <div id="eco-hasProtectedAreas">
        <TriStateToggle name="hasProtectedAreas" label="¿Existen Áreas Naturales Protegidas en su destino?" value={d.hasProtectedAreas} onChange={(v) => set("hasProtectedAreas", v)} error={errors.hasProtectedAreas} />
      </div>
      {d.hasProtectedAreas === "SI" && (
        <div id="eco-protectedAreasManagement">
          <RatingScale name="protectedAreasManagement" label="¿Considera que estas Áreas Naturales Protegidas están siendo bien gestionadas?" value={d.protectedAreasManagement} onChange={(v) => set("protectedAreasManagement", v)} error={errors.protectedAreasManagement} />
        </div>
      )}
      <div id="eco-tourismConservation">
        <RatingScale name="tourismConservation" label="¿El turismo actual contribuye a conservar la naturaleza?" value={d.tourismConservation} onChange={(v) => set("tourismConservation", v)} error={errors.tourismConservation} />
      </div>
      <div id="eco-ecosystemRestoration">
        <RatingScale name="ecosystemRestoration" label="¿Existen acciones para restaurar/remediar/regenerar ecosistemas dañados en su destino?" value={d.ecosystemRestoration} onChange={(v) => set("ecosystemRestoration", v)} error={errors.ecosystemRestoration} />
      </div>
      <div id="eco-communityConservation">
        <RatingScale name="communityConservation" label="¿Las comunidades locales participan en la conservación?" value={d.communityConservation} onChange={(v) => set("communityConservation", v)} error={errors.communityConservation} />
      </div>

      {/* Bloque 11: Normativa */}
      <BlockTitle>Bloque 11: Normativa y regulación turística</BlockTitle>
      <div id="eco-regulatoryClarity">
        <RatingScale name="regulatoryClarity" label="¿Cómo evalúa la claridad de las normas que regulan el turismo en su destino?" value={d.regulatoryClarity} onChange={(v) => set("regulatoryClarity", v)} error={errors.regulatoryClarity} />
      </div>
      <div id="eco-regulatoryFacilitation">
        <RatingScale name="regulatoryFacilitation" label="¿Las regulaciones actuales facilitan o dificultan el desarrollo de emprendimientos turísticos?" value={d.regulatoryFacilitation} onChange={(v) => set("regulatoryFacilitation", v)} error={errors.regulatoryFacilitation} />
      </div>
      <div id="eco-informalControl">
        <RatingScale name="informalControl" label="¿Existe control o fiscalización adecuada de servicios turísticos informales?" value={d.informalControl} onChange={(v) => set("informalControl", v)} error={errors.informalControl} />
      </div>
      <div id="eco-formalizationAccess">
        <RatingScale name="formalizationAccess" label="¿Los trámites para abrir o formalizar un emprendimiento turístico son accesibles?" value={d.formalizationAccess} onChange={(v) => set("formalizationAccess", v)} error={errors.formalizationAccess} />
      </div>
      <div id="eco-heritageProtection">
        <RatingScale name="heritageProtection" label="¿Considera que la normativa actual protege el patrimonio natural y cultural?" value={d.heritageProtection} onChange={(v) => set("heritageProtection", v)} error={errors.heritageProtection} />
      </div>

      {/* Bloque 12: Visión Turística 2035 */}
      <BlockTitle>Bloque 12: Visión turística de Bolivia 2035</BlockTitle>
      <div>
        <CheckboxGroup
          id="tourismTypes2035"
          label="¿Qué tipo de turismo debería priorizar Bolivia hacia el año 2035? * (máx. 3)"
          options={tourismType2035Options}
          selected={tourismTypes2035}
          onChange={(v) => { setTourismTypes2035(v); clearError("tourismTypes2035"); }}
          max={3}
          error={errors.tourismTypes2035}
        />
        {tourismTypes2035.includes("Otro") && (
          <div className="mt-3 animate-fade-in-up" id="otherType">
            <input
              type="text"
              value={otherType}
              onChange={(e) => { setOtherType(e.target.value); clearError("otherType"); }}
              autoComplete="off"
              maxLength={150}
              className={inputBaseClass}
              placeholder="Especifica el tipo de turismo..."
            />
            {errors.otherType && <p className={errorClass}>{errors.otherType}</p>}
          </div>
        )}
      </div>

      <div id="referenceDestination">
        <label htmlFor="eco-referenceDestination" className="block text-[13px] font-black text-gray-700 mb-1.5 ml-1 uppercase tracking-wide">
          ¿Qué destino debería convertirse en referente internacional del turismo boliviano? *
        </label>
        <input
          type="text"
          id="eco-referenceDestination"
          value={referenceDestination}
          onChange={(e) => { setReferenceDestination(e.target.value); clearError("referenceDestination"); }}
          autoComplete="off"
          maxLength={200}
          className={inputBaseClass}
          placeholder="Ej: Salar de Uyuni, Madidi..."
        />
        {errors.referenceDestination && <p className={errorClass}>{errors.referenceDestination}</p>}
      </div>

      <div id="structuralChange">
        <label htmlFor="eco-structuralChange" className="block text-[13px] font-black text-gray-700 mb-1.5 ml-1 uppercase tracking-wide">
          ¿Qué cambio estructural necesita Bolivia para desarrollar su turismo? *
        </label>
        <textarea
          id="eco-structuralChange"
          value={structuralChange}
          onChange={(e) => { setStructuralChange(e.target.value); clearError("structuralChange"); }}
          rows={3}
          maxLength={1000}
          className={textareaClass}
          placeholder="Describe el cambio estructural necesario..."
        />
        {errors.structuralChange && <p className={errorClass}>{errors.structuralChange}</p>}
      </div>

      <SectionSubmitButton loading={loading} />
    </form>
  );
}
