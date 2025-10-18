import 'dotenv/config';
import { savedQueries } from '../database/queries.js';
import type { dbToon } from '../database/queries.js';


export type ParsedToon = {
    name: string,
    level: number,
    class: string,
    is_alive: boolean,
};

export type ToonListNames = {
    name:string
}

let accessToken: string | null = null;
let expiry: number = 0;

async function getAccessToken():Promise<string | null> {
    const client_id = process.env.BLIZZARD_CLIENT_ID!;
    const client_secret = process.env.BLIZZARD_CLIENT_SECRET!;
    const url = 'https://oauth.battle.net/token';
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(`${client_id}:${client_secret}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            throw new Error(`${response.status}`)
        }
        const grabbedToken:string = (await response.json()).access_token;
        return grabbedToken;
    } catch (error) {
        console.log('token error')
        return null
    }
}

async function getValidToken(): Promise<string | null> {
    const now = Date.now();
    if (accessToken && expiry && now < expiry) {
        return accessToken;
    }
    const token = await getAccessToken();
    if (token) {
        accessToken = token;
        expiry = now + 24 * 60 * 60 * 1000; 
    }
    return token;
}

export async function getCharData(toonName:string) {
    const token = await getValidToken();
    if (!token) return null
    const url = `https://us.api.blizzard.com/profile/wow/character/doomhowl/${toonName}?namespace=profile-classic1x-us`;
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            throw new Error(`${response.status}`)
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('charData error:', error)
        return null
    }
}

export async function getValidParsedToon(toonName: string) {
    const data = await getCharData(toonName);
    if (!data) return null;
    const toon : ParsedToon = {
        name:data.name,
        level:data.level,
        class:data.character_class.name.en_US,
        is_alive:!data.is_ghost
    }
    return toon;
}

export async function batchUpdate() {
    let listToonNames = savedQueries.getAllAlive.all() as ToonListNames[];
    let toonDataArray: (ParsedToon | null)[] = [];
    for (const { name } of listToonNames) {
        try {
            const toon = await getValidParsedToon(name.toLowerCase())
            toonDataArray.push(toon)
        } catch(error:any) {
            console.log(`Failed to fetch ${name}: ${error.message}`);
        }
    }
    for (const toon of toonDataArray) {
        const dbData = savedQueries.checkUpdate.get(toon?.name) as dbToon;
        const toonAlive = toon?.is_alive ? 1 : 0;
        const dbAlive = dbData.is_alive ? 1 : 0;

        if (toon?.level !== dbData.level || toonAlive !== dbAlive) {
            savedQueries.updateToon.run(toon?.level,toon?.is_alive ? 1 : 0,toon?.name)
            if (toon?.is_alive !== dbData.is_alive) {
                const formattedDate = new Date().toLocaleDateString("en-US", {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                });
                savedQueries.setTimeDeath.run(formattedDate,toon?.name)
            }
        }
    }

}


// accessToken = await getAccessToken();
// console.log(accessToken)
// //make sure name is all lowercase
// let toonData = await getCharData('evildusky');

// console.log(toonData)