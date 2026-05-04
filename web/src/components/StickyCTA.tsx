"use client";

import { useEffect, useState } from "react";

export default function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/90 backdrop-blur-sm border-t border-gray-200 md:hidden">
      <a
        href="#registro"
        className="block w-full py-3 bg-bolivia-red text-white text-center font-bold rounded-lg text-base active:scale-95 transition-transform"
      >
        QUIERO PARTICIPAR
      </a>
    </div>
  );
}
