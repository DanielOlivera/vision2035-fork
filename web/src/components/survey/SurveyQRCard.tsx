"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";

interface Props {
  surveyUrl: string;
}

export default function SurveyQRCard({ surveyUrl }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    QRCode.toDataURL(surveyUrl, {
      width: 240,
      margin: 2,
      color: { dark: "#1a1a2e", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).then(setDataUrl);
  }, [surveyUrl]);

  const download = useCallback(() => {
    if (!dataUrl || !linkRef.current) return;
    linkRef.current.href = dataUrl;
    linkRef.current.click();
  }, [dataUrl]);

  if (!dataUrl) return null;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="bg-bolivia-dark/5 rounded-2xl p-4">
          <img
            src={dataUrl}
            alt="Código QR de acceso a la encuesta"
            width={200}
            height={200}
            className="rounded-xl"
          />
        </div>

        <div>
          <p className="text-sm font-black text-bolivia-dark uppercase tracking-tight">
            Tu código único de acceso
          </p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
            Guarda este QR para retomar la encuesta en cualquier momento desde tu celular.
          </p>
        </div>

        <button
          type="button"
          onClick={download}
          className="px-5 py-2.5 bg-bolivia-dark text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-black transition-all active:scale-95"
        >
          Descargar QR
        </button>

        {/* Hidden download anchor */}
        <a
          ref={linkRef}
          download="mi-encuesta-vision2035.png"
          className="hidden"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
