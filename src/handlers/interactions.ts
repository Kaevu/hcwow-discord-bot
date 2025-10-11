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

import { createCemeteryEmbed} from '../embeds/charTracker.js'
import { savedQueries } from '../database/queries.js';
import { db } from '../database/db.js';


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
                const cemetery = createCemeteryEmbed()
                await interaction.reply({
                    embeds: [cemetery],
                    ephemeral: true
                })
            }
        }
        if (interaction.isModalSubmit()) {
            if(interaction.customId === 'addModal'){
                const toonName = interaction.fields.getTextInputValue('toonNameInput')
                console.log(toonName);
                savedQueries.insertToon.run(toonName,5,interaction.user.id,'Paladin');
                // Call blizzard api to check for valid toon
                await interaction.deferReply({ephemeral:true});
                // await interaction.editReply({ content: `Added character: ${result.name} ✅` });
                // await interaction.editReply({ content: `Error: Could not add character: ${result.name} ❌` });
            }
            
        }
})
}