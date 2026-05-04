"use client";

import { useState, type FormEvent } from "react";
import {
  registerSchema,
  organizationTypeLabels,
  destinationLabels,
  departmentLabels,
  departmentDestinations,
  experienceLabels,
  importanceLabels,
  type RegisterInput,
} from "@/lib/validations";
import CustomSelect from "./CustomSelect";
import "react-phone-number-input/style.css";
import PhoneInput, {
  getCountryCallingCode,
  type Country,
} from "react-phone-number-input";

type FieldErrors = Partial<Record<keyof RegisterInput, string[]>>;

interface Props {
  onSuccess: (participantId: string) => void;
}

export default function RegisterForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [phone, setPhone] = useState<string>("");
  const [country, setCountry] = useState<Country>("BO");
  const [orgType, setOrgType] = useState("");
  const [department, setDepartment] = useState("");
  const [destination, setDestination] = useState("");
  const [experience, setExperience] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setServerError("");
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const raw = Object.fromEntries(formData.entries());

    const data = {
      ...raw,
      whatsapp: phone,
    };

    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors as FieldErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.details) setFieldErrors(json.details);
        else setServerError(json.error || "Error al registrar");
        setLoading(false);
        return;
      }

      onSuccess(json.participantId);
    } catch {
      setServerError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const inputBaseClass =
    "w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-bolivia-green focus:border-transparent outline-none transition-all font-medium";
  const labelClass = "block text-[13px] font-black text-gray-700 mb-1.5 ml-1 uppercase tracking-wide";
  const errorClass = "mt-1.5 text-[12px] font-bold text-red-600 ml-1 animate-fade-in-up leading-tight break-words";

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-black text-bolivia-dark tracking-tight uppercase">
          Registro de Participante
        </h3>
        <p className="text-sm text-gray-500 font-bold mt-1 uppercase tracking-tighter">Completa tus datos para habilitar la encuesta</p>
      </div>

      {serverError && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-sm font-bold shadow-sm animate-shake">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5">
        <div>
          <label htmlFor="fullName" className={labelClass}>
            Nombres y Apellidos *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            required
            autoComplete="name"
            className={inputBaseClass}
            placeholder="Ej: Juan Pérez"
          />
          {fieldErrors.fullName && (
            <p className={errorClass}>{fieldErrors.fullName[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="whatsapp" className={labelClass}>
            Número de WhatsApp *
          </label>
          <div className="whatsapp-input-container">
            <PhoneInput
              addInternationalOption={false}
              defaultCountry="BO"
              country={country}
              onCountryChange={(c) => { if (c) setCountry(c); }}
              value={phone}
              onChange={(val) => setPhone(val || "")}
              placeholder="XXXXXXXX"
              className="flex items-center border border-gray-300 rounded-xl bg-white focus-within:ring-2 focus-within:ring-bolivia-green transition-all overflow-hidden"
              countrySelectProps={{
                id: "whatsapp-country",
                name: "whatsappCountry",
                autoComplete: "tel-country-code",
              }}
              numberInputProps={{
                id: "whatsapp",
                autoComplete: "tel",
                className: "flex-1 bg-transparent pl-2 pr-6 py-3 text-gray-900 placeholder:text-gray-400 outline-none font-medium text-base",
              }}
            />
            <style jsx global>{`
              .whatsapp-input-container .PhoneInputCountry {
                padding-left: 1.25rem;
                padding-right: 0.75rem;
                margin-right: 0;
                position: relative;
                display: flex;
                align-items: center;
                background-color: #fcfcfc;
              }
              .whatsapp-input-container .PhoneInputCountry::after {
                content: '+${getCountryCallingCode(country)}';
                position: relative;
                margin-left: 0.5rem;
                padding-right: 0.75rem;
                margin-right: 0.25rem;
                border-right: 1px solid #e5e7eb;
                font-weight: 700;
                font-size: 0.95rem;
                color: #374151;
                white-space: nowrap;
                pointer-events: none;
              }
              .whatsapp-input-container .PhoneInputCountrySelect {
                cursor: pointer;
                color: #111827 !important;
              }
              .whatsapp-input-container .PhoneInputCountrySelect option {
                color: #111827 !important;
                background-color: white !important;
              }
              .whatsapp-input-container .PhoneInputCountryIcon {
                width: 1.6rem;
                height: auto;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                border-radius: 2px;
              }
              .whatsapp-input-container input.PhoneInputInput {
                padding-left: 0.5rem !important;
              }
            `}</style>
          </div>
          {fieldErrors.whatsapp && (
            <p className={errorClass}>{fieldErrors.whatsapp[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Correo Electrónico *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            autoComplete="email"
            className={inputBaseClass}
            placeholder="juan@ejemplo.com"
          />
          {fieldErrors.email && (
            <p className={errorClass}>{fieldErrors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="organization" className={labelClass}>
            Emprendimiento u Organización
          </label>
          <input
            type="text"
            id="organization"
            name="organization"
            autoComplete="organization"
            className={inputBaseClass}
            placeholder="Nombre de tu empresa o asociación"
          />
          {fieldErrors.organization && (
            <p className={errorClass}>{fieldErrors.organization[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="organizationType" className={labelClass}>
            Tipo de organización *
          </label>
          <CustomSelect
            id="organizationType"
            name="organizationType"
            required
            placeholder="Selecciona una opción"
            options={Object.entries(organizationTypeLabels).map(([value, label]) => ({ value, label }))}
            value={orgType}
            onChange={setOrgType}
          />
          {fieldErrors.organizationType && (
            <p className={errorClass}>
              {fieldErrors.organizationType[0]}
            </p>
          )}
        </div>

        {orgType === "OTRO" && (
          <div className="animate-fade-in-up">
            <label htmlFor="organizationTypeOther" className={labelClass}>
              Especifica tu rubro o tipo de organización *
            </label>
            <input
              type="text"
              id="organizationTypeOther"
              name="organizationTypeOther"
              required
              autoComplete="off"
              className={inputBaseClass}
              placeholder="Ej: Consultor independiente, Transporte acuático, etc."
            />
            {fieldErrors.organizationTypeOther && (
              <p className={errorClass}>{fieldErrors.organizationTypeOther[0]}</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="department" className={labelClass}>
            ¿Dónde me gustaría participar? *
          </label>
          <CustomSelect
            id="department"
            name="_department"
            required
            placeholder="Selecciona tu departamento"
            options={Object.entries(departmentLabels).map(([value, label]) => ({ value, label }))}
            value={department}
            onChange={(val) => {
              setDepartment(val);
              setDestination("");
            }}
          />
        </div>

        {department && (
          <div className="animate-fade-in-up">
            <label htmlFor="destination" className={labelClass}>
              Destino del taller *
            </label>
            <CustomSelect
              id="destination"
              name="destination"
              required
              placeholder="Selecciona el destino"
              options={(departmentDestinations[department] || []).map((key) => ({
                value: key,
                label: destinationLabels[key],
              }))}
              value={destination}
              onChange={setDestination}
            />
            {fieldErrors.destination && (
              <p className={errorClass}>
                {fieldErrors.destination[0]}
              </p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="experience" className={labelClass}>
            Tiempo en el sector *
          </label>
          <CustomSelect
            id="experience"
            name="experience"
            required
            placeholder="Selecciona una opción"
            options={Object.entries(experienceLabels).map(([value, label]) => ({ value, label }))}
            value={experience}
            onChange={setExperience}
          />
          {fieldErrors.experience && (
            <p className={errorClass}>
              {fieldErrors.experience[0]}
            </p>
          )}
        </div>

        <div role="group" aria-labelledby="importance-label" className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner">
          <p id="importance-label" className={labelClass + " normal-case mb-4 ml-0"}>
            ¿Qué tan importante es el turismo para su organización? *
          </p>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-2">
            {Object.entries(importanceLabels).map(([val, label]) => (
              <label key={val} htmlFor={`tourismImportance-${val}`} className="flex flex-row sm:flex-col items-center gap-2 cursor-pointer group p-3 sm:p-0 rounded-xl hover:bg-gray-200/50 sm:hover:bg-transparent">
                <input
                  type="radio"
                  id={`tourismImportance-${val}`}
                  name="tourismImportance"
                  value={val}
                  className="w-6 h-6 accent-bolivia-green cursor-pointer"
                />
                <span className="text-[11px] sm:text-[9px] font-black text-left sm:text-center text-gray-500 group-hover:text-bolivia-dark leading-tight transition-colors uppercase tracking-tighter">
                  {label}
                </span>
              </label>
            ))}
          </div>
          {fieldErrors.tourismImportance && (
            <p className={errorClass + " mt-4 text-center"}>
              {fieldErrors.tourismImportance[0]}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-5 bg-bolivia-red text-white font-black rounded-2xl text-xl hover:bg-red-700 active:scale-[0.98] transition-all shadow-xl shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed mt-10 tracking-tight uppercase"
      >
        {loading ? "PROCESANDO..." : "REGISTRARME Y CONTINUAR A LA ENCUESTA"}
      </button>

      <div className="flex items-center justify-center gap-2">
        <span className="w-8 h-1 bg-bolivia-red rounded-full" />
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
          Paso 1 de 2
        </p>
        <span className="w-8 h-1 bg-gray-200 rounded-full" />
      </div>
    </form>
  );
}
