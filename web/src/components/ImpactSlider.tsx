"use client";

import React, { useState, useRef } from "react";
import { LANDING_CONTENT } from "@/lib/constants";

export default function ImpactSlider() {
  const { impact } = LANDING_CONTENT;
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setCurrentIndex(index);
    }
  };

  const scrollTo = (index: number) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      scrollRef.current.scrollTo({
        left: index * clientWidth,
        behavior: "smooth",
      });
    }
  };

  // Iconos personalizados con colores de marca
  const getIcon = (idx: number) => {
    const icons = [
      // 1. Talleres (Dorado/Gold)
      <svg key="w" className="w-16 h-16 text-bolivia-gold" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
      </svg>,
      // 2. Destinos (Rojo/Red)
      <svg key="d" className="w-16 h-16 text-bolivia-red" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>,
      // 3. Actores (Verde/Green)
      <svg key="a" className="w-16 h-16 text-bolivia-green" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </svg>
    ];
    return icons[idx];
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="absolute -top-12 right-0 text-[10px] font-black text-bolivia-gold tracking-[0.4em] uppercase">
        {currentIndex + 1} / {impact.counters.length}
      </div>

      <div className="relative group">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-6 pb-4"
        >
          {impact.counters.map((counter, idx) => (
            <div 
              key={idx}
              className="w-full shrink-0 snap-center p-12 md:p-16 rounded-[2.5rem] bg-gray-50 border border-gray-100 flex flex-col items-center text-center transition-all duration-500 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50"
            >
              <div className="mb-8 scale-110 transition-transform duration-500 group-hover:scale-125">
                {getIcon(idx)}
              </div>
              <p className="text-6xl md:text-8xl font-black mb-4 text-bolivia-dark font-sans tracking-tighter leading-none">
                {counter.value}{counter.suffix || ""}
              </p>
              <p className="text-gray-500 font-bold text-sm md:text-base uppercase tracking-[0.2em] leading-tight max-w-[250px]">
                {counter.label}
              </p>
            </div>
          ))}
        </div>

        <button 
          onClick={() => scrollTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 border border-gray-100 shadow-xl flex items-center justify-center text-bolivia-dark hover:bg-bolivia-red hover:text-white transition-all disabled:opacity-0 hidden md:flex"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={() => scrollTo(currentIndex + 1)}
          disabled={currentIndex === impact.counters.length - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 border border-gray-100 shadow-xl flex items-center justify-center text-bolivia-dark hover:bg-bolivia-red hover:text-white transition-all disabled:opacity-0 hidden md:flex"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex justify-center gap-3 mt-8">
        {impact.counters.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollTo(idx)}
            className={`transition-all duration-300 rounded-full ${
              currentIndex === idx 
                ? "w-8 h-2 bg-bolivia-red" 
                : "w-2 h-2 bg-gray-200 hover:bg-gray-300"
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
