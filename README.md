# Investment Wizard

Investment Wizard is a local-first investment portfolio tracker built with Next.js. It helps you organize assets and categories, monitor allocations, record portfolio snapshots, and plan recurring buys with DCA schedules.

## Features
- Dashboard with total portfolio value, allocation breakdown, and return evolution.
- Categories with target allocations and per-category totals.
- Assets with current vs target allocation diffs.
- Snapshots to track portfolio history over time.
- DCA (Dollar Cost Averaging) plans with auto-generated schedules and completion tracking.
- Investment rules and reminders.
- Settings for currency and USD/BRL exchange rate.

## Tech Stack
- Next.js 16 (App Router)
- React 19
- SQLite via `better-sqlite3`
- Tailwind CSS v4 + shadcn/ui
- Recharts
- Zod + react-hook-form

## Getting Started

### Requirements
- Node.js 18+ (recommended)
- npm, pnpm, or yarn

### Install
```bash
npm install
```

### Run
```bash
npm run dev
```

Open `http://localhost:3000`.

## Project Structure
- `src/app` App Router pages (dashboard, assets, categories, snapshots, DCA, rules, settings)
- `src/components` UI components, dialogs, charts, forms
- `src/lib/db` SQLite connection and migrations
- `src/lib/queries` Read models and computed stats
- `src/lib/actions` Server actions for create/update/delete
- `src/lib/validators` Zod schemas for validation
- `data/` Local SQLite database and WAL files (ignored by git)

## Data Storage
The database lives at `data/investment_wizard.db`. It is created and migrated automatically on first run. This file is local-only and is ignored by git.

## Scripts
```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Roadmap Ideas
- Import/export (CSV)
- Multi-currency support
- Price feed integrations
- Authentication and cloud sync

## Contributing
Issues and PRs are welcome. If you plan a larger change, open an issue first to discuss scope and approach.

## License
Not specified yet.
