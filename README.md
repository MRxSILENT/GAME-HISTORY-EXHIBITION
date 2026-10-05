# GAME HISTORY EXHIBITION

> **"Explore the history of gaming — from the first pixels to the future."**

An interactive visual museum and historical timeline of video games, spanning from the earliest 1950s experimental mainframe and oscilloscope demonstrations through the arcade golden age, 8-bit renaissance, 3D revolution, online expansion, and the contemporary 2026 era.

Designed specifically to run as a **high-performance static website on GitHub Pages** with zero runtime server, PHP, MySQL, MongoDB, or Firebase requirements. All structured data is automatically synthesized from legitimate public sources (Wikidata SPARQL endpoints and Wikimedia Commons).

---

## 🏛 Exhibition Features

- **Present-to-Past Chronological Exploration**: Initial entrance centers in the **current era (2020s–2026+)**, letting visitors travel backward through decades of gaming breakthroughs.
- **Continuous Timeline Canvas**: Smooth mouse-wheel zooming centered on your cursor, panning, mobile touch drag, and pinch-to-zoom.
- **Dynamic Level of Detail (LOD)**:
  - **LOD 1 (Era Level)**: Visual overview of the 10 historical eras, defining technologies, and decades.
  - **LOD 2 (Decade Level)**: Milestones, key landmark titles, and decade transition markers.
  - **LOD 3 (Year Level)**: Individual years with compact preview capsules.
  - **LOD 4 (Deep Level)**: High-resolution cards, cover art, developers, genres, and platforms.
- **Curated Museum Exhibition Hall**: Alternative gallery view grouping exhibits into chronological wings with contextual era overviews.
- **Historical Milestones**: Hardware and cultural turning points (such as the Cathode-Ray Tube patent, Magnavox Odyssey, Atari 2600, 1983 crash, Game Boy, PlayStation launch, Steam, and Unreal Engine 5).
- **Comprehensive Game Archives**: Detailed view for every game featuring:
  - Archival overview and primary creative leadership
  - Engineering & developmental history
  - Regional release timeline (original arcade vs Famicom/NES vs European vs PC ports)
  - Historical significance and cultural impact
  - Sourced attribution links (Wikidata QIDs, Wikipedia articles, Wikimedia Commons files)
  - Thematically and chronologically related exhibits
- **Client-Side Instant Search**: Fast, debounced query parser with instant autocomplete suggestions.
- **Multi-Faceted Archive Filtering**: Filter simultaneously by Era, Decade, Genre, Platform, Developer, or Landmark status.
- **Curator-Guided Historical Tours**: Guided paths highlighting pivotal inflection points like the *Dawn of Interactive Computing*, *The 8-Bit Renaissance*, and *The 3D Dimensional Revolution*.

---

## 🕹 Keyboard Navigation

| Key | Action |
| :--- | :--- |
| `+` or `=` | Zoom in on timeline |
| `-` or `_` | Zoom out on timeline |
| `Home` | Return to Present Era (2026) |
| `←` / `→` | Pan backward / forward through time |
| `Esc` | Close open exhibit modal |
| `?` | Toggle keyboard shortcuts cheatsheet |
| `Mouse Drag` | Pan horizontally |
| `Mouse Wheel`| Zoom centered at cursor |

---

## 📁 Project Architecture

```
game-history-exhibition/
├── index.html                  # HTML5 entry with archival typography & metadata
├── metadata.json               # Applet identity and capabilities
├── package.json                # Frontend dependencies
├── tsconfig.json               # TypeScript compiler configuration
├── vite.config.ts              # Vite static build configuration
│
├── src/
│   ├── main.tsx                # React 19 application entry
│   ├── App.tsx                 # Core museum state, camera coordination & layout
│   ├── index.css               # Tailwind CSS v4 & archival styling
│   ├── types/
│   │   └── index.ts            # Canonical data models (Game, Era, Milestone, Filter)
│   ├── services/
│   │   └── dataLoader.ts       # Unified loader with live fetch & bundled fallback
│   └── components/
│       ├── HeroExhibition.tsx  # Atmospheric museum entrance & present era preview
│       ├── TimelineCanvas.tsx  # High-performance SVG/Canvas timeline engine
│       ├── TimelineControls.tsx# Camera zoom, year jump & view toggle
│       ├── SearchAndFilterBar.tsx # Instant search & multi-facet drawer
│       ├── ExhibitionHall.tsx  # Chronological gallery walk-through
│       ├── GameDetailModal.tsx # Full historical exhibit modal
│       ├── MilestoneDetailModal.tsx # Hardware/industry milestone exhibit
│       ├── MuseumCuratorGuide.tsx # Curated guided narrative tours
│       └── KeyboardShortcutsModal.tsx # Keyboard navigation guide
│
├── public/data/ & data/
│   ├── games.json              # Canonical video game dataset
│   ├── eras.json               # Configurable historical era brackets
│   └── milestones.json         # Hardware & cultural milestones
│
├── scripts/                    # Python data pipeline
│   ├── wikidata.py             # Wikidata SPARQL client with caching & retries
│   ├── wikipedia.py            # Wikipedia REST API summary enricher
│   ├── wikimedia.py            # Wikimedia Commons media & license fetcher
│   ├── normalize.py            # Schema normalization & date resolution
│   ├── validate_data.py        # Strict data quality validation suite
│   ├── fetch_games.py          # Multi-source fetch orchestrator
│   └── generate_data.py        # CLI pipeline generator
│
├── requirements.txt            # Python dependencies
└── .github/workflows/
    ├── update-games.yml        # Scheduled automated dataset updater
    └── deploy-pages.yml        # Automated GitHub Pages static deployment
```

---

## 🚀 Local Development

### 1. Web Application (Vite + React)
```bash
# Install dependencies
npm install

# Start local development server on port 3000
npm run dev

# Build production static bundle
npm run build
```

### 2. Python Data Pipeline
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run data validation test suite
python scripts/validate_data.py

# Run data generator pipeline (using cached / existing records)
python scripts/generate_data.py

# Run live enrichment from Wikidata SPARQL and Wikimedia Commons APIs
python scripts/generate_data.py --live
```

---

## 🌐 Deploying to GitHub Pages

This project is built from the ground up to run as a static website on **GitHub Pages**:

### Option A: Automated Deployment via GitHub Actions (Recommended)
1. Push this repository to your GitHub repository (branch `main`).
2. On GitHub, go to your repository **Settings** → **Pages** (in the left sidebar).
3. Under **Build and deployment**:
   - **Source**: Select **GitHub Actions** from the dropdown (instead of "Deploy from a branch").
4. Go to the **Actions** tab on your repository and verify the **Deploy Static Website to GitHub Pages** workflow runs and finishes.
5. Your exhibition is live at `https://<your-username>.github.io/<repo-name>/`.

### Option B: Deploying Pre-built `dist/` or `gh-pages` Branch
If you prefer deploying a built folder:
1. Run `npm run build` locally.
2. In your repo **Settings** → **Pages**:
   - **Source**: Select **Deploy from a branch**.
   - **Branch**: Select your branch and set folder to `/ (root)` or `/dist`.
   - Save changes.

### Why "Nothing is appearing" Happens & How It Is Solved:
1. **Repository Subpath Assets**: By default, Vite builds assets starting with `/assets/...`, which fails when GitHub Pages serves your site at `https://<username>.github.io/<repo-name>/`. We configured `base: './'` in `vite.config.ts`, ensuring all script and style links are relative (`./assets/...`) and load seamlessly under any repository name.
2. **Jekyll Processing Bypass**: GitHub Pages enables Jekyll by default, which can block directories or files. We included `public/.nojekyll` so GitHub Pages serves raw static files directly.
3. **SPA Fallback Routing**: We included `public/404.html` so direct page refreshes or subroutes don't trigger GitHub's default 404 page.

---

## 🤖 Automated Updates via GitHub Actions

The workflow `.github/workflows/update-games.yml` automates dataset freshness:
- Runs automatically once per month via cron (`0 3 1 * *`).
- Can be manually triggered anytime via the **Run workflow** button on GitHub Actions (`workflow_dispatch`).
- Queries Wikidata SPARQL and Wikimedia Commons to detect any updated publication dates, historical records, and image licenses.
- Validates data integrity before committing changes back to the repository.

---

## 📚 Expanding the Dataset

To add more games or expand specific eras:

1. Open `scripts/fetch_games.py`.
2. Add Wikidata QIDs to `CORE_LANDMARK_QIDS` (for example, `"Q11168"` for Super Mario Bros).
3. Run:
   ```bash
   python scripts/generate_data.py --live
   ```
4. The pipeline will automatically:
   - Query Wikidata for structured release dates, developers, and platform IDs.
   - Fetch verified Wikipedia summaries without web scraping.
   - Check Wikimedia Commons for public domain or Creative Commons media.
   - Format and validate the resulting JSON records into `data/games.json` and `public/data/games.json`.

---

## ⚖️ Open Data & Media Attribution

All historical data and media are sourced under open licenses:
- Structured properties: [Wikidata](https://www.wikidata.org) (CC0 Public Domain Dedication).
- Article excerpts: [Wikipedia](https://en.wikipedia.org) (CC BY-SA 4.0).
- Archival images: [Wikimedia Commons](https://commons.wikimedia.org) under their respective Public Domain or Creative Commons licenses as attributed on each individual exhibit record.
