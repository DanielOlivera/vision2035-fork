"use client";

import { useState, useEffect, type FormEvent } from "react";
import { tourismPriorityOptions } from "@/lib/validations";
import {
  labelClass,
  inputBaseClass,
  textareaClass,
  errorClass,
  CheckboxGroup,
  SectionSubmitButton,
} from "./shared";

export interface FinalCommentsData {
  mainProblems: string;
  keyOpportunities: string;
  priorityProject: string;
  sustainabilityChange: string;
  tourismPriorities: string[];
}

interface Props {
  onSubmit: (data: FinalCommentsData) => Promise<void>;
  loading: boolean;
  pid: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: Record<string, any> | null;
}

const DRAFT_KEY = "survey_draft_finalComments";

// Parse DB array: "Otro: text" → "Otro" + extract text
function parseDbCheckboxOtro(items: string[] | undefined | null): { items: string[]; otherText: string } {
  if (!items || !Array.isArray(items)) return { items: [], otherText: "" };
  let otherText = "";
  const parsed = items.map((t) => {
    if (t.startsWith("Otro: ")) {
      otherText = t.slice(6);
      return "Otro";
    }
    return t;
  });
  return { items: parsed, otherText };
}

export default function FinalCommentsSection({ onSubmit, loading, pid, initialData }: Props) {
  const [values, setValues] = useState(() => {
    try {
      const raw = localStorage.getItem(`${DRAFT_KEY}_${pid}`);
      if (raw) {
        const d = JSON.parse(raw);
        return {
          mainProblems: d.mainProblems ?? "",
          keyOpportunities: d.keyOpportunities ?? "",
          priorityProject: d.priorityProject ?? "",
          sustainabilityChange: d.sustainabilityChange ?? "",
        };
      }
    } catch {}
    return {
      mainProblems: initialData?.mainProblems ?? "",
      keyOpportunities: initialData?.keyOpportunities ?? "",
      priorityProject: initialData?.priorityProject ?? "",
      sustainabilityChange: initialData?.sustainabilityChange ?? "",
    };
  });
  const [tourismPriorities, setTourismPriorities] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(`${DRAFT_KEY}_${pid}`);
      if (raw) {
        const parsed = JSON.parse(raw).tourismPriorities;
        if (parsed) return parsed;
      }
    } catch {}
    const { items } = parseDbCheckboxOtro(initialData?.tourismPriorities);
    return items;
  });
  const [prioritiesOther, setPrioritiesOther] = useState(() => {
    try {
      const raw = localStorage.getItem(`${DRAFT_KEY}_${pid}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.prioritiesOther !== undefined) return parsed.prioritiesOther;
      }
    } catch {}
    const { otherText } = parseDbCheckboxOtro(initialData?.tourismPriorities);
    return otherText;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      try { localStorage.setItem(`${DRAFT_KEY}_${pid}`, JSON.stringify({ ...values, tourismPriorities, prioritiesOther })); } catch {}
    }, 400);
    return () => clearTimeout(timer);
  }, [values, tourismPriorities, prioritiesOther, pid]);

  function set(key: keyof typeof values, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function clearError(key: string) {
    setErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (values.mainProblems.trim().length < 5) errs.mainProblems = "Comparte al menos 5 caracteres";
    if (values.keyOpportunities.trim().length < 5) errs.keyOpportunities = "Comparte al menos 5 caracteres";
    if (values.priorityProject.trim().length < 5) errs.priorityProject = "Comparte al menos 5 caracteres";
    if (values.sustainabilityChange.trim().length < 5) errs.sustainabilityChange = "Comparte al menos 5 caracteres";
    if (tourismPriorities.length < 1) errs.tourismPriorities = "Selecciona al menos 1 prioridad";
    if (tourismPriorities.includes("Otro") && !prioritiesOther.trim()) errs.prioritiesOther = "Especifica la prioridad";
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      document.getElementById(Object.keys(errs)[0])?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const resolvedPriorities = tourismPriorities.map((p) =>
      p === "Otro" && prioritiesOther.trim() ? `Otro: ${prioritiesOther.trim()}` : p
    );

    await onSubmit({
      mainProblems: values.mainProblems.trim(),
      keyOpportunities: values.keyOpportunities.trim(),
      priorityProject: values.priorityProject.trim(),
      sustainabilityChange: values.sustainabilityChange.trim(),
      tourismPriorities: resolvedPriorities,
    });
    try { localStorage.removeItem(`${DRAFT_KEY}_${pid}`); } catch {}
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div id="mainProblems">
        <label htmlFor="fc-mainProblems" className={labelClass}>
          ¿Cuáles considera que son los 3 principales problemas que limitan el desarrollo del turismo en su destino? *
        </label>
        <textarea
          id="fc-mainProblems"
          value={values.mainProblems}
          onChange={(e) => set("mainProblems", e.target.value)}
          rows={3}
          maxLength={2000}
          className={textareaClass}
          placeholder="Describe los principales desafíos..."
        />
        {errors.mainProblems && <p className={errorClass}>{errors.mainProblems}</p>}
      </div>

      <div id="keyOpportunities">
        <label htmlFor="fc-keyOpportunities" className={labelClass}>
          ¿Cuáles considera que son 3 oportunidades clave para mejorar el turismo en el destino? *
        </label>
        <textarea
          id="fc-keyOpportunities"
          value={values.keyOpportunities}
          onChange={(e) => set("keyOpportunities", e.target.value)}
          rows={3}
          maxLength={2000}
          className={textareaClass}
          placeholder="Describe las oportunidades que identificas..."
        />
        {errors.keyOpportunities && <p className={errorClass}>{errors.keyOpportunities}</p>}
      </div>

      <div id="priorityProject">
        <label htmlFor="fc-priorityProject" className={labelClass}>
          Si pudiera implementar un proyecto prioritario para mejorar el turismo, ¿cuál sería? *
        </label>
        <textarea
          id="fc-priorityProject"
          value={values.priorityProject}
          onChange={(e) => set("priorityProject", e.target.value)}
          rows={2}
          maxLength={1000}
          className={textareaClass}
          placeholder="Describe tu proyecto prioritario..."
        />
        {errors.priorityProject && <p className={errorClass}>{errors.priorityProject}</p>}
      </div>

      <div id="sustainabilityChange">
        <label htmlFor="fc-sustainabilityChange" className={labelClass}>
          ¿Qué debería cambiar para que el turismo en su destino sea más sostenible? *
        </label>
        <textarea
          id="fc-sustainabilityChange"
          value={values.sustainabilityChange}
          onChange={(e) => set("sustainabilityChange", e.target.value)}
          rows={2}
          maxLength={1000}
          className={textareaClass}
          placeholder="Describe el cambio más urgente..."
        />
        {errors.sustainabilityChange && <p className={errorClass}>{errors.sustainabilityChange}</p>}
      </div>

      <div>
        <CheckboxGroup
          id="tourismPriorities"
          label="¿Qué debería priorizar Bolivia para desarrollar el turismo? * (máx. 3)"
          options={tourismPriorityOptions}
          selected={tourismPriorities}
          onChange={(v) => { setTourismPriorities(v); clearError("tourismPriorities"); }}
          max={3}
          error={errors.tourismPriorities}
        />
        {tourismPriorities.includes("Otro") && (
          <div className="mt-3 animate-fade-in-up" id="prioritiesOther">
            <input
              type="text"
              value={prioritiesOther}
              onChange={(e) => { setPrioritiesOther(e.target.value); clearError("prioritiesOther"); }}
              autoComplete="off"
              maxLength={150}
              className={inputBaseClass}
              placeholder="Especifica la prioridad..."
            />
            {errors.prioritiesOther && <p className={errorClass}>{errors.prioritiesOther}</p>}
          </div>
        )}
      </div>

      <SectionSubmitButton loading={loading} label="ENVIAR ENCUESTA" />
    </form>
  );
}
