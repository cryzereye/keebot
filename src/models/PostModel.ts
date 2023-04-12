import { Snowflake } from "discord.js";
import { TransactionType } from "./enums/TransactionType";
import { Post } from "./types/Post";

import fs from 'fs';
const fileName = '../../json/post.json';
const osFile = './json/post.json';
const { post } = require(fileName);
import { channelsID } from '../../json/config.json';

export function savePostToFile(): void {
  const dataStr = { "post": post };
  try {
    fs.writeFile(osFile, JSON.stringify(dataStr), (err) => {
        if (err)
          return console.log(err);
      });
  }
  catch (err) {
    console.log(err);
  }
}

export function newRecord(postID: Snowflake, newListID: Snowflake, authorID: Snowflake, type: TransactionType, itemrole: Snowflake, have: string, want: string, postDate: string, bumpDate: string, expiryDate: string): void {
  post[postID] = {
    postID: postID,
    newListID: [newListID],
    authorID: authorID,
    type: type,
    itemrole: itemrole,
    have: have,
    want: want,
    postDate: postDate,
    bumpDate: bumpDate,
    expiryDate: expiryDate,
    sold: false,
    soldToID: "",
    soldDate: "",
    deleted: false,
    expired: false
  };
  savePostToFile();
}

export function get(postID: Snowflake): Post {
  return post[postID];
}

export function getAllNeedsBump(): Post[] {
  const postArr: Post[] = Object.values(post);
  const currDate = new Date();

  return postArr.filter(post => !post.sold && !post.deleted && !post.expired && new Date(post.bumpDate) < currDate);
}

export function edit(postID: Snowflake, have: string, want: string, editDate: string, newListingID: Snowflake): void {
  post[postID].have = have;
  post[postID].want = want;
  post[postID].editDate = editDate;
  post[postID].newListID.push(newListingID);
  savePostToFile();
}

export function markSold(postID: Snowflake, soldDate: string): void {
  post[postID].soldDate = soldDate;
  post[postID].sold = true;
  savePostToFile();
}

export function deletes(postID: Snowflake, deleteDate: string): void {
  post[postID].deleteDate = deleteDate;
  post[postID].deleted = true;
  savePostToFile();
}

export function bumped(postID: Snowflake, bumpDate: string): void {
  post[postID].bumpDate = bumpDate;
  savePostToFile();
}

export function setExpiry(postID: Snowflake, expiryDate: string): void {
  post[postID].expiryDate = expiryDate;
  savePostToFile();
}

export function expired(postID: Snowflake): void {
  post[postID].expired = true;
  savePostToFile();
}

export function getPostFromNewListID(newListID: Snowflake): Post {
  const postArr: Post[] = Object.values(post);
  return postArr.filter((currentPost: Post) => currentPost.newListID.includes(newListID))[0];
}

export function list(authorID: Snowflake, itemrole: Snowflake, type: TransactionType): Post[] {
  const records: Post[] = [];
  let matchedAuthorID;
  let matchedItemRole;
  let matchedType;
  Object.keys(post).map(x => {
    if (post[x].sold || post[x].deleted || post[x].expired) return;
    matchedAuthorID = true;
    matchedItemRole = true;
    matchedType = true;

    if (authorID) {
      if (post[x].authorID === authorID) matchedAuthorID = true;
      else matchedAuthorID = false;
    }

    if (itemrole) {
      if (post[x].itemrole === itemrole) matchedItemRole = true;
      else matchedItemRole = false;
    }

    if (type) {
      if (post[x].type === type) matchedType = true;
      else matchedType = false;
    }

    if (matchedAuthorID && matchedItemRole && matchedType)
      records.push(post[x]);
  });
  return records;
}

export function generateUrl(chid: Snowflake, msgid: Snowflake): string {
  return `https://discord.com/channels/${channelsID.server}/${chid}/${msgid}`;
}

export function getChannelFromType(type: TransactionType): string {
  switch (type) {
    case TransactionType.buy: return channelsID.buying;
    case TransactionType.sell: return channelsID.selling;
    case TransactionType.trade: return channelsID.trading;
  }
}