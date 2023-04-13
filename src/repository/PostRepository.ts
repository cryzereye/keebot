import { Snowflake } from "discord.js";
import { Post } from "../models/Post.js";
import { TransactionType } from "../models/enums/TransactionType.js";
import { BaseRepository } from "./BaseRepository.js";

export class PostRepository extends BaseRepository {
	cache: Array<Post>;
	constructor() {
		super(`json/post.json`);
		this.cache = <Array<Post>>this.load();
	}

	getAllNeedsBump(): Array<Post> {
		const currDate = new Date();
		return this.cache.filter(post =>
			!post.isSold &&
			!post.isDeleted &&
			!post.isExpired &&
			post.bumpDate &&
			post.bumpDate < currDate);
	}

	getPostFromNewListID(newListID: Snowflake): Post | undefined {
		return this.cache.find(
			(post) => post.newListID.find(id => id === newListID)
		);
	}

	list(authorID: Snowflake, itemrole: Snowflake, type: TransactionType): Array<Post> {
		return this.cache.filter(post =>
			!post.isSold &&
			!post.isDeleted &&
			!post.isExpired &&
			(authorID ? post.authorID === authorID : true) &&
			(itemrole ? post.itemrole === itemrole : true) &&
			(type ? post.type === type : true)
		);
	}

	find(id: Snowflake) {
		return this.cache.find(post => post.postID === id);
	}

	new(post: Post): void {
		this.cache.push(post);
	}

	delete(id: Snowflake): void {
		const record = this.find(id);
		if (record) {
			const index = this.cache.indexOf(record);
			this.cache[index].delete();
		}
	}

	edit(postID: Snowflake, have: string, want: string, editDate: Date, newListingID: Snowflake) {
		const record = this.find(postID);
		if (record) {
			const index = this.cache.indexOf(record);
			this.cache[index].edit(
				have,
				want,
				editDate,
				newListingID
			);
		}
	}
}