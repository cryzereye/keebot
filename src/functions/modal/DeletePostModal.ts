import { ActionRowBuilder, Snowflake, TextInputBuilder } from 'discord.js';
import * as TransactionType from '../../models/enums/TransactionType.js';
import * as BasePostModal from './BasePostModal.js';

export class DeletePostModal extends BasePostModal.BasePostModal {
    constructor(type: TransactionType.TransactionType, postID: Snowflake, have: string, want: string) {
        super();
        const components: Array<ActionRowBuilder<TextInputBuilder>> = this.buildBaseComponents(type, have, want);
        this.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(this.buildPostIDField(postID)));
        this.setCustomId("deletePostModal").setTitle("Confirm delete post?");
        this.addComponents(components);
    }
}