export interface ReleaseEvent {
  label: string; // e.g. "Original Arcade Release", "North America (NES)", "Famicom", "European Launch"
  date: string;  // e.g. "1985-09-13" or "1987"
  region: string; // "Japan", "North America", "Europe", "Worldwide", etc.
  platform?: string;
  type?: 'original' | 'regional' | 'port' | 'remaster' | 'announcement';
}

export interface GameSources {
  wikidata?: string;
  wikipedia?: string;
  wikimediaCommons?: string;
}

export interface Game {
  id: string; // Wikidata QID or curated unique ID e.g. "Q1321721"
  title: string;
  alternateTitles: string[];
  releaseDate: string;
  releaseYear: number;
  earliestReleaseDate: string;
  releaseHistory?: ReleaseEvent[];
  developer: string;
  publisher: string;
  developers: string[];
  publishers: string[];
  platforms: string[];
  genres: string[];
  franchises: string[];
  series: string[];
  country: string | null;
  description: string;
  historicalSignificance: string;
  developmentContext?: string;
  wikipediaUrl: string;
  wikidataUrl: string;
  imageUrl: string | null;
  imageCredit: string | null;
  imageLicense: string | null;
  source: string;
  sources: GameSources;
  lastUpdated: string;
  confidence: 'high' | 'medium' | 'curated';
  relatedGameIds?: string[];
  featured?: boolean;
}

export interface Era {
  id: string;
  name: string;
  subtitle: string;
  startYear: number;
  endYear: number;
  description: string;
  accentColor: string; // Hex color for timeline zone & accents
  curatorNotes: string;
  definingTech: string[];
}

export interface Milestone {
  id: string;
  title: string;
  year: number;
  date: string;
  category: 'hardware' | 'industry' | 'cultural' | 'software';
  description: string;
  historicalSignificance: string;
  wikipediaUrl?: string;
  imageUrl?: string | null;
  imageCredit?: string | null;
  imageLicense?: string | null;
}

export interface TimelineFilter {
  searchQuery: string;
  selectedEraId: string | null;
  selectedDecade: number | null;
  selectedGenre: string | null;
  selectedPlatform: string | null;
  selectedDeveloper: string | null;
  milestonesOnly: boolean;
  featuredOnly: boolean;
}

export type TimelineZoomLevel = 'era' | 'decade' | 'year' | 'deep';

export interface TimelineCamera {
  yearCenter: number; // Current centered year (e.g. 2026 to 1950)
  pixelsPerYear: number; // Scale factor: e.g. 10px to 300px per year
}
