import { Snowflake } from "discord.js";
import { Post } from "../models/Post.js";
import { TransactionType } from "../models/enums/TransactionType.js";
import { BaseRepository } from "./BaseRepository.js";

export class PostRepository extends BaseRepository {
	cache: Post[];
	constructor() {
		super(`json/post.json`);
		this.cache = <Post[]>this.load();
	}

	getAllNeedsBump(): Post[] {
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

	list(authorID: Snowflake, itemrole: Snowflake, type: TransactionType): Post[] {
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
}