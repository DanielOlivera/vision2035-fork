"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import EcosystemSection from "@/components/survey/EcosystemSection";
import MarketSection from "@/components/survey/MarketSection";
import DestinationIdentitySection from "@/components/survey/DestinationIdentitySection";
import BoliviaIdentitySection from "@/components/survey/BoliviaIdentitySection";
import FinalCommentsSection from "@/components/survey/FinalCommentsSection";
import SurveyQRCard from "@/components/survey/SurveyQRCard";

const TOTAL_STEPS = 5;

const STEP_TITLES = [
  "Ecosistema Turístico",
  "Nuestro Mercado",
  "Identidad de Tu Destino",
  "Nuestra Identidad Bolivia",
  "Últimos Comentarios",
];

const STEP_API_SECTIONS = [
  "ecosystem",
  "market",
  "destinationIdentity",
  "boliviaIdentity",
  "finalSection",
] as const;

export default function EncuestaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <EncuestaContent />
    </Suspense>
  );
}

function EncuestaContent() {
  const searchParams = useSearchParams();
  const participantId = searchParams.get("pid");

  const stepParam = searchParams.get("s");
  const initialStep = stepParam !== null
    ? Math.min(Math.max(parseInt(stepParam, 10) || 0, 0), TOTAL_STEPS - 1)
    : 0;

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [surveyData, setSurveyData] = useState<Record<string, any> | null>(null);

  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;
  const isFirstStepRender = useRef(true);

  useEffect(() => {
    if (!participantId || completed) return;
    const url = currentStep > 0
      ? `/encuesta?pid=${participantId}&s=${currentStep}`
      : `/encuesta?pid=${participantId}`;
    window.history.replaceState(window.history.state, "", url);
  }, [currentStep, participantId, completed]);

  useEffect(() => {
    if (!participantId) {
      window.location.href = "/#registro";
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/survey?participantId=${participantId}`);
        if (res.ok) {
          const { survey } = await res.json();
          if (survey) {
            setSurveyData(survey);
            if (survey.isComplete) {
              setCompleted(true);
            } else if (survey.completedSections > 0 && stepParam === null) {
              const resumeStep = Math.min(survey.completedSections, TOTAL_STEPS - 1);
              setCurrentStep(resumeStep);
            }
          }
        }
      } catch {
        // Silently continue — worst case starts from step 0
      } finally {
        setInitialLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participantId]);

  const surveyUrl = typeof window !== "undefined" && participantId
    ? `${window.location.origin}/encuesta?pid=${participantId}`
    : "";

  const refreshSurveyData = useCallback(async () => {
    try {
      const res = await fetch(`/api/survey?participantId=${participantId}`);
      if (res.ok) {
        const { survey } = await res.json();
        if (survey) setSurveyData(survey);
      }
    } catch {
      // Non-critical — surveyData may be stale but user can continue
    }
  }, [participantId]);

  const navigateToStep = useCallback((step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function submitSection(section: string, data: any) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, section, data }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al guardar la sección");
      }

      await refreshSurveyData();

      if (currentStep < TOTAL_STEPS - 1) {
        navigateToStep(currentStep + 1);
      } else {
        setCompleted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleStepSubmit(stepIndex: number, data: any) {
    await submitSection(STEP_API_SECTIONS[stepIndex], data);
  }

  const goBack = useCallback(async () => {
    if (currentStep <= 0) return;
    setError("");
    await refreshSurveyData();
    navigateToStep(currentStep - 1);
  }, [currentStep, refreshSurveyData, navigateToStep]);

  const buildStepUrl = useCallback((step: number) => {
    return step > 0
      ? `/encuesta?pid=${participantId}&s=${step}`
      : `/encuesta?pid=${participantId}`;
  }, [participantId]);

  // Paso 0 interaction sentinel — algunos browsers móviles ignoran pushState
  // si la pestaña fue abierta sin interacción previa (QR / link directo).
  // Enriquecer el history entry y crear un input oculto convence al browser
  // de que la página tiene "estado" y respeta los pushState entries.
  useEffect(() => {
    const currentState = window.history.state || {};
    window.history.replaceState(
      { ...currentState, _sentinel: true, _ts: Date.now() },
      ""
    );

    const sentinel = document.createElement("input");
    sentinel.type = "text";
    sentinel.tabIndex = -1;
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.autocomplete = "off";
    sentinel.name = "_sentinel";
    sentinel.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
    document.body.appendChild(sentinel);
    sentinel.value = `s_${participantId}_${Date.now()}`;
    sentinel.dispatchEvent(new Event("input", { bubbles: true }));
    sentinel.dispatchEvent(new Event("change", { bubbles: true }));

    return () => {
      if (sentinel.parentNode) sentinel.parentNode.removeChild(sentinel);
    };
  }, [participantId]);

  // Refresh guards on step change — los guards del mount cargan la URL inicial.
  // Sin este re-push, al retroceder a un guard buried el URL desfasado dispara
  // un re-render de Next.js que destruye el estado React.
  useEffect(() => {
    if (isFirstStepRender.current) {
      isFirstStepRender.current = false;
      return;
    }
    const url = buildStepUrl(currentStep);
    for (let i = 0; i < 3; i++) {
      window.history.pushState({ surveyGuard: true }, "", url);
    }
  }, [currentStep, buildStepUrl]);

  // History guard mount + popstate handler.
  // CRÍTICO: cada pushState debe incluir buildStepUrl(currentStepRef.current);
  // sin URL explícita los guards heredan la URL del momento del push.
  useEffect(() => {
    const url = buildStepUrl(currentStepRef.current);
    for (let i = 0; i < 3; i++) {
      window.history.pushState({ surveyGuard: true }, "", url);
    }

    function handlePopState() {
      const stepUrl = buildStepUrl(currentStepRef.current);

      const active = document.activeElement;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) {
        window.history.pushState({ surveyGuard: true }, "", stepUrl);
        return;
      }

      const step = currentStepRef.current;
      if (step === 0) {
        setShowExitModal(true);
      } else {
        setShowBackModal(true);
      }

      window.history.pushState({ surveyGuard: true }, "", stepUrl);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildStepUrl]);

  if (!participantId) return null;

  if (initialLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-3 border-bolivia-green border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Cargando encuesta...</p>
        </div>
      </main>
    );
  }

  if (completed) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-3xl p-10 shadow-xl text-center">
          <div className="w-20 h-20 bg-bolivia-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-bolivia-green text-4xl font-black">✓</span>
          </div>
          <h1 className="text-3xl font-black text-bolivia-dark mb-4 tracking-tight">
            CUESTIONARIO COMPLETADO
          </h1>
          <p className="text-gray-500 text-lg mb-3 leading-relaxed">
            Usted completó satisfactoriamente el cuestionario.
          </p>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            Esté atento a novedades sobre los talleres de co-creación.
            Su participación es clave para construir la Visión Bolivia 2035.
          </p>
          <a
            href="/"
            className="inline-block px-8 py-4 bg-bolivia-dark text-white rounded-full font-bold hover:bg-black transition-all active:scale-95"
          >
            Volver al inicio
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          {currentStep === 0 ? (
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="inline-block text-sm text-gray-400 hover:text-gray-500 active:text-bolivia-green active:scale-95 transition-all mb-6 font-bold uppercase tracking-widest"
            >
              &larr; Volver al inicio
            </button>
          ) : (
            <button
              type="button"
              onClick={goBack}
              disabled={loading}
              className="inline-block text-sm text-gray-400 hover:text-gray-500 active:text-bolivia-green active:scale-95 transition-all mb-6 font-bold uppercase tracking-widest disabled:opacity-50"
            >
              &larr; Sección anterior
            </button>
          )}
          <h1 className="text-3xl md:text-4xl font-black text-bolivia-dark tracking-tight uppercase leading-tight">
            Encuesta Pre-Taller
          </h1>
          <div className="h-1.5 w-20 bg-bolivia-green mx-auto mt-4 mb-4 rounded-full" />
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Tu perspectiva nos ayuda a diseñar talleres más relevantes para tu
            territorio. Tiempo estimado: 15–20 minutos.
          </p>
        </div>

        {currentStep === 0 && surveyUrl && (
          <SurveyQRCard surveyUrl={surveyUrl} />
        )}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
              Sección {currentStep + 1} de {TOTAL_STEPS}
            </span>
            <span className="text-xs font-bold text-bolivia-green">
              {Math.round((currentStep / TOTAL_STEPS) * 100)}%
            </span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all ${
                  i < currentStep
                    ? "bg-bolivia-green"
                    : i === currentStep
                    ? "bg-bolivia-green/50"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <p className="text-sm font-black text-bolivia-dark uppercase tracking-tight mt-3">
            {STEP_TITLES[currentStep]}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-sm font-bold shadow-sm mb-6 animate-shake">
              {error}
            </div>
          )}

          {currentStep === 0 && (
            <EcosystemSection
              pid={participantId}
              loading={loading}
              onSubmit={(data) => handleStepSubmit(0, data)}
              initialData={surveyData}
            />
          )}
          {currentStep === 1 && (
            <MarketSection
              pid={participantId}
              loading={loading}
              onSubmit={(data) => handleStepSubmit(1, data)}
              initialData={surveyData}
            />
          )}
          {currentStep === 2 && (
            <DestinationIdentitySection
              pid={participantId}
              loading={loading}
              onSubmit={(data) => handleStepSubmit(2, data)}
              initialData={surveyData}
            />
          )}
          {currentStep === 3 && (
            <BoliviaIdentitySection
              pid={participantId}
              loading={loading}
              onSubmit={(data) => handleStepSubmit(3, data)}
              initialData={surveyData}
            />
          )}
          {currentStep === 4 && (
            <FinalCommentsSection
              pid={participantId}
              loading={loading}
              onSubmit={(data) => handleStepSubmit(4, data)}
              initialData={surveyData}
            />
          )}
        </div>
      </div>

      {showExitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-modal-title"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowExitModal(false)}
          />
          <div className="relative max-w-sm w-full bg-white rounded-3xl p-8 shadow-2xl text-center animate-in">
            <div className="w-16 h-16 bg-bolivia-red/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-bolivia-red text-3xl font-black">!</span>
            </div>
            <h2
              id="exit-modal-title"
              className="text-xl font-black text-bolivia-dark mb-3 tracking-tight uppercase"
            >
              Salir de la encuesta
            </h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Tu progreso guardado no se perderá. Podrás retomar la encuesta
              desde donde la dejaste usando tu enlace o código QR.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="w-full py-3.5 bg-bolivia-green text-white rounded-full font-bold uppercase tracking-wide hover:bg-bolivia-green/90 transition-all active:scale-95"
              >
                Continuar encuesta
              </button>
              <button
                type="button"
                onClick={() => { window.location.href = "/"; }}
                className="w-full py-3.5 bg-gray-100 text-gray-500 rounded-full font-bold uppercase tracking-wide hover:bg-gray-200 transition-all active:scale-95"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}

      {showBackModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="back-modal-title"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowBackModal(false)}
          />
          <div className="relative max-w-sm w-full bg-white rounded-3xl p-8 shadow-2xl text-center animate-in">
            <div className="w-16 h-16 bg-bolivia-yellow/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-bolivia-gold text-3xl font-black">&larr;</span>
            </div>
            <h2
              id="back-modal-title"
              className="text-xl font-black text-bolivia-dark mb-3 tracking-tight uppercase"
            >
              Volver a la sección anterior
            </h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              ¿Deseas regresar a la sección anterior?
              Los datos que ya guardaste se mantendrán.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setShowBackModal(false)}
                className="w-full py-3.5 bg-bolivia-green text-white rounded-full font-bold uppercase tracking-wide hover:bg-bolivia-green/90 transition-all active:scale-95"
              >
                Continuar aquí
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowBackModal(false);
                  setError("");
                  await refreshSurveyData();
                  navigateToStep(currentStepRef.current - 1);
                }}
                className="w-full py-3.5 bg-gray-100 text-gray-500 rounded-full font-bold uppercase tracking-wide hover:bg-gray-200 transition-all active:scale-95"
              >
                Sección anterior
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
