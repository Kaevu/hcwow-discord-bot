import 'dotenv/config';
import { Client, Events, GatewayIntentBits} from 'discord.js';
import { buildCharEmbed} from './embeds/charTracker.js'
import { createCharButtons } from './components/button.js';
import { setupInteractions } from './handlers/interactions.js';
import cron from 'node-cron';
import type { Message } from 'discord.js';
import { dbInit } from './database/db.js';
import { getBuffData } from './handlers/scraper.js'
import { buildBuffEmbed } from './embeds/buffs.js';
dbInit();

import { batchUpdate } from './api/blizzard.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMembers]});
const token = process.env.DISCORD_TOKEN!;
const buttons = createCharButtons();
const CHAR_MESSAGE_ID = '1431209180840333313';
const BUFFS_MESSAGE_ID = '1431494217120747520';
setupInteractions(client)
let charEmbedMessage: Message | null = null;
let buffsEmbedMessage: Message | null = null;

export async function refreshCharEmbed(client: Client) {
     if (!charEmbedMessage) return;
    const newEmbed = await buildCharEmbed(client);
    await charEmbedMessage.edit({ embeds: [newEmbed] });
}
export async function refreshBuffsEmbed() {
    if (!buffsEmbedMessage) return;
    const newEmbed = await buildBuffEmbed();
    await buffsEmbedMessage.edit({embeds:[newEmbed]})
}


client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    const channelId = '1422440492066541660';
    const channel = client.channels.cache.get(channelId);
    if (channel?.isSendable()) {
        if (CHAR_MESSAGE_ID) {
            try {
                charEmbedMessage = await channel.messages.fetch(CHAR_MESSAGE_ID);
                console.log('Found existing char embed');
            } catch {
                console.log('Char message not found');
            }
        }
        if (!charEmbedMessage) {
            const embed = await buildCharEmbed(client);
            charEmbedMessage= await channel.send({ embeds: [embed], components:[buttons], allowedMentions:{users:[]}})
        }
        if (BUFFS_MESSAGE_ID) {
            try {
                buffsEmbedMessage = await channel.messages.fetch(BUFFS_MESSAGE_ID);
                console.log('Found existing buffs embed');
            } catch {
                console.log('Buffs message not found');
            }
        }
        if (!buffsEmbedMessage) {
            const buffsEmbed = await buildBuffEmbed();
            buffsEmbedMessage = await channel.send({ embeds:[buffsEmbed]});
        }
    }
});

client.login(token);

cron.schedule('0 * * * *', async() => {
    console.log('Running Scheduled batchUpdate...');
    try {
        await batchUpdate();
        await refreshCharEmbed(client);
        console.log('batchUpdate completed successfully.');
    } catch (err) {
        console.error('Error running batchUpdate:', err);
    }
});

cron.schedule('30 0 * * *', async() => {
    console.log('Getting buff timers...');
    await refreshBuffsEmbed();
    try {
        await getBuffData()
    } catch (error) {
        console.error('Error running buff timers:', error);
    }
})