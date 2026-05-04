"use client";

import { useState, useEffect, type FormEvent } from "react";
import { marketCountries } from "@/lib/validations";
import { CheckboxGroup, SectionSubmitButton, inputBaseClass, errorClass } from "./shared";

interface MarketData {
  currentMarkets: string[];
  potentialMarkets: string[];
}

interface Props {
  onSubmit: (data: MarketData) => Promise<void>;
  loading: boolean;
  pid: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: Record<string, any> | null;
}

const DRAFT_KEY = "survey_draft_market";

function loadDraft(pid: string) {
  try { const r = localStorage.getItem(`${DRAFT_KEY}_${pid}`); return r ? JSON.parse(r) : null; } catch { return null; }
}

// Parse DB array: "Otros: text" → "Otros" + extract text
function parseDbOtros(items: string[] | undefined | null): { items: string[]; otherText: string } {
  if (!items || !Array.isArray(items)) return { items: [], otherText: "" };
  let otherText = "";
  const parsed = items.map((t) => {
    if (t.startsWith("Otros: ")) {
      otherText = t.slice(7);
      return "Otros";
    }
    return t;
  });
  return { items: parsed, otherText };
}

export default function MarketSection({ onSubmit, loading, pid, initialData }: Props) {
  const [currentMarkets, setCurrentMarkets] = useState<string[]>(() => {
    const d = loadDraft(pid);
    if (d?.currentMarkets) return d.currentMarkets;
    const { items } = parseDbOtros(initialData?.currentMarkets);
    return items;
  });
  const [potentialMarkets, setPotentialMarkets] = useState<string[]>(() => {
    const d = loadDraft(pid);
    if (d?.potentialMarkets) return d.potentialMarkets;
    const { items } = parseDbOtros(initialData?.potentialMarkets);
    return items;
  });
  const [currentOther, setCurrentOther] = useState(() => {
    const d = loadDraft(pid);
    if (d?.currentOther !== undefined) return d.currentOther;
    const { otherText } = parseDbOtros(initialData?.currentMarkets);
    return otherText;
  });
  const [potentialOther, setPotentialOther] = useState(() => {
    const d = loadDraft(pid);
    if (d?.potentialOther !== undefined) return d.potentialOther;
    const { otherText } = parseDbOtros(initialData?.potentialMarkets);
    return otherText;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      try { localStorage.setItem(`${DRAFT_KEY}_${pid}`, JSON.stringify({ currentMarkets, potentialMarkets, currentOther, potentialOther })); } catch {}
    }, 400);
    return () => clearTimeout(timer);
  }, [currentMarkets, potentialMarkets, currentOther, potentialOther, pid]);

  function clearError(key: string) {
    setErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (currentMarkets.length < 1) errs.currentMarkets = "Selecciona al menos 1 mercado";
    if (currentMarkets.includes("Otros") && !currentOther.trim()) errs.currentOther = "Especifica el mercado";
    if (potentialMarkets.length < 1) errs.potentialMarkets = "Selecciona al menos 1 mercado";
    if (potentialMarkets.includes("Otros") && !potentialOther.trim()) errs.potentialOther = "Especifica el mercado";
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0];
      document.getElementById(firstKey)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  function resolveOther(list: string[], otherText: string): string[] {
    return list.map((item) =>
      item === "Otros" && otherText.trim() ? `Otros: ${otherText.trim()}` : item
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      currentMarkets: resolveOther(currentMarkets, currentOther),
      potentialMarkets: resolveOther(potentialMarkets, potentialOther),
    });
    try { localStorage.removeItem(`${DRAFT_KEY}_${pid}`); } catch {}
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <CheckboxGroup
          id="currentMarkets"
          label="¿De qué países o regiones provienen principalmente los turistas que visitan su destino? * (máx. 3)"
          options={marketCountries}
          selected={currentMarkets}
          onChange={(v) => { setCurrentMarkets(v); clearError("currentMarkets"); }}
          max={3}
          error={errors.currentMarkets}
        />
        {currentMarkets.includes("Otros") && (
          <div className="mt-3 animate-fade-in-up" id="currentOther">
            <input
              type="text"
              value={currentOther}
              onChange={(e) => { setCurrentOther(e.target.value); clearError("currentOther"); }}
              autoComplete="off"
              maxLength={150}
              className={inputBaseClass}
              placeholder="Especifica el país o región..."
            />
            {errors.currentOther && <p className={errorClass}>{errors.currentOther}</p>}
          </div>
        )}
      </div>

      <div className="h-px bg-gray-100" />

      <div>
        <CheckboxGroup
          id="potentialMarkets"
          label="¿Cuáles considera que son los mercados internacionales con mayor potencial para su destino en los próximos años? * (máx. 3)"
          options={marketCountries}
          selected={potentialMarkets}
          onChange={(v) => { setPotentialMarkets(v); clearError("potentialMarkets"); }}
          max={3}
          error={errors.potentialMarkets}
        />
        {potentialMarkets.includes("Otros") && (
          <div className="mt-3 animate-fade-in-up" id="potentialOther">
            <input
              type="text"
              value={potentialOther}
              onChange={(e) => { setPotentialOther(e.target.value); clearError("potentialOther"); }}
              autoComplete="off"
              maxLength={150}
              className={inputBaseClass}
              placeholder="Especifica el país o región..."
            />
            {errors.potentialOther && <p className={errorClass}>{errors.potentialOther}</p>}
          </div>
        )}
      </div>

      <SectionSubmitButton loading={loading} />
    </form>
  );
}
