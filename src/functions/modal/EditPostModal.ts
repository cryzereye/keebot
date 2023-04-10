import { ActionRowBuilder, Snowflake, TextInputBuilder } from 'discord.js';
import { BasePostModal } from './BasePostModal';

class EditPostModal extends BasePostModal {
    constructor(type: TransactionType, postID: Snowflake, have: string, want: string){
        super();
        const components: Array<ActionRowBuilder<TextInputBuilder>> = this.buildBaseComponents(type, have, want);
        this.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(this.buildPostIDField(postID)));
        this.setCustomId("editPostModal").setTitle("Editing your post...");
        this.addComponents(components);
    }
}

module.exports = { EditPostModal }