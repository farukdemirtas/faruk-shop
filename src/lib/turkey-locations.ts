import locations from "@/data/turkey-locations.json";

export type TurkeyLocations = Record<string, string[]>;

const data = locations as TurkeyLocations;

/** Alfabetik sıralı 81 il listesi */
export const CITIES = Object.keys(data).sort((a, b) => a.localeCompare(b, "tr"));

/** Seçilen ile ait ilçeler */
export function getDistricts(city: string): string[] {
  return data[city] ?? [];
}

export const DEFAULT_CITY = "Samsun";
