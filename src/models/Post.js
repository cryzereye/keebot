const fs = require('fs');
const fileName = '../../json/post.json';
const osFile = './json/post.json';
let { post } = require(fileName);
const { channelsID, dev } = require('../../json/config.json');

exports.savePostToFile = () => {
  let dataStr = { "post": post };
  try {
    fs.writeFile(osFile, JSON.stringify(dataStr), function writeJSON(err) {
      if (err) return console.log(err);
    });
  }
  catch (err) {
    console.log(err);
  }
}

exports.new = (postID, newListID, authorID, type, itemrole, have, want, postDate, bumpDate, expiryDate) => {
  post[postID] = {
    postID: postID,
    newListID: [newListID],
    authorID: authorID,
    type: type,
    itemrole: itemrole,
    have: have,
    want: want,
    postDate: new Date(postDate).toString(),
    bumpDate: bumpDate.toString(),
    expiryDate: expiryDate.toString(),
    sold: false,
    soldToID: "",
    soldDate: "",
    deleted: false,
    expired: false
  };
  this.savePostToFile();
}

exports.get = (postID) => {
  return post[postID];
}

exports.getAllNeedsBump = () => {
  let postArr = Object.values(post);
  const currDate = new Date();

  return postArr.filter(post => !post.sold && !post.deleted && !post.expired && new Date(post.bumpDate) < currDate);
}

exports.edit = (postID, have, want, editDate, newListingID) => {
  post[postID].have = have;
  post[postID].want = want;
  post[postID].editDate = editDate;
  post[postID].newListID.push(newListingID);
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

/**
 * sets post's expiry date
 * @param {String} postID 
 * @param {DateString} expiryDate 
 */
exports.setExpiry = (postID, expiryDate) => {
  post[postID].expiryDate = expiryDate;
  this.savePostToFile();
}

/**
 * Marks a post as expired
 * @param {Snowflake} postID 
 */
exports.expired = (postID) => {
  post[postID].expired = true;
  this.savePostToFile();
}

/**
 * Gets postID from associated newListID
 * @param {Snowflake} newListID 
 * @returns {Object} post[]
 */
exports.getPostFromNewListID = (newListID) => {
  let postArr = Object.values(post);
  return postArr.filter((currentPost) => currentPost.newListID.includes(newListID))[0];
} 

exports.list = (authorID, itemrole, type) => {
  let records = [];
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

/**
 * returns a url corresponding to the given msgid
 * @param {String} channelID: channel ID
 * @param {String} msgid 
 * @returns {String} URL
 */
exports.generateUrl = (chid, msgid) => {
  return `https://discord.com/channels/${channelsID.server}/${chid}/${msgid}`;
}

/**
 * returns channel ID corresponding to given type
 * @param {String} type buy/sell/trade
 * @returns {String} channel ID
 */
exports.getChannelFromType = (type) => {
  switch (type) {
    case "buy": return channelsID.buying;
    case "sell": return channelsID.selling;
    case "trade": return channelsID.trading;
  }
}