import { Game, Era, Milestone, TimelineFilter } from '../types';

// Fallback direct bundled data
import defaultEras from '../../public/data/eras.json';
import defaultMilestones from '../../public/data/milestones.json';
import defaultGames from '../../public/data/games.json';

export interface Dataset {
  games: Game[];
  eras: Era[];
  milestones: Milestone[];
}

export async function loadExhibitionData(): Promise<Dataset> {
  let games: Game[] = defaultGames as Game[];
  let eras: Era[] = defaultEras as Era[];
  let milestones: Milestone[] = defaultMilestones as Milestone[];

  // Attempt dynamic fetch from server / public directory to support updated datasets
  try {
    const base = import.meta.env.BASE_URL || '/';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;

    const [gamesRes, erasRes, milestonesRes] = await Promise.allSettled([
      fetch(`${cleanBase}data/games.json`),
      fetch(`${cleanBase}data/eras.json`),
      fetch(`${cleanBase}data/milestones.json`),
    ]);

    if (gamesRes.status === 'fulfilled' && gamesRes.value.ok) {
      const fetchedGames = await gamesRes.value.json();
      if (Array.isArray(fetchedGames) && fetchedGames.length > 0) {
        games = fetchedGames;
      }
    }

    if (erasRes.status === 'fulfilled' && erasRes.value.ok) {
      const fetchedEras = await erasRes.value.json();
      if (Array.isArray(fetchedEras) && fetchedEras.length > 0) {
        eras = fetchedEras;
      }
    }

    if (milestonesRes.status === 'fulfilled' && milestonesRes.value.ok) {
      const fetchedMilestones = await milestonesRes.value.json();
      if (Array.isArray(fetchedMilestones) && fetchedMilestones.length > 0) {
        milestones = fetchedMilestones;
      }
    }
  } catch (err) {
    console.warn('Using bundled exhibition dataset fallback:', err);
  }

  // Sanitize and sort
  const validatedGames = games
    .filter(g => g && g.title && typeof g.releaseYear === 'number')
    .sort((a, b) => a.releaseYear - b.releaseYear || (a.releaseDate || '').localeCompare(b.releaseDate || ''));

  const validatedMilestones = milestones
    .filter(m => m && m.title && typeof m.year === 'number')
    .sort((a, b) => a.year - b.year);

  const validatedEras = [...eras].sort((a, b) => a.startYear - b.startYear);

  return {
    games: validatedGames,
    eras: validatedEras,
    milestones: validatedMilestones,
  };
}

export function getEraForYear(year: number, eras: Era[]): Era | undefined {
  return eras.find(era => year >= era.startYear && year <= era.endYear);
}

export function filterExhibitionData(
  games: Game[],
  milestones: Milestone[],
  eras: Era[],
  filters: TimelineFilter
): { filteredGames: Game[]; filteredMilestones: Milestone[] } {
  let gList = [...games];
  let mList = [...milestones];

  // Search query
  if (filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase().trim();
    gList = gList.filter(g => {
      const matchTitle = g.title.toLowerCase().includes(q);
      const matchAlternate = g.alternateTitles?.some(alt => alt.toLowerCase().includes(q));
      const matchDev = g.developer?.toLowerCase().includes(q) || g.developers?.some(d => d.toLowerCase().includes(q));
      const matchPub = g.publisher?.toLowerCase().includes(q) || g.publishers?.some(p => p.toLowerCase().includes(q));
      const matchGenre = g.genres?.some(genre => genre.toLowerCase().includes(q));
      const matchPlatform = g.platforms?.some(plat => plat.toLowerCase().includes(q));
      const matchFranchise = g.franchises?.some(f => f.toLowerCase().includes(q));
      const matchYear = g.releaseYear.toString() === q;
      return matchTitle || matchAlternate || matchDev || matchPub || matchGenre || matchPlatform || matchFranchise || matchYear;
    });

    mList = mList.filter(m => {
      return (
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.year.toString() === q
      );
    });
  }

  // Era filter
  if (filters.selectedEraId) {
    const era = eras.find(e => e.id === filters.selectedEraId);
    if (era) {
      gList = gList.filter(g => g.releaseYear >= era.startYear && g.releaseYear <= era.endYear);
      mList = mList.filter(m => m.year >= era.startYear && m.year <= era.endYear);
    }
  }

  // Decade filter
  if (filters.selectedDecade !== null) {
    const start = filters.selectedDecade;
    const end = start + 9;
    gList = gList.filter(g => g.releaseYear >= start && g.releaseYear <= end);
    mList = mList.filter(m => m.year >= start && m.year <= end);
  }

  // Genre filter
  if (filters.selectedGenre) {
    const genre = filters.selectedGenre.toLowerCase();
    gList = gList.filter(g => g.genres?.some(gName => gName.toLowerCase() === genre));
  }

  // Platform filter
  if (filters.selectedPlatform) {
    const plat = filters.selectedPlatform.toLowerCase();
    gList = gList.filter(g => g.platforms?.some(p => p.toLowerCase().includes(plat)));
  }

  // Developer filter
  if (filters.selectedDeveloper) {
    const dev = filters.selectedDeveloper.toLowerCase();
    gList = gList.filter(g => 
      g.developer?.toLowerCase().includes(dev) ||
      g.developers?.some(d => d.toLowerCase().includes(dev))
    );
  }

  // Featured only
  if (filters.featuredOnly) {
    gList = gList.filter(g => g.featured);
  }

  if (filters.milestonesOnly) {
    gList = [];
  }

  return {
    filteredGames: gList,
    filteredMilestones: mList,
  };
}
