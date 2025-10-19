import { db, dbInit } from './db.js'
import Database from "better-sqlite3";
import type { ParsedToon } from '../api/blizzard.js';
import type { dbResult } from '../handlers/interactions.js';

dbInit();

export type dbToon = ParsedToon & {
    owner_id: string,
}

interface SavedQueries {
    getAllAlive: Database.Statement;
    getAllDead: Database.Statement;
    insertToon: Database.Statement;
    deleteToon: Database.Statement;
    allNames: Database.Statement;
    testAll: Database.Statement;
    checkUpdate: Database.Statement;
    updateToon: Database.Statement;
    setTimeDeath: Database.Statement;
}

export const savedQueries : SavedQueries = {
    getAllAlive: db.prepare('SELECT * FROM characters WHERE is_alive = 1'),
    getAllDead: db.prepare('SELECT * FROM characters WHERE is_alive = 0'),
    insertToon:db.prepare('INSERT INTO characters (name,level,owner_id,class,is_alive) VALUES (?,?,?,?,?)'),
    deleteToon:db.prepare('DELETE FROM characters WHERE name = ?'),
    allNames:db.prepare('SELECT name FROM characters'),
    testAll:db.prepare('SELECT * FROM characters'),
    checkUpdate:db.prepare('SELECT name,level,is_alive FROM characters WHERE name=?'),
    updateToon:db.prepare('UPDATE characters SET level = ?, is_alive = ? WHERE name = ?'),
    setTimeDeath:db.prepare('UPDATE characters SET death_time = ? where name = ?')
};

export function insertToonAPI( toonData: ParsedToon,id: string ) {
    try{
        savedQueries.insertToon.run(toonData.name,toonData.level,id,toonData.class,toonData.is_alive ? 1 : 0);
        return null
    } catch (error:any) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return { error: `A character named **${toonData.name}** already exists.` };
        }
        console.error("DB Error:", error);
        return { error: "An unexpected database error occurred." };
    }
}

export function getCemeteryToons() {
    const dead = savedQueries.getAllDead.all()
    return dead;
};

export function getTrackedToons() {
    const alive = savedQueries.getAllAlive.all()
    return alive;
}

export function deleteToonDB(name:string): dbResult {
    let result = savedQueries.deleteToon.run(name) as dbResult;
    return result;
}
