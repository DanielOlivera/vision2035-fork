"use client";

import { useState, useEffect, type FormEvent } from "react";
import { visitMotivationLabels, perceptionLabels } from "@/lib/validations";
import {
  labelClass,
  inputBaseClass,
  textareaClass,
  errorClass,
  SectionSubmitButton,
} from "./shared";

interface BoliviaIdentityData {
  boliviaOneWord: string;
  boliviaUnique: string;
  visitMotivation: string;
  boliviaPerception: string;
}

interface Props {
  onSubmit: (data: BoliviaIdentityData) => Promise<void>;
  loading: boolean;
  pid: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: Record<string, any> | null;
}

const DRAFT_KEY = "survey_draft_boliviaIdentity";

// DB stores "OTRO: text" — split back into value + other text
function splitOtro(val: string | undefined | null): { value: string; other: string } {
  if (!val) return { value: "", other: "" };
  if (val.startsWith("OTRO: ")) return { value: "OTRO", other: val.slice(6) };
  return { value: val, other: "" };
}

export default function BoliviaIdentitySection({ onSubmit, loading, pid, initialData }: Props) {
  interface FormValues {
    boliviaOneWord: string;
    boliviaUnique: string;
    visitMotivation: string;
    visitMotivationOther: string;
    boliviaPerception: string;
    boliviaPerceptionOther: string;
  }

  const [values, setValues] = useState<FormValues>(() => {
    try {
      const raw = localStorage.getItem(`${DRAFT_KEY}_${pid}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    if (initialData) {
      const mot = splitOtro(initialData.visitMotivation);
      const per = splitOtro(initialData.boliviaPerception);
      return {
        boliviaOneWord: initialData.boliviaOneWord ?? "",
        boliviaUnique: initialData.boliviaUnique ?? "",
        visitMotivation: mot.value,
        visitMotivationOther: mot.other,
        boliviaPerception: per.value,
        boliviaPerceptionOther: per.other,
      };
    }
    return {
      boliviaOneWord: "",
      boliviaUnique: "",
      visitMotivation: "",
      visitMotivationOther: "",
      boliviaPerception: "",
      boliviaPerceptionOther: "",
    };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      try { localStorage.setItem(`${DRAFT_KEY}_${pid}`, JSON.stringify(values)); } catch {}
    }, 400);
    return () => clearTimeout(timer);
  }, [values, pid]);

  function set(key: keyof typeof values, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!values.boliviaOneWord.trim()) errs.boliviaOneWord = "Ingresa una palabra";
    if (values.boliviaUnique.trim().length < 5) errs.boliviaUnique = "Comparte al menos 5 caracteres";
    if (!values.visitMotivation) errs.visitMotivation = "Selecciona una opción";
    if (values.visitMotivation === "OTRO" && !values.visitMotivationOther.trim()) {
      errs.visitMotivationOther = "Especifica tu respuesta";
    }
    if (!values.boliviaPerception) errs.boliviaPerception = "Selecciona una opción";
    if (values.boliviaPerception === "OTRO" && !values.boliviaPerceptionOther.trim()) {
      errs.boliviaPerceptionOther = "Especifica tu respuesta";
    }
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

    const motivation = values.visitMotivation === "OTRO"
      ? `OTRO: ${values.visitMotivationOther.trim()}`
      : values.visitMotivation;

    const perception = values.boliviaPerception === "OTRO"
      ? `OTRO: ${values.boliviaPerceptionOther.trim()}`
      : values.boliviaPerception;

    await onSubmit({
      boliviaOneWord: values.boliviaOneWord.trim(),
      boliviaUnique: values.boliviaUnique.trim(),
      visitMotivation: motivation,
      boliviaPerception: perception,
    });
    try { localStorage.removeItem(`${DRAFT_KEY}_${pid}`); } catch {}
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div id="boliviaOneWord">
        <label htmlFor="bi-boliviaOneWord" className={labelClass}>
          Si tuviera que describir a Bolivia en una sola palabra, ¿cuál sería? *
        </label>
        <input
          type="text"
          id="bi-boliviaOneWord"
          value={values.boliviaOneWord}
          onChange={(e) => set("boliviaOneWord", e.target.value)}
          autoComplete="off"
          maxLength={50}
          className={inputBaseClass}
          placeholder="Ej: Diversa"
        />
        {errors.boliviaOneWord && <p className={errorClass}>{errors.boliviaOneWord}</p>}
      </div>

      <div id="boliviaUnique">
        <label htmlFor="bi-boliviaUnique" className={labelClass}>
          ¿Qué cree que hace única a Bolivia frente a otros destinos del mundo? *
        </label>
        <textarea
          id="bi-boliviaUnique"
          value={values.boliviaUnique}
          onChange={(e) => set("boliviaUnique", e.target.value)}
          rows={3}
          maxLength={1000}
          className={textareaClass}
          placeholder="Comparte tu perspectiva..."
        />
        {errors.boliviaUnique && <p className={errorClass}>{errors.boliviaUnique}</p>}
      </div>

      <div id="visitMotivation">
        <p id="visitMotivation-label" className={labelClass}>
          ¿Cuál cree que es la principal motivación a la hora de visitar Bolivia? *
        </p>
        <div role="group" aria-labelledby="visitMotivation-label" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(visitMotivationLabels).map(([val, label]) => (
            <label
              key={val}
              htmlFor={`visitMotivation-${val}`}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="radio"
                id={`visitMotivation-${val}`}
                name="visitMotivation"
                value={val}
                checked={values.visitMotivation === val}
                onChange={() => set("visitMotivation", val)}
                className="w-5 h-5 accent-bolivia-green cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </label>
          ))}
        </div>
        {values.visitMotivation === "OTRO" && (
          <div className="mt-3 animate-fade-in-up" id="visitMotivationOther">
            <input
              type="text"
              value={values.visitMotivationOther}
              onChange={(e) => set("visitMotivationOther", e.target.value)}
              autoComplete="off"
              maxLength={150}
              className={inputBaseClass}
              placeholder="Especifica tu respuesta..."
            />
            {errors.visitMotivationOther && <p className={errorClass}>{errors.visitMotivationOther}</p>}
          </div>
        )}
        {errors.visitMotivation && <p className={errorClass}>{errors.visitMotivation}</p>}
      </div>

      <div id="boliviaPerception">
        <p id="boliviaPerception-label" className={labelClass}>
          A día de hoy, considera que Bolivia es percibida como: *
        </p>
        <div role="group" aria-labelledby="boliviaPerception-label" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(perceptionLabels).map(([val, label]) => (
            <label
              key={val}
              htmlFor={`boliviaPerception-${val}`}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="radio"
                id={`boliviaPerception-${val}`}
                name="boliviaPerception"
                value={val}
                checked={values.boliviaPerception === val}
                onChange={() => set("boliviaPerception", val)}
                className="w-5 h-5 accent-bolivia-green cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </label>
          ))}
        </div>
        {values.boliviaPerception === "OTRO" && (
          <div className="mt-3 animate-fade-in-up" id="boliviaPerceptionOther">
            <input
              type="text"
              value={values.boliviaPerceptionOther}
              onChange={(e) => set("boliviaPerceptionOther", e.target.value)}
              autoComplete="off"
              maxLength={150}
              className={inputBaseClass}
              placeholder="Especifica tu respuesta..."
            />
            {errors.boliviaPerceptionOther && <p className={errorClass}>{errors.boliviaPerceptionOther}</p>}
          </div>
        )}
        {errors.boliviaPerception && <p className={errorClass}>{errors.boliviaPerception}</p>}
      </div>

      <SectionSubmitButton loading={loading} />
    </form>
  );
}
