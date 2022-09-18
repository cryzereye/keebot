const fs = require('fs');
const fileName = '../json/post.json';
const osFile = './src/json/post.json';
let { post } = require(fileName);
const { serverID, channelID, dev } = require('../json/config.json');

exports.savePostToFile = () => {
  let dataStr = { "post": post }
  fs.writeFile(osFile, JSON.stringify(dataStr), function writeJSON(err) {
    if (err) return console.log(err);
  });
}

exports.new = (postID, newListID, authorID, type, itemrole, have, want, postDate) => {
  let bumpDate = new Date(postDate);
  bumpDate.setTime(postDate.getTime() +  60 * 1000);

  post[postID] = {
    postID: postID,
    newListID: newListID,
    authorID: authorID,
    type: type,
    itemrole: itemrole,
    have: have,
    want: want,
    postDate: new Date(postDate).toString(),
    bumpDate: bumpDate.toString(),
    sold: false,
    soldToID: "",
    soldDate: "",
    deleted: false
  };
  this.savePostToFile();
}

exports.get = (postID) => {
  return post[postID];
}

exports.getAllNeedsBump = () => {
  let postArr = Object.values(post);
  let result = [];
  let len = postArr.length;
  const currDate = new Date();

  for(let i = 0; i < len; i++) {
    if(!postArr[i].sold && !postArr[i].deleted && new Date(postArr[i].bumpDate) < currDate)
      result.push(postArr[i]);
  }
  return result;
}

exports.edit = (postID, have, want, editDate) => {
  post[postID].have = have;
  post[postID].want = want;
  post[postID].editDate = editDate;
  this.savePostToFile();
}

exports.markSold = (postID, soldDate) => {
  post[postID].soldDate = soldDate;
  post[postID].sold = true;
  this.savePostToFile();
}

exports.delete = (postID, deleteDate) => {
  post[postID].deleteDate = deleteDate;
  post[postID].deleted = true;
  this.savePostToFile();
}

exports.bumped = (postID, bumpDate) => {
  post[postID].bumpDate = bumpDate;
  this.savePostToFile();
}

exports.list = (authorID, itemrole) => {
  let records = [];
  let matchedAuthorID;
  let matchedItemRole;
  Object.keys(post).map(x => {
    if(post[x].sold || post[x].deleted) return;
    matchedAuthorID = true;
    matchedItemRole = true;

    if(authorID != null){
      if(post[x].authorID === authorID) matchedAuthorID = true;
      else matchedAuthorID = false;
    }

    if(itemrole != null){
      if(post[x].itemrole === itemrole) matchedItemRole = true;
      else matchedItemRole = false;
    }

    if(matchedAuthorID && matchedItemRole)
      records.push(post[x]);
  });
  return records;
}

/**
 * returns a url corresponding to the given msgid
 * @param {String} channelID: channel ID
 * @param {String} msgid 
 * @returns {String} URL
 */
exports.generateUrl = (channelID, msgid) => {
  return `https://discord.com/channels/${serverID}/${channelID}/${msgid}`;
}

/**
 * returns channel ID corresponding to given type
 * @param {String} type buy/sell/trade
 * @returns {String} channel ID
 */
exports.getChannelFromType = (type) =>{
  if (dev) return channelID.test;
  switch (type) {
    case "buy": return channelID.sell;
    case "sell": return channelID.buy;
    case "trade": return channelID.trade;
  }
}