# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint

# Database inspection
sqlite3 data/investment_wizard.db "PRAGMA table_info(assets);"
sqlite3 data/investment_wizard.db "SELECT * FROM settings;"
```

## Architecture Overview

Investment Wizard is a **local-first portfolio tracker** using Next.js 16 App Router with SQLite. The key architectural pattern is:

**Server Components → Queries → SQLite ← Actions ← Client Components**

All data flows through a synchronous SQLite database with computed statistics calculated on read.

### Core Data Flow

1. **Server Components** (pages) call query functions synchronously
2. **Query functions** (`src/lib/queries/`) read from SQLite and compute stats
3. **Server Actions** (`src/lib/actions/`) mutate SQLite and revalidate paths
4. **Client Components** trigger actions via form submissions or event handlers
5. **Database migrations** run automatically on first page load via `getDb()`

### Critical Architectural Patterns

#### Database Layer (`src/lib/db/`)

- **Singleton pattern**: `getDb()` returns a single SQLite instance
- **WAL mode enabled**: Allows concurrent reads during writes
- **Foreign keys enforced**: `PRAGMA foreign_keys = ON`
- **Migrations run on init**: `runMigrations(db)` is idempotent with column existence checks
- **Snake_case in DB, camelCase in TypeScript**: Query functions map between conventions

#### Query Layer (`src/lib/queries/`)

**Read-only, synchronous functions that compute stats on-the-fly:**

```typescript
// Pattern: Direct SQLite reads with computed properties
export function getCategoriesWithStats(): CategoryWithStats[] {
  const db = getDb();
  const categories = db.prepare('SELECT * FROM categories').all();
  const assets = db.prepare('SELECT * FROM assets').all();

  // Compute totalValue, currentAllocation, allocationDiff
  return categories.map(cat => ({
    ...mapRow(cat),
    totalValue: computeTotal(cat),
    currentAllocation: computeAllocation(cat, assets),
    allocationDiff: current - target,
  }));
}
```

**No caching, no async** - stats are calculated on every read. This keeps logic simple and data always fresh.

#### Action Layer (`src/lib/actions/`)

**Server actions follow this strict pattern:**

```typescript
'use server';

export async function createAsset(formData: FormData) {
  // 1. Extract raw data from FormData
  const raw = { ticker: formData.get('ticker'), ... };

  // 2. Validate with Zod schema
  const parsed = assetSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // 3. Mutate SQLite synchronously
  const db = getDb();
  db.prepare('INSERT INTO assets ...').run(...);

  // 4. Revalidate affected paths
  revalidatePath('/');
  revalidatePath('/assets');

  return { success: true };
}
```

**All actions return `{ success: true }` or `{ error: string }`** for consistent error handling.

#### Type Mapping Pattern

Database rows use `snake_case`, TypeScript uses `camelCase`:

```typescript
interface AssetRow {
  category_id: number;
  target_allocation: number;
  created_at: string;
}

function mapRow(row: AssetRow): Asset {
  return {
    categoryId: row.category_id,
    targetAllocation: row.target_allocation / 100, // Convert to decimal
    createdAt: row.created_at,
  };
}
```

**Percentages stored as integers (0-100) in DB, converted to decimals (0-1) in TypeScript.**

### Automatic Price Updates Architecture

The price update system follows a **multi-layered approach**:

1. **Asset Type Detection** (`src/lib/services/asset-type-detector.ts`): Auto-detects asset type from ticker format (PETR4 → B3_STOCK, AAPL → US_STOCK, BTC → CRYPTO)

2. **API Integration** (`src/lib/services/price-api.ts`): Routes to appropriate API based on asset type:
   - **Brapi**: Brazilian stocks/FIIs (1 req/sec)
   - **Alpha Vantage**: US stocks (5 req/min) - requires API key
   - **CoinGecko**: Crypto in BRL (10-50 req/min)
   - Uses in-memory `Map<string, number>` for rate limiting

3. **Price Update Actions** (`src/lib/actions/price-updates.ts`): Server actions that fetch prices and update DB
   - Sequential updates with delays to respect rate limits
   - Returns `PriceUpdateResult` with success/error per asset

4. **Auto-Update Hook** (`src/hooks/use-auto-price-update.ts`): Client hook that triggers updates on page load
   - Uses `useRef` to prevent double-execution in StrictMode
   - Respects `price_update_interval` setting (default 15 min)

### Component Patterns

#### Server vs Client Components

**Server Components** (default):
- All pages in `src/app/`
- Directly call query functions
- Pass data as props to client components

**Client Components** (`'use client'`):
- Forms with interactive state
- Dialogs with open/close state
- Buttons that call server actions
- Hooks that trigger side effects

**Critical**: Server Components cannot pass event handlers to Client Components. Use `.bind()` pattern:

```typescript
// ❌ Wrong - creates a new function (not serializable)
<DeleteButton onDelete={async () => deleteAsset(id)} />

// ✅ Correct - bind creates a serializable function
<DeleteButton onDelete={deleteAsset.bind(null, id)} />
```

#### Form Submission Pattern

Forms use **progressive enhancement** with server actions:

```typescript
'use client';

export function AssetFormDialog({ asset }: Props) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    const result = asset
      ? await updateAsset(asset.id, formData)
      : await createAsset(formData);

    if ('error' in result) {
      toast.error('Please check the form fields');
      return; // Stay open on error
    }

    toast.success('Asset saved');
    setOpen(false); // Close on success
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form action={handleSubmit}>
        {/* inputs */}
      </form>
    </Dialog>
  );
}
```

### Database Schema Conventions

- **Primary keys**: `id INTEGER PRIMARY KEY AUTOINCREMENT`
- **Foreign keys**: Always `ON DELETE CASCADE` or `ON DELETE SET NULL`
- **Timestamps**: `TEXT` storing ISO 8601 strings via `datetime('now')`
- **Unique constraints**: Defined inline (e.g., `UNIQUE(category_id, ticker)`)
- **Percentages**: Stored as `REAL` (0-100 in DB, 0-1 in TypeScript)

### Adding New Features

To add a new feature with CRUD operations:

1. **Add table** in `src/lib/db/schema.ts` migration function
2. **Create types** in `src/lib/types/index.ts`
3. **Create validator** in `src/lib/validators/[feature].ts` with Zod schema
4. **Create queries** in `src/lib/queries/[feature].ts` with `mapRow()` function
5. **Create actions** in `src/lib/actions/[feature].ts` with create/update/delete
6. **Create form dialog** in `src/components/[feature]/` as client component
7. **Create page** in `src/app/[feature]/page.tsx` as server component

### Database Migrations

Migrations are **append-only** and **idempotent**:

```typescript
// Check for column existence before adding
const columns = db.prepare("SELECT name FROM pragma_table_info('assets')").all();
const columnNames = columns.map(c => c.name);

if (!columnNames.includes('new_column')) {
  db.exec('ALTER TABLE assets ADD COLUMN new_column TEXT;');
}

// Check for setting existence before inserting
const hasSetting = db.prepare('SELECT key FROM settings WHERE key = ?').get('new_setting');
if (!hasSetting) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('new_setting', 'default');
}
```

**Never use `DROP COLUMN` or `DROP TABLE`** - SQLite doesn't support them well. Add new columns instead.

### Computed Statistics Pattern

All allocations and percentages are **computed on read**, never stored:

```typescript
// Assets have target allocations (user-defined)
const targetAllocation = 0.25; // 25%

// Current allocations are computed from actual values
const totalValue = assets.reduce((sum, a) => sum + a.quantity * a.price, 0);
const currentAllocation = (asset.quantity * asset.price) / totalValue;

// Diffs show how far off target
const allocationDiff = currentAllocation - targetAllocation;
```

This means **no background jobs or updates needed** - stats are always accurate because they're calculated from current data.

### Revalidation Strategy

After mutations, **always revalidate both root and specific paths**:

```typescript
revalidatePath('/');           // Dashboard uses aggregate stats
revalidatePath('/assets');     // Direct page
revalidatePath('/categories'); // If categories affected
```

This ensures all pages show updated data on next render.

### Settings Pattern

Settings stored as key-value pairs:

```typescript
// Reading
const currency = getSetting('currency') || 'BRL';
const autoUpdate = getSetting('auto_update_enabled') === 'true';

// Writing (always convert to string)
await updateSetting('currency', 'USD');
await updateSetting('auto_update_enabled', enabled ? 'true' : 'false');
```

**All setting values are strings** - convert to/from other types as needed.

### Common Gotchas

1. **Multiple forms on one page**: Each form needs its own submit handler. Don't share handlers or you'll get `null` values from the other form's fields.

2. **Settings with NULL constraint**: Always use `value ?? ''` to convert nulls to empty strings before saving to settings table.

3. **Server Component async**: Server components can be async, but query functions are synchronous (direct SQLite calls).

4. **Price update rate limits**: The system automatically adds delays, but external API limits still apply. Test with small datasets first.

5. **Ticker normalization**: Always convert tickers to uppercase before storing: `ticker.toUpperCase()`.

6. **Asset type detection**: Run detection on first price update if `asset_type` is null. Store result to avoid repeated detection.

## Project-Specific Conventions

- **Currency formatting**: Use `formatCurrency()` from `src/lib/utils/currency.ts`
- **Toast notifications**: Use `toast` from `sonner` for all user feedback
- **Button variants**: `default`, `outline`, `ghost`, `destructive` from shadcn/ui
- **Icon library**: `lucide-react` for all icons
- **Form validation**: Zod schemas in `validators/`, not inline validation
- **Error handling**: Return `{ error: string }`, never throw in actions
