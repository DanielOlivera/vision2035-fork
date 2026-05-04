"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";

interface Option {
  value: string;
  label: string;
}

interface Props {
  id: string;
  name: string;
  options: Option[];
  placeholder: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export default function CustomSelect({ id, name, options, placeholder, required, value: initialValue, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(initialValue || "");
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync internal state when controlled value changes externally
  useEffect(() => {
    if (initialValue !== undefined && initialValue !== selected) {
      setSelected(initialValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  const handleSelect = (val: string) => {
    setSelected(val);
    setIsOpen(false);
    if (onChange) onChange(val);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !(dropdownRef.current && dropdownRef.current.contains(event.target as Node))
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setDropdownRect(null);
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDropdownRect({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    }

    const handleResize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDropdownRect({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, [isOpen]);

  const selectedLabel = options.find(o => o.value === selected)?.label || placeholder;

  return (
    <div className={`relative ${isOpen ? "z-[9999]" : ""}`} ref={containerRef}>
      {/* Hidden input para que el formulario siga capturando el valor */}
      <input type="hidden" id={id} name={name} value={selected} required={required} />
      
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-4 py-3 border rounded-xl text-left flex justify-between items-center transition-all font-medium ${
          isOpen ? "ring-2 ring-bolivia-green border-transparent" : "border-gray-300 bg-white"
        } ${selected ? "text-gray-900" : "text-gray-400"}`}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg 
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && dropdownRect && ReactDOM.createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: dropdownRect.top + dropdownRect.height,
            left: dropdownRect.left,
            width: dropdownRect.width,
            zIndex: 20000,
          }}
          className="bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up"
        >
          {/* Contenedor con SCROLL limitado a ~6 elementos (44px * 6 = 264px aprox) */}
          <div className="max-h-[260px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                  selected === option.value ? "bg-bolivia-green/10 text-bolivia-green font-bold" : "text-gray-700"
                }`}
              >
                {option.label}
                {selected === option.value && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
