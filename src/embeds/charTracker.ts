import { EmbedBuilder } from 'discord.js';

export function createCharEmbed(){
    return new EmbedBuilder()
        .setTitle('⚔️ Active Hardcore Characters')
        .addFields()
}

export function createCemeteryEmbed(){
    return new EmbedBuilder()
        .setTitle('🪦 Here lies the dead...')
        .addFields()
}


