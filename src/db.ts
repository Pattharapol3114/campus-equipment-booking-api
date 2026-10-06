import Database from 'better-sqlite3';

export const db = new Database('sqlite.db');

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS equipment (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      equipmentId TEXT NOT NULL,
      borrowerName TEXT NOT NULL,
      startAt TEXT NOT NULL,
      endAt TEXT NOT NULL,
      purpose TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (equipmentId) REFERENCES equipment(id)
    );
  `);

  const stmt = db.prepare('INSERT OR IGNORE INTO equipment (id, name, location) VALUES (?, ?, ?)');
  stmt.run('eq-1', 'Projector A', 'Building 1');
  stmt.run('eq-2', 'Camera Sony A7', 'Media Lab Room 2');
}