import { db, dbInit } from './db.js'
import Database from "better-sqlite3";

dbInit();


interface SavedQueries {
    getAllAlive: Database.Statement;
    getAllDead: Database.Statement;
    insertToon: Database.Statement;
    deleteToon: Database.Statement;
}

export const savedQueries : SavedQueries = {
    getAllAlive: db.prepare('SELECT * FROM characters WHERE is_alive = 1'),
    getAllDead: db.prepare('SELECT * FROM characters WHERE is_alive = 0'),
    insertToon:db.prepare('INSERT INTO characters (name,level,owner_id,class) VALUES (?,?,?,?)'),
    deleteToon:db.prepare('DELETE FROM characters WHERE name = ?')
};