import { Snowflake } from "discord.js";
import { TransactionType } from "../enums/TransactionType.js";

export type Post = {
	postID: Snowflake,
	newListID: Array<Snowflake>,
	authorID: Snowflake,
	type: TransactionType,
	itemrole: Snowflake,
	have: string,
	want: string,
	postDate: string,
	bumpDate: string,
	soldDate: string,
	deleteDate: string,
	expiryDate: string,
	sold: boolean,
	deleted: boolean,
	expired: boolean
}