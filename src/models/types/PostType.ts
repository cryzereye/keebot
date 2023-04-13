import { Snowflake } from "discord.js";
import { TransactionType } from "../enums/TransactionType.js";

export type PostType = {
	postID: Snowflake,
	newListID: Array<Snowflake>,
	authorID: Snowflake,
	type: TransactionType,
	itemrole: Snowflake,
	have: string,
	want: string,
	postDate: Date,
	editDate: Date | undefined,
	bumpDate: Date | undefined,
	soldDate: Date | undefined,
	deleteDate: Date | undefined,
	expiryDate: Date,
	isSold: boolean,
	isDeleted: boolean,
	isExpired: boolean,
	URL: string
}