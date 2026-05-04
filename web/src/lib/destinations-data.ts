export interface WorkshopDestination {
  name: string;
  department: string;
  date: string;       // "24 mar", "7 abr", etc. — for display
  dateISO: string;    // "2026-03-24" — for sorting
  category: "CIUDAD" | "DESTINO EMERGENTE";
}

// Ordered by date (nearest first), grouped by department
export const workshopDestinations: WorkshopDestination[] = [
  // La Paz — 24 mar to 2 abr
  { name: "Copacabana",              department: "La Paz",      date: "24 mar",  dateISO: "2026-03-24", category: "DESTINO EMERGENTE" },
  { name: "Tiwanaku",                department: "La Paz",      date: "27 mar",  dateISO: "2026-03-27", category: "DESTINO EMERGENTE" },
  { name: "La Paz",                  department: "La Paz",      date: "31 mar",  dateISO: "2026-03-31", category: "CIUDAD" },
  { name: "El Alto",                 department: "La Paz",      date: "2 abr",   dateISO: "2026-04-02", category: "CIUDAD" },
  { name: "Coroico (Norte La Paz)",  department: "La Paz",      date: "2 abr",   dateISO: "2026-04-02", category: "DESTINO EMERGENTE" },
  // Cochabamba — 7-8 abr
  { name: "Cochabamba",              department: "Cochabamba",  date: "7 abr",   dateISO: "2026-04-07", category: "CIUDAD" },
  { name: "Villatunari (Trópico)",   department: "Cochabamba",  date: "8 abr",   dateISO: "2026-04-08", category: "DESTINO EMERGENTE" },
  // Oruro — 7 abr
  { name: "Oruro",                   department: "Oruro",       date: "7 abr",   dateISO: "2026-04-07", category: "CIUDAD" },
  // Tarija — 7-8 abr
  { name: "Tarija",                  department: "Tarija",      date: "7 abr",   dateISO: "2026-04-07", category: "CIUDAD" },
  { name: "Villa Montes",            department: "Tarija",      date: "8 abr",   dateISO: "2026-04-08", category: "DESTINO EMERGENTE" },
  // Beni — 11-16 abr
  { name: "Rurrenabaque",            department: "Beni",        date: "11 abr",  dateISO: "2026-04-11", category: "DESTINO EMERGENTE" },
  { name: "Trinidad",                department: "Beni",        date: "16 abr",  dateISO: "2026-04-16", category: "CIUDAD" },
  // Potosí — 13-27 abr
  { name: "Potosí",                  department: "Potosí",      date: "13 abr",  dateISO: "2026-04-13", category: "CIUDAD" },
  { name: "Uyuni",                   department: "Potosí",      date: "27 abr",  dateISO: "2026-04-27", category: "DESTINO EMERGENTE" },
  // Santa Cruz — 14-21 abr + por definir
  { name: "Santa Cruz",              department: "Santa Cruz",  date: "14 abr",  dateISO: "2026-04-14", category: "CIUDAD" },
  { name: "Concepción (Misiones Jesuíticas)", department: "Santa Cruz", date: "16 abr", dateISO: "2026-04-16", category: "DESTINO EMERGENTE" },
  { name: "Samaipata",               department: "Santa Cruz",  date: "21 abr",  dateISO: "2026-04-21", category: "DESTINO EMERGENTE" },
  { name: "Camiri",                  department: "Santa Cruz",  date: "Por definir", dateISO: "2026-12-31", category: "DESTINO EMERGENTE" },
  // Sucre — 15 abr
  { name: "Sucre",                   department: "Sucre",       date: "15 abr",  dateISO: "2026-04-15", category: "CIUDAD" },
  // Pando — 21 abr
  { name: "Cobija",                  department: "Pando",       date: "21 abr",  dateISO: "2026-04-21", category: "CIUDAD" },
];

// Simple list of city names for backward compatibility
export const workshopCities = workshopDestinations.map((d) => d.name);

// Grouped by department for VerticalWorkshopSlider
export function getDestinationsByDepartment(): { department: string; destinations: WorkshopDestination[] }[] {
  const map = new Map<string, WorkshopDestination[]>();
  for (const dest of workshopDestinations) {
    const list = map.get(dest.department) ?? [];
    list.push(dest);
    map.set(dest.department, list);
  }
  return Array.from(map.entries()).map(([department, destinations]) => ({
    department,
    destinations,
  }));
}
