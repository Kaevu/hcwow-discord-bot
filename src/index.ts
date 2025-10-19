import 'dotenv/config';
import { Client, Events, GatewayIntentBits} from 'discord.js';
import { buildCharEmbed} from './embeds/charTracker.js'
import { createCharButtons } from './components/button.js';
import { setupInteractions } from './handlers/interactions.js';
import cron from 'node-cron';
import type { Message } from 'discord.js';
import { dbInit } from './database/db.js';
dbInit();

import { batchUpdate } from './api/blizzard.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMembers]});
const token = process.env.DISCORD_TOKEN!;
const buttons = createCharButtons();
setupInteractions(client)
let charEmbedMessage: Message | null = null;

export async function refreshCharEmbed(client: Client) {
     if (!charEmbedMessage) return;
    const newEmbed = await buildCharEmbed(client);
    await charEmbedMessage.edit({ embeds: [newEmbed] });
}


client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    const channelId = '1422440492066541660';
    const channel = client.channels.cache.get(channelId);
    if (channel?.isSendable()) {
        const embed = await buildCharEmbed(client);
        charEmbedMessage= await channel.send({ embeds: [embed], components:[buttons], allowedMentions:{users:[]}})
        
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