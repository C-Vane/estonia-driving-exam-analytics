# Estonia driving exams 2023+

Analytics dashboard for Estonian driving exam open data (2025 and 2026 exports).

## Project structure

- `se_2025.csv`, `se_2026.csv` — source data at the repository root
- `dashboard/` — Next.js analytics application

## Quick start

```bash
cd dashboard
npm install
npm run import-data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build for production

```bash
cd dashboard
npm run build
npm run start
```

The build runs `import-data` automatically so the SQLite database is created before the app starts.

## Data

CSV files are imported into `dashboard/data/exams.db`. The database file is generated locally and is not committed to Git. Run `npm run import-data` after cloning.
