// Minimal sql.js wrapper for Neutralino filesystem persistence
let SQL: any;
let db: any | null = null;
let lastPersist = 0;

async function ensureSqlModule() {
  if (SQL) return SQL;
  // sql.js wasm 与 js 需在 app 依赖中配置拷贝，或使用 CDN；这里假设全局可 import
  // @ts-ignore
  SQL = await import('sql.js');
  return SQL;
}

export async function openDatabase(path = './data/db/app.db'): Promise<any> {
  if (db) return db;
  await ensureSqlModule();
  try {
    const bytes = await Neutralino.filesystem.readBinaryFile(path);
    db = new SQL.Database(new Uint8Array(bytes));
  } catch {
    db = new SQL.Database();
    migrate();
    await flushDatabase(path);
  }
  return db;
}

export function migrate() {
  if (!db) return;
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts(
      id TEXT PRIMARY KEY,
      name TEXT,
      tags TEXT,
      cookie_enc TEXT,
      verified_at TEXT,
      status TEXT
    );
    CREATE TABLE IF NOT EXISTS proxies(
      id TEXT PRIMARY KEY,
      url TEXT,
      score REAL,
      latency_ms INTEGER,
      fail_count INTEGER,
      alive INTEGER,
      last_checked_at TEXT
    );
    CREATE TABLE IF NOT EXISTS listen_rules(
      id TEXT PRIMARY KEY,
      name TEXT,
      query_json TEXT,
      freq_s INTEGER,
      last_cursor TEXT,
      enabled INTEGER
    );
    CREATE TABLE IF NOT EXISTS events(
      id TEXT PRIMARY KEY,
      type TEXT,
      payload_json TEXT,
      created_at TEXT
    );
  `);
}

export async function flushDatabase(path = './data/db/app.db') {
  if (!db) return;
  const now = Date.now();
  if (now - lastPersist < 2000) return; // 简单限频
  const data = db.export();
  await Neutralino.filesystem.writeBinaryFile(path, data);
  lastPersist = now;
}

export async function readJson(path: string, fallback: any) {
  try { const text = await Neutralino.filesystem.readFile(path); return JSON.parse(text); }
  catch { return fallback; }
}

export async function writeJson(path: string, obj: any) {
  const text = JSON.stringify(obj, null, 2);
  await Neutralino.filesystem.writeFile(path, text);
}
