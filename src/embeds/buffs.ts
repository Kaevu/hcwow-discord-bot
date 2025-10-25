import { EmbedBuilder } from "@discordjs/builders"
import type { Client } from "discord.js";
import { getBuffData } from "../handlers/scraper.js";
import { convertTime } from "../handlers/scraper.js";

export type buildBuffData = {
    type:string,
    date:string
}

const BuffEmojis: Record<string,string> = {
    Rend:"<:Rend:1431474425886412901>",
    Zulgurub:"<:Zulgurub:1431474315387469824>",
    Onyxia:"<:Onyxia:1431474228242157609>"
}
const BuffNames: Record<string, string> = {
    Rend: "Rend Buffs",
    Zulgurub: "ZG Heart",
    Onyxia: "Onyxia Head"
}

export function createBuffEmbed(Buffs: buildBuffData[]) {
    const groupedBuffs: Record<string, string[]> = {};
    
    for (const {type, date} of Buffs) {
        if (!groupedBuffs[type]) {
            groupedBuffs[type] = [];
        }
        groupedBuffs[type].push(`<t:${convertTime(date)}:R>`);
    }
    
    const embed = new EmbedBuilder()
        .setTitle('🐲 World Buff Timers - Doomhowl')
        .setDescription('Next drops in the next 24 hours')
        .setColor(0x5865F2)
        .setFooter({text: "Last Updated"})
        .setTimestamp();
    
    const buffOrder = ['Rend', 'Zulgurub', 'Onyxia'];
    
    for (const type of buffOrder) {
    if (groupedBuffs[type]) {
        embed.addFields({
            name: `${BuffEmojis[type]} ${BuffNames[type]}`,
            value: '━━━━━━━━━━━━━\n' + groupedBuffs[type].map(time => `${time}`).join('\n'),
            inline: true
        });
    }
}
    
    return embed;
}
export async function buildBuffEmbed() {
    const buffs = await getBuffData() as buildBuffData[]
    return createBuffEmbed(buffs)
}