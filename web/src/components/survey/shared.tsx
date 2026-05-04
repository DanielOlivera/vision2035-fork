"use client";

import { type ReactNode } from "react";
import { scaleLabels } from "@/lib/validations";

// Shared CSS classes
export const inputBaseClass =
  "w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-bolivia-green focus:border-transparent outline-none transition-all font-medium";
export const labelClass =
  "block text-[13px] font-black text-gray-700 mb-1.5 ml-1 uppercase tracking-wide";
export const errorClass =
  "mt-1.5 text-[12px] font-bold text-red-600 ml-1 animate-fade-in-up leading-tight";
export const textareaClass =
  "w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-bolivia-green focus:border-transparent outline-none transition-all font-medium resize-none";

// Rating scale component (1-5)
export function RatingScale({
  name,
  label,
  value,
  onChange,
  error,
}: {
  name: string;
  label: string;
  value: number | undefined;
  onChange: (val: number) => void;
  error?: string;
}) {
  return (
    <div className="py-3">
      <p className="text-sm font-semibold text-gray-700 mb-2.5 leading-snug">{label}</p>
      <div className="flex gap-1.5 sm:gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all border ${
              value === n
                ? "bg-bolivia-green text-white border-bolivia-green shadow-sm"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
            title={scaleLabels[n]}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-1 px-0.5">
        <span className="text-[10px] text-gray-400 font-medium">Muy deficiente</span>
        <span className="text-[10px] text-gray-400 font-medium">Excelente</span>
      </div>
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

// Boolean toggle (SÍ / NO)
export function BooleanToggle({
  name,
  label,
  value,
  onChange,
  error,
}: {
  name: string;
  label: string;
  value: boolean | undefined;
  onChange: (val: boolean) => void;
  error?: string;
}) {
  return (
    <div className="py-3">
      <p className="text-sm font-semibold text-gray-700 mb-2.5 leading-snug">{label}</p>
      <div className="flex gap-3">
        {[
          { val: true, text: "Sí" },
          { val: false, text: "No" },
        ].map((opt) => (
          <button
            key={String(opt.val)}
            type="button"
            onClick={() => onChange(opt.val)}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all border ${
              value === opt.val
                ? "bg-bolivia-green text-white border-bolivia-green shadow-sm"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {opt.text}
          </button>
        ))}
      </div>
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

// TriState toggle (SÍ / NO / NO SÉ)
export function TriStateToggle({
  name,
  label,
  value,
  onChange,
  error,
}: {
  name: string;
  label: string;
  value: string | undefined;
  onChange: (val: string) => void;
  error?: string;
}) {
  return (
    <div className="py-3">
      <p className="text-sm font-semibold text-gray-700 mb-2.5 leading-snug">{label}</p>
      <div className="flex gap-2">
        {[
          { val: "SI", text: "Sí" },
          { val: "NO", text: "No" },
          { val: "NO_SE", text: "No sé" },
        ].map((opt) => (
          <button
            key={opt.val}
            type="button"
            onClick={() => onChange(opt.val)}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all border ${
              value === opt.val
                ? "bg-bolivia-green text-white border-bolivia-green shadow-sm"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {opt.text}
          </button>
        ))}
      </div>
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

// Checkbox group with max selection
export function CheckboxGroup({
  id,
  label,
  options,
  selected,
  onChange,
  max,
  error,
}: {
  id: string;
  label: string;
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  max: number;
  error?: string;
}) {
  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else if (selected.length < max) {
      onChange([...selected, value]);
    }
  }

  return (
    <div id={id}>
      <p className={labelClass}>{label}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {options.map((opt) => (
          <label
            key={opt}
            className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer text-sm font-medium transition-all border ${
              selected.includes(opt)
                ? "bg-bolivia-green/10 border-bolivia-green text-bolivia-green"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            } ${
              !selected.includes(opt) && selected.length >= max
                ? "opacity-40 cursor-not-allowed"
                : ""
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
              className="sr-only"
            />
            <span
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                selected.includes(opt)
                  ? "bg-bolivia-green border-bolivia-green text-white"
                  : "border-gray-300"
              }`}
            >
              {selected.includes(opt) && (
                <span className="text-[10px] font-black">✓</span>
              )}
            </span>
            <span className="truncate">{opt}</span>
          </label>
        ))}
      </div>
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

// Section block title
export function BlockTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-sm font-black text-bolivia-dark/70 uppercase tracking-wider mt-6 mb-1 pt-4 border-t border-gray-100 first:mt-0 first:pt-0 first:border-0">
      {children}
    </h3>
  );
}

// Section submit button
export function SectionSubmitButton({
  loading,
  label = "SIGUIENTE",
}: {
  loading: boolean;
  label?: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-4 bg-bolivia-green text-white font-black rounded-2xl text-lg hover:bg-green-700 active:scale-[0.98] transition-all shadow-lg shadow-green-900/15 disabled:opacity-50 disabled:cursor-not-allowed mt-8 tracking-tight uppercase"
    >
      {loading ? "GUARDANDO..." : label}
    </button>
  );
}
