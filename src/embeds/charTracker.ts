import { EmbedBuilder } from 'discord.js';
import { getTrackedToons } from '../database/queries.js';

type EmbedData = {
    id:number,
    name:string,
    level:number,
    owner_id:string,
    class:string,
    is_alive:boolean,
    death_time: string | null
}

export function createCharEmbed(){
    const aliveToons = getTrackedToons() as EmbedData[];
    const grouped = new Map<string, typeof aliveToons>();
    for (const toon of aliveToons) {
        const list = grouped.get(toon.owner_id) || [];
        list.push(toon);
        grouped.set(toon.owner_id, list);
    }

    for (const [ownerId, toons] of grouped) {
        toons.sort((a, b) => b.level - a.level);
    }
    const fields = [];
    for (const [ownerId, toons] of grouped) {
        const toonList = toons.map(t => `${t.name} (Lvl ${t.level}, ${t.class})`).join('\n');
        fields.push({ name: `<@${ownerId}>`, value: toonList, inline: false });
    }
    return new EmbedBuilder()
        .setTitle('⚔️ Active Hardcore Characters')
        .addFields(fields)
}

export function createCemeteryEmbed(){
    return new EmbedBuilder()
        .setTitle('🪦 Here lies the dead...')
        .addFields()
}
// TODO: setup embed refresh with batchUpdate cronjob, add cemetery functionality,make embed look nicer 

