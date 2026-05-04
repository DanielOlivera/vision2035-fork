"use client";

import React from "react";
import { getDestinationsByDepartment } from "@/lib/destinations-data";

const groups = getDestinationsByDepartment();
// Flatten for slider: each slide is a department group
export default function VerticalWorkshopSlider() {
  return (
    <div className="relative w-full max-w-md mx-auto h-[400px] flex flex-col items-center">
      {/* Indicador de Swipe */}
      <div className="absolute -top-10 flex flex-col items-center animate-bounce opacity-40">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Desliza Verticalmente</span>
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </div>

      {/* Contenedor Scrollable Vertical */}
      <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-2xl">
        {groups.map((group, gIdx) => (
          <div
            key={group.department}
            className="w-full h-full snap-start flex flex-col items-center justify-center p-8 text-center shrink-0 border-b border-white/5 last:border-0"
          >
            {/* Departamento */}
            <span className="px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-bolivia-yellow/30 bg-bolivia-yellow/10 text-bolivia-yellow">
              {group.department}
            </span>

            {/* Destinos del departamento */}
            <div className="space-y-3 w-full max-w-xs">
              {group.destinations.map((dest) => (
                <div key={dest.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0 bg-bolivia-gold" />
                    <span className="text-white font-bold text-sm truncate">{dest.name}</span>
                  </div>
                  <span className={`text-xs font-bold shrink-0 ${
                    dest.date === "Por definir" ? "text-gray-500 italic" : "text-bolivia-yellow/70"
                  }`}>
                    {dest.date}
                  </span>
                </div>
              ))}
            </div>

            {/* Contador de posición */}
            <div className="mt-6 text-[10px] font-bold text-bolivia-yellow/50 tracking-[0.4em] uppercase">
              {gIdx + 1} / {groups.length}
            </div>
          </div>
        ))}
      </div>

      {/* Sombras internas */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-bolivia-dark/80 to-transparent pointer-events-none rounded-t-[2.5rem]" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bolivia-dark/80 to-transparent pointer-events-none rounded-b-[2.5rem]" />
    </div>
  );
}
