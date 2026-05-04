import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const workshopsData = [
    // La Paz
    { name: "Taller Copacabana", destination: "COPACABANA" as const, city: "Copacabana", date: new Date("2026-03-24") },
    { name: "Taller Tiwanaku", destination: "TIWANAKU" as const, city: "Tiwanaku", date: new Date("2026-03-27") },
    { name: "Taller La Paz", destination: "LA_PAZ" as const, city: "La Paz", date: new Date("2026-03-31") },
    { name: "Taller El Alto", destination: "EL_ALTO" as const, city: "El Alto", date: new Date("2026-04-02") },
    { name: "Taller Coroico", destination: "COROICO_NORTE_LA_PAZ" as const, city: "Coroico", date: new Date("2026-04-02") },
    // Cochabamba
    { name: "Taller Cochabamba", destination: "COCHABAMBA" as const, city: "Cochabamba", date: new Date("2026-04-07") },
    { name: "Taller Villatunari", destination: "VILLATUNARI_TROPICO" as const, city: "Villatunari", date: new Date("2026-04-08") },
    // Oruro
    { name: "Taller Oruro", destination: "ORURO" as const, city: "Oruro", date: new Date("2026-04-07") },
    // Tarija
    { name: "Taller Tarija", destination: "TARIJA" as const, city: "Tarija", date: new Date("2026-04-07") },
    { name: "Taller Villa Montes", destination: "VILLA_MONTES" as const, city: "Villa Montes", date: new Date("2026-04-08") },
    // Beni
    { name: "Taller Rurrenabaque", destination: "RURRENABAQUE" as const, city: "Rurrenabaque", date: new Date("2026-04-11") },
    { name: "Taller Trinidad", destination: "TRINIDAD" as const, city: "Trinidad", date: new Date("2026-04-16") },
    // Potosí
    { name: "Taller Potosí", destination: "POTOSI" as const, city: "Potosí", date: new Date("2026-04-13") },
    { name: "Taller Uyuni", destination: "UYUNI" as const, city: "Uyuni", date: new Date("2026-04-27") },
    // Santa Cruz
    { name: "Taller Santa Cruz", destination: "SANTA_CRUZ" as const, city: "Santa Cruz", date: new Date("2026-04-14") },
    { name: "Taller Concepción", destination: "CONCEPCION_MISIONES" as const, city: "Concepción", date: new Date("2026-04-16") },
    { name: "Taller Samaipata", destination: "SAMAIPATA" as const, city: "Samaipata", date: new Date("2026-04-21") },
    { name: "Taller Camiri", destination: "CAMIRI" as const, city: "Camiri", date: new Date("2026-06-01") },
    // Sucre
    { name: "Taller Sucre", destination: "SUCRE" as const, city: "Sucre", date: new Date("2026-04-15") },
    // Pando
    { name: "Taller Cobija", destination: "COBIJA" as const, city: "Cobija", date: new Date("2026-04-21") },
  ];

  for (const w of workshopsData) {
    const id = w.city.toLowerCase().replace(/\s+/g, "-");
    await prisma.workshop.upsert({
      where: { id },
      update: { ...w },
      create: { id, ...w, capacity: 50 },
    });
  }

  console.log(`Seeded ${workshopsData.length} workshops`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
