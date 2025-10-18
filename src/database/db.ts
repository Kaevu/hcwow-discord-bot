import Database from "better-sqlite3";

export const db: Database.Database = new Database('./data/bot.db')


export function dbInit(){
db.exec(`
    CREATE TABLE IF NOT EXISTS characters(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        level INTEGER,
        owner_id TEXT NOT NULL,
        class TEXT NOT NULL,
        is_alive BOOLEAN DEFAULT 1,
        death_time TEXT
      );

    CREATE TABLE IF NOT EXISTS messageTracker(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id TEXT,
    message_id TEXT,
    last_updated TEXT
    );
`);
}