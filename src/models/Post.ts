import { Snowflake } from "discord.js";
import { TransactionType } from "./enums/TransactionType.js";
import { PostType } from "./types/PostType.js";

import { channelsID } from '../../json/config.json';

export class Post implements PostType {
    postID: Snowflake;
    newListID: Array<Snowflake>;
    authorID: Snowflake;
    type: TransactionType;
    itemrole: Snowflake;
    have: string;
    want: string;
    postDate: Date;
    editDate: Date | undefined;
    bumpDate: Date;
    soldDate: Date | undefined;
    deleteDate: Date | undefined;
    expiryDate: Date;
    isSold: boolean;
    isDeleted: boolean;
    isExpired: boolean;
    URL: string;

    constructor(postID: Snowflake, newListID: Snowflake, authorID: Snowflake, type: TransactionType, itemrole: Snowflake, have: string, want: string, postDate: Date, bumpDate: Date, expireDate: Date) {
        this.postID = postID;
        this.newListID = new Array<Snowflake>();
        this.authorID = authorID;
        this.type = type;
        this.itemrole = itemrole;
        this.have = have;
        this.want = want;
        this.postDate = postDate;
        this.bumpDate = bumpDate;
        this.expiryDate = expireDate;
        this.isSold = false;
        this.isDeleted = false;
        this.isExpired = false;
        this.URL = Post.generateURL(Post.getChannelFromType(type), postID);

        this.newListID.push(newListID);
    }

    edit(have: string, want: string, editDate: Date, newListingID: Snowflake): void {
        this.have = have;
        this.want = want;
        this.editDate = editDate;
        this.newListID.push(newListingID);
    }

    bumped(newDate: Date): void {
        this.bumpDate = newDate;
    }

    delete(): void {
        this.deleteDate = new Date();
        this.isDeleted = true;
    }

    sold(): void {
        this.soldDate = new Date();
        this.isSold = true;
    }

    expire(): void {
        this.isExpired = true;
    }

    static generateURL(chid: Snowflake | undefined, msgid: Snowflake): string {
        return `https://discord.com/channels/${channelsID.server}/${chid}/${msgid}`;
    }

    static getChannelFromType(type: TransactionType): Snowflake {
        switch (type) {
            case TransactionType.buy: return channelsID.buying;
            case TransactionType.sell: return channelsID.selling;
            case TransactionType.trade: return channelsID.trading;
        }
        return channelsID.buying;
    }

    static getTransactionType(type: string | null): TransactionType {
        switch (type) {
            case "buy": return TransactionType.buy;
            case "sell": return TransactionType.sell;
            case "trade": return TransactionType.trade;
        }

        return TransactionType.buy;
    }
}