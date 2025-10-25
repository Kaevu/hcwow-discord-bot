import { EmbedBuilder } from 'discord.js';
import { getTrackedToons, getCemeteryToons } from '../database/queries.js';
import type { Client } from 'discord.js';

type EmbedData = {
    id:number,
    name:string,
    level:number,
    owner_id:string,
    class:string,
    is_alive:boolean,
    death_time: string | null
}

const classEmojis: Record<string,string> = {
    Warrior:"<:Warrior:1426078664889733190>",
    Mage:"<:Mage:1426078735043526716>",
    Paladin:"<:Paladin:1426078772825952377>",
    Hunter:"<:Hunter:1426078716370354268>",
    Druid:"<:Druid:1426078562313572494>",
    Rogue:"<:Rogue:1426078116454989877>",
    Warlock:"<:Warlock:1426078626780024863>",
    Priest:"<:Priest:1426078644123471945>",
    Shaman:"<:Shaman:1426078687551553536>"
}



export function createCharEmbed(groupedToons: Map<string, { username: string, toons: any[] }>) {
    const totalChars = Array.from(groupedToons.values())
        .reduce((sum, { toons }) => sum + toons.length, 0);
    const totalPlayers = groupedToons.size;
   
    const embed = new EmbedBuilder()
        .setTitle('⚔️ Active Hardcore Characters')
        .setDescription(`**Active Players:** ${totalPlayers}  |  **Characters:** ${totalChars}`)
        .setColor('#DC143C')
        .setFooter({ text: "Last Updated" })
        .setTimestamp();
   
    for (const [ownerId, { username, toons }] of groupedToons) {
        const toonList = toons
            .map(t => `${classEmojis[t.class] || ""} Lvl ${t.level} • ${t.name}`)
            .join('\n');
       
        embed.addFields({
            name: `👤 ${username} (${toons.length})`,
            value: `─────────────────\n${toonList}`,
            inline: true
        });
       
    }
   
    return embed;
}


export async function buildCharEmbed(client: Client) {
  const aliveToons = getTrackedToons() as EmbedData[];
  aliveToons.sort((a, b) => b.level - a.level);

  const grouped = new Map();
  for (const toon of aliveToons) {
    if (!grouped.has(toon.owner_id)) grouped.set(toon.owner_id, []);
    grouped.get(toon.owner_id).push(toon);
  }

  const groupedWithNames = new Map();
  for (const [ownerId, toons] of grouped.entries()) {
    let username = 'Unknown User';
    try {
      const guild = client.guilds.cache.get('326914414488059914');
      if(guild) {
        const member = await guild.members.fetch(ownerId);
        username = member.nickname || member.user.username;
      }
    } catch (e) {
      console.warn(`Could not fetch user ${ownerId}:`, e);
    }

    groupedWithNames.set(ownerId, { username, toons });
  }
  return createCharEmbed(groupedWithNames);
}

export async function buildCemeteryEmbed(client: Client) {
  const deadToons = getCemeteryToons() as EmbedData[];
  deadToons.sort((a, b) => b.level - a.level);

  const grouped = new Map<string, EmbedData[]>();
  for (const toon of deadToons) {
    if (!grouped.has(toon.owner_id)) grouped.set(toon.owner_id, []);
    grouped.get(toon.owner_id)!.push(toon);
  }

  const groupedWithNames = new Map<string, { username: string; toons: EmbedData[] }>();
  for (const [ownerId, toons] of grouped.entries()) {
    let username = 'Unknown User';
    try {
      const guild = client.guilds.cache.get('326914414488059914');
      if (guild) {
        const member = await guild.members.fetch(ownerId);
        username = member.nickname || member.user.username;
      }
    } catch (e) {
      console.warn(`Could not fetch user ${ownerId}:`, e);
    }

    groupedWithNames.set(ownerId, { username, toons });
  }

  return createCemeteryEmbed(groupedWithNames || new Map());
}

export function createCemeteryEmbed(
  groupedToons: Map<string, { username: string; toons: any[] }>
) {
  const totalChars = Array.from(groupedToons.values())
    .reduce((sum, { toons }) => sum + toons.length, 0);
  const totalPlayers = groupedToons.size;

  const embed = new EmbedBuilder()
    .setTitle('🪦 The Cemetery')
    .setDescription(`👥 ${totalPlayers} Players • ⚰️ ${totalChars} Fallen Characters`)
    .setColor('#555555')
    .setFooter({ text: "Last Updated" })
    .setTimestamp();

  for (const [ownerId, { username, toons }] of groupedToons) {
    const toonList = toons
      .map(t => `${classEmojis[t.class] || ""} Lvl ${t.level} • ${t.name}`)
      .join('\n');

    embed.addFields({ name: `💀 ${username} (${toons.length})`, value: toonList, inline: false });
  }

  return embed;
}
// TODO:add cemetery functionality,make embed look nicer 

