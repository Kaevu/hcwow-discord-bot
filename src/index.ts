import { Client, Events, GatewayIntentBits} from 'discord.js';
import 'dotenv/config';
import { createCharEmbed} from './embeds/charTracker.js'
import { createCharButtons } from './components/button.js';
import { setupInteractions } from './handlers/interactions.js';

import { dbInit } from './database/db.js';
dbInit();

import { savedQueries } from './database/queries.js';
savedQueries.insertToon.run('TestChar', 45, '123456', 'Warrior')
const alive = savedQueries.getAllAlive.all()
console.log(alive)
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const token = process.env.DISCORD_TOKEN!;
const buttons = createCharButtons();
setupInteractions(client)

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    const channelId = '1422440492066541660';
    const channel = client.channels.cache.get(channelId);
    if (channel?.isSendable()) {
        const embed = createCharEmbed();
        await channel.send({ embeds: [embed], components:[buttons]})
        
    }
});

client.login(token);