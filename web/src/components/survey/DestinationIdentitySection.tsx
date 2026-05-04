"use client";

import { useState, useEffect, type FormEvent } from "react";
import {
  labelClass,
  inputBaseClass,
  textareaClass,
  errorClass,
  BlockTitle,
  SectionSubmitButton,
} from "./shared";

interface DestinationIdentityData {
  destinationPride: string;
  naturalElements: string;
  culturalElements: string;
  uniqueExperience: string;
  differentiator: string;
  visitorMessage: string;
}

interface Props {
  onSubmit: (data: DestinationIdentityData) => Promise<void>;
  loading: boolean;
  pid: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: Record<string, any> | null;
}

const DRAFT_KEY = "survey_draft_destIdentity";

const questions: { key: keyof DestinationIdentityData; label: string; placeholder: string; type: "textarea" | "input"; rows?: number; minLength: number; maxLength: number; subtitleBefore?: string }[] = [
  {
    key: "destinationPride",
    label: "¿Cuáles son tres cosas que lo hacen sentirse más orgulloso de su destino? *",
    placeholder: "Comparta las 3 cosas que más le enorgullecen...",
    type: "textarea",
    rows: 3,
    minLength: 5,
    maxLength: 1000,
  },
  {
    key: "naturalElements",
    label: "¿Qué especies, paisajes o elementos naturales representan mejor su destino? *",
    placeholder: "Hasta 3 menciones...",
    type: "input",
    minLength: 3,
    maxLength: 500,
  },
  {
    key: "culturalElements",
    label: "¿Qué elementos culturales, históricos o arquitectónicos representan mejor su destino? *",
    placeholder: "Hasta 3 menciones...",
    type: "input",
    minLength: 3,
    maxLength: 500,
  },
  {
    key: "uniqueExperience",
    subtitleBefore: "Diferencial y experiencias",
    label: "Si un turista extranjero visitara su destino, ¿qué experiencia única encontraría que no existe en otro lugar? *",
    placeholder: "Describe esa experiencia única...",
    type: "textarea",
    rows: 3,
    minLength: 5,
    maxLength: 1000,
  },
  {
    key: "differentiator",
    label: "¿Qué hace diferente a su destino frente a otros destinos de Bolivia o de Sudamérica? *",
    placeholder: "Describe lo que lo diferencia...",
    type: "textarea",
    rows: 3,
    minLength: 5,
    maxLength: 1000,
  },
  {
    key: "visitorMessage",
    label: "¿Qué historia o mensaje cree que debería llevarse un visitante después de conocer su destino? *",
    placeholder: "La historia o mensaje que debería llevarse...",
    type: "textarea",
    rows: 3,
    minLength: 5,
    maxLength: 1000,
  },
];

export default function DestinationIdentitySection({ onSubmit, loading, pid, initialData }: Props) {
  const [values, setValues] = useState<Partial<DestinationIdentityData>>(() => {
    try {
      const raw = localStorage.getItem(`${DRAFT_KEY}_${pid}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    if (initialData) {
      const db: Partial<DestinationIdentityData> = {};
      for (const q of questions) {
        if (initialData[q.key]) db[q.key] = initialData[q.key];
      }
      return db;
    }
    return {};
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      try { localStorage.setItem(`${DRAFT_KEY}_${pid}`, JSON.stringify(values)); } catch {}
    }, 400);
    return () => clearTimeout(timer);
  }, [values, pid]);

  function setValue(key: keyof DestinationIdentityData, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    for (const q of questions) {
      const val = (values[q.key] || "").trim();
      if (val.length < q.minLength) {
        errs[q.key] = q.minLength <= 3 ? "Ingresa al menos 3 caracteres" : "Comparte al menos una idea (mínimo 5 caracteres)";
      }
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
    await onSubmit({
      destinationPride: values.destinationPride!.trim(),
      naturalElements: values.naturalElements!.trim(),
      culturalElements: values.culturalElements!.trim(),
      uniqueExperience: values.uniqueExperience!.trim(),
      differentiator: values.differentiator!.trim(),
      visitorMessage: values.visitorMessage!.trim(),
    });
    try { localStorage.removeItem(`${DRAFT_KEY}_${pid}`); } catch {}
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((q) => (
        <div key={q.key}>
          {q.subtitleBefore && <BlockTitle>{q.subtitleBefore}</BlockTitle>}
          <div id={q.key}>
          <label htmlFor={`di-${q.key}`} className={labelClass}>
            {q.label}
          </label>
          {q.type === "textarea" ? (
            <textarea
              id={`di-${q.key}`}
              value={values[q.key] || ""}
              onChange={(e) => setValue(q.key, e.target.value)}
              rows={q.rows}
              maxLength={q.maxLength}
              className={textareaClass}
              placeholder={q.placeholder}
            />
          ) : (
            <input
              type="text"
              id={`di-${q.key}`}
              value={values[q.key] || ""}
              onChange={(e) => setValue(q.key, e.target.value)}
              maxLength={q.maxLength}
              autoComplete="off"
              className={inputBaseClass}
              placeholder={q.placeholder}
            />
          )}
          {errors[q.key] && <p className={errorClass}>{errors[q.key]}</p>}
          </div>
        </div>
      ))}

      <SectionSubmitButton loading={loading} />
    </form>
  );
}
