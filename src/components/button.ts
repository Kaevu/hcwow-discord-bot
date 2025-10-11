import { ButtonBuilder, 
         ButtonStyle, 
         ActionRowBuilder
} from 'discord.js';


export function createCharButtons() {
    const addButton = new ButtonBuilder()
        .setCustomId('addCharacter')
        .setLabel('✅ Add Character')
        .setStyle(ButtonStyle.Primary)
    
    const deleteButton = new ButtonBuilder()
        .setCustomId('deleteCharacter')
        .setLabel('🗑️ Delete Character')
        .setStyle(ButtonStyle.Danger)

    const viewDeadButton = new ButtonBuilder()
        .setCustomId('viewDead')
        .setLabel('🪦 View Cemetery')
        .setStyle(ButtonStyle.Secondary)

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(addButton, deleteButton, viewDeadButton);
    return row
}

