const fs = require('fs');
const fileName = '../json/post.json';
const osFile = './src/json/post.json';
let { post } = require(fileName);
const { serverID } = require('../json/config.json');

exports.savePostToFile = () => {
  let dataStr = { "post": post }
  fs.writeFile(osFile, JSON.stringify(dataStr), function writeJSON(err) {
    if (err) return console.log(err);
  });
}

exports.new = (postID, newListID, authorID, type, have, want, postDate) => {
  post[postID] = {
    newListID: newListID,
    authorID: authorID,
    type: type,
    have: have,
    want: want,
    postDate: postDate,
    bumpDate: postDate,
    sold: false,
    soldToID: "",
    soldDate: ""
  };
  this.savePostToFile();
}

exports.get = (postID) => {
  return post[postID];
}

exports.edit = (postID, have, want, editDate) => {
  post[postID].have = have;
  post[postID].want = want;
  post[postID].editDate = editDate;
  this.savePostToFile();
}

exports.markSold = (postID, soldToID, soldDate) => {
  post[postID].soldToID = soldToID;
  post[postID].soldDate = soldDate;
  this.savePostToFile();
}

exports.delete = (postID) => {
  post[postID] == null;
  this.savePostToFile();
}

exports.bumped = (postID, bumpDate) => {
  post[postID].bumpDate = bumpDate;
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