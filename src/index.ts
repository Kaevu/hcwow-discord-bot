import { Client, Events, GatewayIntentBits} from 'discord.js';
import 'dotenv/config';
import { createCharEmbed} from './embeds/charTracker.js'
import { createCharButtons } from './components/button.js';
import { setupInteractions } from './handlers/interactions.js';
import cron from 'node-cron';

import { dbInit } from './database/db.js';
dbInit();

import { batchUpdate } from './api/blizzard.js';
import { getTrackedToons, savedQueries } from './database/queries.js';

cron.schedule('0 * * * *', async() => {
    console.log('Running Scheduled batchUpdate...');
    try {
        await batchUpdate();
        console.log('batchUpdate completed successfully.');
    } catch (err) {
        console.error('Error running batchUpdate:', err);
    }
});
// // let rows = savedQueries.testAll.all();
// // console.log(db.prepare("SELECT * FROM characters WHERE name = ?").get("Beeni"));
// // const resetDeathTimes = db.prepare('UPDATE characters SET death_time = NULL');
// // resetDeathTimes.run();

// // savedQueries.updateToon.run(14,1,'Beeni');
// let yaga = batchUpdate();
console.log(getTrackedToons());


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