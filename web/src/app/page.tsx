"use client";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { LANDING_CONTENT } from "@/lib/constants";
import { workshopDestinations } from "@/lib/destinations-data";

const ParticipationFlow = dynamic(() => import("@/components/ParticipationFlow"), {
  ssr: false,
  loading: () => <div className="min-h-[400px] flex items-center justify-center bg-gray-50 rounded-2xl"><p className="text-gray-400">Cargando formulario...</p></div>,
});

const VerticalWorkshopSlider = dynamic(() => import("@/components/VerticalWorkshopSlider"), {
  ssr: false,
  loading: () => <div className="h-[400px] flex items-center justify-center bg-white/5 rounded-[2.5rem] border border-white/10"><p className="text-gray-400">Cargando destinos...</p></div>,
});

const ImpactSlider = dynamic(() => import("@/components/ImpactSlider"), {
  ssr: false,
  loading: () => <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-[2.5rem]"><p className="text-gray-400">Cargando impacto...</p></div>,
});

const ImagesSlider = dynamic(() => import("@/components/ui/images-slider").then(mod => mod.ImagesSlider), {
  ssr: false,
  loading: () => <div className="h-screen w-full bg-bolivia-dark" />,
});

const StickyCTA = dynamic(() => import("@/components/StickyCTA"), {
  ssr: false,
});

export default function Home() {
  const { 
    hero, impact, opportunity, whatIs, workshops, roadmap, actors, launch, footer 
  } = LANDING_CONTENT;

  const mainCities = workshopDestinations.filter((d) => d.category === "CIUDAD");
  const emergingDestinations = workshopDestinations.filter((d) => d.category === "DESTINO EMERGENTE");

  const heroImages = [
    "/img/optimized/Potosí/Salar 05.webp",
    "/img/optimized/Potosí/Gruene Lagune - Salar de Uyuni.webp",
    "/img/optimized/La Paz/Lago Titikaka La Paz (3).webp",
    "/img/optimized/Oruro/NEVADO SAJAMA.webp",
    "/img/optimized/La Paz/1 La Paz.webp",
    "/img/optimized/La Paz/ciudad la paz 2.webp",
  ];

  return (
    <main className="min-h-screen bg-bolivia-dark selection:bg-bolivia-red selection:text-white">
      <StickyCTA />

      {/* ===== 1. HERO ===== */}
      <ImagesSlider images={heroImages} className="h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="z-50 flex flex-col justify-center items-center px-4"
        >
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <h1 className="font-extrabold text-[clamp(1.25rem,6.5vw,4.5rem)] text-white mb-4 leading-[1.1] whitespace-nowrap">
              {hero.title}
            </h1>
            <span className="px-4 py-1 rounded-full border border-bolivia-yellow/30 bg-bolivia-yellow/10 text-bolivia-yellow text-xs font-bold tracking-[0.3em] uppercase mb-6 backdrop-blur-sm">
              {hero.subtitle}
            </span>
            <p className="text-gray-200 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed text-balance">
              {hero.mainText}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/*
              <a
                href="#registro"
                className="px-10 py-4 bg-bolivia-red hover:bg-red-700 text-white rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(205,17,38,0.4)] active:scale-95"
              >
                {hero.cta}
              </a>
              */}
              <p className="text-gray-400 text-sm max-w-[200px] sm:text-left mb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
                {hero.ctaSubtext}
              </p>
            </div>
          </div>
        </motion.div>
      </ImagesSlider>

      {/* ===== 2. CONTADOR DE IMPACTO ===== */}
      <section className="py-24 relative overflow-hidden bg-white text-bolivia-dark">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <h2 className="text-center text-sm font-bold text-bolivia-gold tracking-[0.4em] uppercase mb-16">
            {impact.title}
          </h2>
          
          <ImpactSlider />
        </div>
      </section>

      {/* ===== 2.5 VIDEO DE PRESENTACIÓN ===== */}
      <section className="py-32 bg-bolivia-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-6xl font-black text-white mb-4 tracking-tight">
              BOLIVIA X EL MUNDO
            </h2>
            <p className="text-gray-400 font-medium text-lg italic">
              Una mirada profunda a la riqueza biocultural que nos define ante el mundo.
            </p>
          </div>
          
          <div className="max-w-sm mx-auto aspect-[9/16] w-full rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.5)] bg-black border border-white/10">
            <video
              className="w-full h-full object-cover"
              controls
              playsInline
              preload="metadata"
              poster=""
            >
              <source src="/video/video.mp4" type="video/mp4" />
              Tu navegador no soporta la reproducción de video.
            </video>
          </div>
        </div>
      </section>

      {/* ===== 3. OPORTUNIDAD PAÍS ===== */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-3xl md:text-5xl font-black text-bolivia-dark mb-10 leading-tight"
          >
            {opportunity.title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-lg md:text-2xl text-gray-600 leading-relaxed font-light italic text-balance"
          >
            "{opportunity.text}"
          </motion.p>
        </div>
      </section>

      {/* ===== 4. QUÉ ES BOLIVIA VISIÓN 2035 ===== */}
      <section className="py-32 bg-white relative">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
          <div className="w-full max-w-2xl mb-16">
             <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl hover:rotate-0 transition-transform duration-500">
                <Image src="/img/optimized/La Paz/Lago Titikaka La Paz (34).webp" alt="Bolivia" className="w-full h-full object-cover" width={800} height={450} loading="lazy" />
             </div>
          </div>
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-black text-bolivia-dark mb-8 leading-tight">
              {whatIs.title}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              {whatIs.text}
            </p>
            <div className="flex justify-center">
              <a
                href="#registro"
                className="inline-block px-10 py-4 bg-bolivia-dark text-white rounded-full font-bold hover:bg-black transition-all active:scale-95 shadow-xl"
              >
                {whatIs.cta}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 5. TALLERES DE CO-CREACIÓN ===== */}
      <section className="py-32 bg-bolivia-dark text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-bolivia-gradient opacity-50" />
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-black text-center mb-6">
            {workshops.title}
          </h2>
          <p className="text-center text-gray-400 mb-16 text-lg max-w-3xl mx-auto">
            {workshops.text}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workshops.deliverables.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ x: 10 }}
                className="flex items-center gap-5 bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
              >
                <span className="w-10 h-10 rounded-full bg-bolivia-green flex items-center justify-center text-white font-bold shrink-0 shadow-[0_0_15px_rgba(0,121,52,0.5)]">
                  ✓
                </span>
                <span className="text-lg font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 6. TERRITORIOS ESTRATÉGICOS ===== */}
      {/* 
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-black text-bolivia-dark text-center mb-16">
            20 Territorios Estratégicos
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-gray-50 p-10 rounded-[2rem] border border-gray-100">
              <h3 className="font-black text-bolivia-red mb-8 text-sm tracking-[0.3em] uppercase">
                Ciudades Principales
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {mainCities.map((d) => (
                  <div key={d.name} className="flex items-center gap-3 text-gray-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-bolivia-red/40" />
                    {d.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 p-10 rounded-[2rem] border border-gray-100">
              <h3 className="font-black text-bolivia-green mb-8 text-sm tracking-[0.3em] uppercase">
                Destinos Emergentes
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {emergingDestinations.map((d) => (
                  <div key={d.name} className="flex items-center gap-3 text-gray-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-bolivia-green/40" />
                    {d.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* ===== 7. LÍNEA DE TIEMPO ===== */}
      <section className="py-32 bg-gray-50 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-black text-bolivia-dark text-center mb-20">
            {roadmap.title}
          </h2>
          <div className="relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gray-200 hidden md:block" />
            <div className="space-y-16">
              {roadmap.phases.map((phase, idx) => (
                <motion.div 
                  key={phase.id} 
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`relative flex items-center justify-between w-full ${idx % 2 === 0 ? "md:flex-row-reverse" : ""}`}
                >
                  <div className="hidden md:block w-5/12" />
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-4 border-bolivia-gold z-10 flex items-center justify-center font-black text-bolivia-dark shadow-xl">
                    {phase.id}
                  </div>
                  <div className="w-full md:w-5/12 ml-16 md:ml-0 bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-shadow border border-gray-100">
                    <p className="text-xs font-black text-bolivia-gold tracking-widest mb-3 uppercase">
                      {phase.dates}
                    </p>
                    <h3 className="font-black text-xl text-bolivia-dark mb-3">
                      {phase.name}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {phase.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 8. ACTORES ===== */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-bolivia-dark mb-4 tracking-tight">
              {actors.title}
            </h2>
            <p className="text-gray-500 font-medium text-lg italic">
              {actors.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {actors.list.map((actor, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-gray-50 hover:bg-white hover:shadow-2xl hover:shadow-bolivia-gold/10 rounded-[2rem] p-10 text-center transition-all duration-500 border border-transparent hover:border-bolivia-gold/20"
              >
                <div className="flex justify-center mb-6">
                  {actor.name === "Gobiernos locales" ? (
                    <svg className="w-12 h-12 text-bolivia-gold" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                    </svg>
                  ) : actor.name === "ONGs" ? (
                    <svg className="w-12 h-12 text-bolivia-green" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    </svg>
                  ) : (
                    <span className="text-5xl block">{actor.icon}</span>
                  )}
                </div>
                <p className="font-black text-gray-800 tracking-tight leading-tight">
                  {actor.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 9. LANZAMIENTO OFICIAL / TALLERES ===== */}
      <section className="py-32 bg-bolivia-dark text-white text-center relative overflow-hidden">
         <div className="absolute inset-0 opacity-20 pointer-events-none grayscale">
            <Image src="/img/optimized/La Paz/1 La Paz.webp" alt="La Paz" className="w-full h-full object-cover" width={1920} height={1080} loading="lazy" />
         </div>
         <div className="relative z-10 max-w-4xl mx-auto px-6">
            <p className="text-bolivia-yellow font-black text-sm tracking-[0.4em] uppercase mb-6">
              20 Talleres de Innovación
            </p>
            <h2 className="text-4xl md:text-7xl font-black mb-16 tracking-tighter">
              TERRITORIOS CLAVE
            </h2>
            
            <VerticalWorkshopSlider />

            <p className="mt-16 text-gray-400 text-lg max-w-xl mx-auto italic">
              "Construyendo la Visión Bolivia 2035 desde cada rincón del país."
            </p>
         </div>
      </section>

      {/* ===== 10. REGISTRO (Scroll target) ===== */}
      <section id="registro" className="py-32 bg-white scroll-mt-10">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-bolivia-dark mb-6 tracking-tight leading-none">
              SÉ PARTE DE LA CONSTRUCCIÓN DEL FUTURO
            </h2>
            <div className="h-1.5 w-24 bg-bolivia-red mx-auto mb-8 rounded-full" />
            <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
              Los participantes serán seleccionados para garantizar la
              representatividad de la cadena de valor turística boliviana.
            </p>
          </div>
          <div className="bg-gray-50 rounded-[3rem] p-8 md:p-12 shadow-inner border border-gray-100">
            <ParticipationFlow />
          </div>
        </div>
      </section>

      {/* ===== 11. FOOTER ===== */}
      <footer className="bg-bolivia-dark text-white border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 mb-16">
            <div className="shrink-0">
              <h3 className="font-black text-2xl tracking-tighter leading-none">
                {footer.org}
              </h3>
              <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px] mt-1">
                {footer.suborg}
              </p>
            </div>
            <div className="flex items-center gap-4 md:mt-0">
              {footer.social.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-bolivia-red transition-colors"
                >
                  <span className="text-[8px] font-black uppercase">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-16 text-center md:text-left">
            {footer.columns.map((col) => (
              <div key={col.title}>
                <h4 className="font-black text-xs uppercase tracking-widest text-bolivia-gold mb-5">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-center md:text-left">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">BOLIVIA &copy; {footer.year}</p>
            </div>
            <p className="text-[10px] text-gray-600 max-w-md italic">{footer.legal}</p>
          </div>
        </div>
      </footer>

      <div className="h-20 md:hidden" />
    </main>
  );
}
