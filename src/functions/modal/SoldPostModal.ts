import { ActionRowBuilder, Snowflake, TextInputBuilder } from 'discord.js';
import { TransactionType } from '../../models/enums/TransactionType';
import { BasePostModal } from './BasePostModal';

export class SoldPostModal extends BasePostModal {
    constructor(type: TransactionType, postID: Snowflake, have: string, want: string) {
        super();
        const components: Array<ActionRowBuilder<TextInputBuilder>> = this.buildBaseComponents(type, have, want);
        this.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(this.buildPostIDField(postID)));
        this.setCustomId("soldPostModal").setTitle("Confirm as SOLD?");
        this.addComponents(components);
    }
}