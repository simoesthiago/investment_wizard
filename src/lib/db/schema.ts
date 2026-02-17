import type Database from 'better-sqlite3';

export function runMigrations(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      icon TEXT,
      target_allocation REAL NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      ticker TEXT NOT NULL,
      name TEXT,
      quantity REAL NOT NULL DEFAULT 0,
      price REAL NOT NULL DEFAULT 0,
      target_allocation REAL NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(category_id, ticker)
    );

    CREATE TABLE IF NOT EXISTS snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      total_value REAL NOT NULL,
      total_invested REAL NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS snapshot_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      snapshot_id INTEGER NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      value REAL NOT NULL,
      allocation_pct REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dca_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      asset_id INTEGER REFERENCES assets(id) ON DELETE SET NULL,
      frequency TEXT NOT NULL DEFAULT 'weekly',
      amount REAL NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS dca_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL REFERENCES dca_plans(id) ON DELETE CASCADE,
      scheduled_date TEXT NOT NULL,
      amount REAL NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Insert default settings if not present
  const existing = db.prepare('SELECT key FROM settings WHERE key = ?').get('currency');
  if (!existing) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('currency', 'BRL');
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('dollar_rate', '5.08');
  }

  // Migration: Add price update columns to assets table
  const columns = db.prepare("SELECT name FROM pragma_table_info('assets')").all() as { name: string }[];
  const columnNames = columns.map(c => c.name);

  if (!columnNames.includes('last_price_update')) {
    db.exec(`
      ALTER TABLE assets ADD COLUMN last_price_update TEXT;
      ALTER TABLE assets ADD COLUMN price_source TEXT;
      ALTER TABLE assets ADD COLUMN asset_type TEXT;
    `);
  }

  // Add price update settings if not present
  const hasInterval = db.prepare('SELECT key FROM settings WHERE key = ?').get('price_update_interval');
  if (!hasInterval) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('alpha_vantage_api_key', '');
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('price_update_interval', '15');
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('auto_update_enabled', 'true');
  }
}
