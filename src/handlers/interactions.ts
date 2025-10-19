import { 
         ActionRowBuilder, 
         Events, 
         ModalBuilder, 
         Client, 
         TextInputBuilder,
         TextInputStyle,
} from 'discord.js';

import type {
    ModalActionRowComponentBuilder
}  from 'discord.js'

import { buildCemeteryEmbed } from '../embeds/charTracker.js'
import { deleteToonDB, insertToonAPI } from '../database/queries.js';
import { getValidParsedToon } from '../api/blizzard.js'
import { refreshCharEmbed } from '../index.js'

export type dbResult = {
    changes:number;
    lastInsertRowid:number;
};


export function setupInteractions(client: Client) {
    client.on(Events.InteractionCreate, async(interaction) => {
        if (interaction.isButton()){
            if (interaction.customId === 'addCharacter'){
                const modal = new ModalBuilder().setCustomId('addModal').setTitle('Add Character')
                const toonNameInput = new TextInputBuilder()
                    .setCustomId('toonNameInput')
                    .setLabel('Enter Toon Name')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('e.g. Rhukos')
                    .setRequired(true);
                const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(toonNameInput);
                modal.addComponents(row)
                await interaction.showModal(modal)
            }
            if (interaction.customId === 'deleteCharacter'){
                const modal = new ModalBuilder().setCustomId('deleteModal').setTitle('Remove Character')
                const toonNameInput = new TextInputBuilder()
                    .setCustomId('toonNameInput')
                    .setLabel('Enter Toon Name')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('e.g. Rhukos')
                    .setRequired(true);
                const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(toonNameInput);
                modal.addComponents(row)
                await interaction.showModal(modal)
            }
            if (interaction.customId === 'viewDead'){
                const cemetery = await buildCemeteryEmbed(client);
                await interaction.reply({
                    embeds: [cemetery],
                    ephemeral: true
                })
            }
        }
        if (interaction.isModalSubmit()) {
            if(interaction.customId === 'addModal'){
                const toonName = (interaction.fields.getTextInputValue('toonNameInput')).toLowerCase();
                await interaction.deferReply({ephemeral:true});
                // console.log(toonName);
                // savedQueries.insertToon.run(toonName,5,interaction.user.id,'Paladin');
                let toonData = await getValidParsedToon(toonName);
                if (!toonData) {
                    await interaction.editReply({ content: `Error: Could not add character: ${toonName} ❌` });
                } else {
                    const result = await insertToonAPI(toonData,interaction.user.id);
                    if (result && result.error) {
                        await interaction.editReply({ content: `Error: ${result.error} ❌` });
                        return;
                    }
                    await refreshCharEmbed(client);
                    await interaction.editReply({ content: `Added character: ${toonName} ✅` });
                }
            }
            if(interaction.customId === 'deleteModal'){
                const toonName = (interaction.fields.getTextInputValue('toonNameInput'))
                await interaction.deferReply({ephemeral:true});
                let result = deleteToonDB(toonName) as dbResult;
                if (result.changes === 1){
                    await interaction.editReply("Character deleted successfully");
                    await refreshCharEmbed(client);
                } else {
                    await interaction.editReply("No Character found")
                }
            }
        }
})
}