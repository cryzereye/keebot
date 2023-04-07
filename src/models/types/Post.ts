import { Snowflake } from "discord.js";

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
	sold: Boolean,
	deleted: Boolean,
	expired: Boolean
}